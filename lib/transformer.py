import ast
import pathlib
import typing as T
from itertools import zip_longest

import jinja2
import tap

template_body = """
interface Boundary {
    remote: (method_name:string, ...args:unknown[])=> Promise<unknown>
}

class APIBridge {
    boundary:Boundary

    constructor(boundary:Boundary) {
        this.boundary = boundary
    }
{% for func_name, func_def in functions|items() -%}
{%if func_def.doc %}/* {{func_def.doc}} */{% endif%}
    {{ func_name }}({{func_def.compiled|join(', ')}}){%if func_def.return_type %}:Promise<{{func_def.return_type}}>{% endif %} {
        {% if func_def.arg_names|length >= 2 -%}
        return this.boundary.remote('{{ func_name }}', {{func_def.arg_names|join(', ')}}) as {%if func_def.return_type %}Promise<{{func_def.return_type}}>{%else%}Promise<void>{% endif %}
        {%- elif func_def.arg_names|length == 1 -%}
        return this.boundary.remote('{{ func_name }}', {{func_def.arg_names[0]}}) as {%if func_def.return_type %}Promise<{{func_def.return_type}}>{%else%}Promise<void>{% endif %}
        {%- else -%}
        return this.boundary.remote('{{ func_name }}') as {%if func_def.return_type %}Promise<{{func_def.return_type}}>{%else%}Promise<void>{% endif %}
        {%- endif %}
    }
{%- endfor %}
}

export default APIBridge

"""


class FuncArg(T.NamedTuple):
    name: T.Optional[ast.expr]
    annotype: T.Optional[str] = None


class FuncDef(T.NamedTuple):
    args: T.List[FuncArg]
    doc: T.Optional[str]
    compiled: T.List[str]
    arg_names: T.List[str]
    return_type: T.Optional[str]


def python2ts_types(typename: str | None) -> str:
    match typename:
        case "str":
            return "string"
        case "int":
            return "number"
        case "float":
            return "number"
        case "bool":
            return "boolean"
        case None:
            return "undefined"
        case _:
            return typename


def process_source(
    src_file: pathlib.Path | str,
    dest: pathlib.Path | None = None,
    header: pathlib.Path | None = None,
    product_template: str = template_body,
) -> str:
    if isinstance(src_file, pathlib.Path):
        module = ast.parse(src_file.read_text(), src_file.name, mode="exec")
    else:
        module = ast.parse(src_file, "raw_source.py", mode="exec")

    body = []

    for element in module.body:
        if isinstance(element, ast.ClassDef) and element.name == "API":
            payload = process_class(element)
            clsbody = transform(payload, product_template)
            body.append(clsbody)
            break  # for now process only the first class in source

    product = "\n\n\n\n".join(body)

    if header is not None and header.is_file():
        product = header.read_text() + product

    if dest is not None:
        dest.write_text(product, newline="\n")

    return product


def process_class(class_elm: ast.ClassDef) -> tuple[str, dict[str, FuncDef]]:
    cls_name = class_elm.name
    functions = {}
    for element in class_elm.body:
        if isinstance(element, ast.FunctionDef):
            if element.name.startswith("__"):
                continue

            functions[element.name] = process_function(element)

    return cls_name, functions


def py2ts_value(something):
    if isinstance(something, str):
        return f"'{something}'"
    elif isinstance(something, bool):
        return "true" if something is True else "false"
    else:
        return repr(something)


def sanitize_defaults(def_type):
    if def_type in [None, "None", "'None'"]:
        return "undefined"

    return def_type


