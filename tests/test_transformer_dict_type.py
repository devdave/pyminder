import ast

from lib import transformer


def test_transformer_dict_type():
    src2 = """
def action(self, val: int) -> dict[str, str]:
    return {"val": val}
"""

    parsed = ast.parse(src2, "test_data.py", mode="exec")
    if isinstance(parsed.body[0], ast.FunctionDef):
        function = parsed.body[0]  # type: ast.FunctionDef
        actual: transformer.FuncDef = transformer.process_function(function)

        assert len(actual.arg_names) == 1
        assert actual.arg_names[0] == "val"
        assert actual.compiled[0] == "val:number"
        assert actual.return_type == "{[key:string]: string}"
    else:
        raise AssertionError(
            "parsed body 0 is not a function {:s}".format(parsed.body[0])
        )
