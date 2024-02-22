from lib import transformer

simple_template = """{% for func_name, func_def in functions|items() -%}
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
{%- endfor %}"""


def test_transformer_dict_type():
    src = """class API:
        def action(self, val: int) -> dict[str, str]:
            return {"val": val}
    """
    actual = transformer.process_source(src, product_template=simple_template)
    expected = """
    action(val:number):Promise<{ [key: string]: string }> {
        return this.boundary.remote('action', val) as Promise<{ [key: string]: string }>
    }"""

    assert actual == expected