def process_function(func_elm: ast.FunctionDef) -> FuncDef:
    # unit tests... we don't need no stinking unit tests!
    # beeline for the args

    arg_map = dict()

    definition = FuncDef(
        process_args(func_elm.args.args),
        ast.get_docstring(func_elm),
        [],
        [],
        process_returntype(func_elm),
    )

    mapped_defaults = dict()

    # does the function have default arguments?
    if len(func_elm.args.defaults) > 0:
        names = [arg.arg for arg in func_elm.args.args]
        names.reverse()
        try:
            defaults = []
            for idx, elm in enumerate(func_elm.args.defaults):
                val = py2ts_value(process_default_argument(elm))
                defaults.append(val)

            # defaults = [py2ts_value(elm.value) for elm in func_elm.args.defaults]
        except AttributeError:
            print(f"Unable to process {func_elm} with {func_elm.args}")
            raise

        defaults.reverse()
        married = list(zip_longest(names, defaults))
        married.reverse()
        mapped_defaults = dict(married)

    for arg in func_elm.args.args:  # type: ast.arg
        if arg.arg == "self":
            continue

        definition.arg_names.append(arg.arg)

        func_name = func_elm.name
        func_type = "any"
        arg_def = func_elm

        if isinstance(arg.annotation, ast.Name):
            func_type = python2ts_types(arg.annotation.id)

        elif isinstance(arg.annotation, ast.Subscript):
            # fuck it
            if (
                hasattr(arg.annotation.value, "id")
                and arg.annotation.value.id == "list"
            ):
                func_type = f"{arg.annotation.slice.id}[]"

            elif (
                isinstance(arg.annotation.value, ast.Attribute)
                and arg.annotation.value.attr == "Optional"
            ):
                func_type = f"{python2ts_types(arg.annotation.slice.id)} | undefined"
            elif (
                isinstance(arg.annotation.value, ast.Name)
                and arg.annotation.value.id == "list"
            ):
                func_type = f"{python2ts_types(arg.annotation.slice.id)}[]"

            else:
                func_type = "any"

        elif isinstance(arg.annotation, ast.BinOp):
            left = python2ts_types(arg.annotation.left.id)
            right = python2ts_types(arg.annotation.right.value)
            func_type = f"{left} | {right}"
        elif arg.annotation is not None and hasattr(arg.annotation, "id"):
            func_type = python2ts_types(arg.annotation.id)

        arg_map[arg.arg] = f"{arg.arg}:{func_type}"
        if arg.arg in mapped_defaults and mapped_defaults[arg.arg] in (None, "None"):
            del mapped_defaults[arg.arg]

        if arg.arg not in mapped_defaults:
            arg_body = f"{arg.arg}:{func_type}"
        else:
            arg_body = f"{arg.arg}:{func_type} = {sanitize_defaults(mapped_defaults[arg.arg])}".replace(
                "'", ""
            )

        definition.compiled.append(arg_body)

    return definition


def process_default_argument(defaultOp):
    if (
        isinstance(
            defaultOp,
            (
                ast.unaryop,
                ast.UnaryOp,
            ),
        )
        is True
    ):
        # Very likely a negative number
        if isinstance(defaultOp.op, ast.USub):
            return f"-{defaultOp.operand.value}"
        elif isinstance(defaultOp.op, ast.UAdd):
            return f"+{defaultOp.operand.value}"
    elif isinstance(defaultOp, ast.Constant):
        if defaultOp.value is True:
            return "true"
        elif defaultOp.value is False:
            return "false"
        else:
            return str(defaultOp.value)

    elif hasattr(defaultOp, "val"):
        return defaultOp.val
    else:
        raise ValueError(
            f"I don't know how to handle {type(defaultOp)} {vars(defaultOp)}"
        )


def process_args(func_args: T.List[ast.arg]):
    return {
        arg_elm.arg: FuncArg(arg_elm.annotation)
        for arg_elm in func_args
        if arg_elm.arg != "self"
    }


def process_returntype(func_elm: ast.FunctionDef):
    if isinstance(func_elm.returns, ast.Subscript):
        if (
            isinstance(func_elm.returns.value, ast.Name)
            and func_elm.returns.value.id == "list"
        ):
            name_elm = func_elm.returns.value  # type: ast.Name
            slice = func_elm.returns.slice  # type: ast.Name
            if name_elm.id == "list" and isinstance(slice, ast.Name):
                return f"{slice.id}[]"
        elif isinstance(func_elm.returns.value, ast.Attribute):
            if func_elm.returns.value.attr == "Optional":
                if isinstance(func_elm.returns.slice, ast.Attribute):
                    return f"{func_elm.returns.slice.attr} | undefined"
                elif isinstance(func_elm.returns.slice, ast.Name):
                    return f"{func_elm.returns.slice.id} | undefined "

    if isinstance(func_elm.returns, ast.Name):
        return python2ts_types(func_elm.returns.id)

    return None


def transform(payload: tuple[str, dict[str, FuncDef]], product_template: str):
    cls_name, functions = payload

    template = jinja2.Template(product_template, newline_sequence="\n")
    return template.render(cls_name=cls_name, functions=functions).replace("\r\n", "\n")


class MainArgs(tap.Tap):
    """
    Dirt simple AST to hopefully parseable Javascript/Typescript
    """

    source: pathlib.Path  # Source Python file to transform into quasi js/ts
    dest: T.Optional[
        pathlib.Path
    ] = None  # optional file to write to instead of printing to stdout

    dest_header: pathlib.Path = None

    def configure(self) -> None:
        self.add_argument("source", type=pathlib.Path)
        self.add_argument("dest", type=pathlib.Path)
        self.add_argument("dest_header", type=pathlib.Path)


def main():
    args = MainArgs().parse_args()
    assert args.source.exists(), f"Cannot find source {args.source} file to process!"

    if args.dest.name == "-":
        args.dest = None

    if args.dest is not None:
        assert (
            args.dest.parent.exists()
        ), f"Cannot write {args.dest.name} to {args.dest.parent} as it does not exist!"
        assert (
            args.dest.parent.is_dir()
        ), f"Cannot write {args.dest.name} to {args.dest.parent} as it is not a dir!"

    process_source(args.source, dest=args.dest, header=args.dest_header)


if __name__ == "__main__":
    main()
