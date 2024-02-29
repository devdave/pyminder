from _typeshed import Incomplete
from collections.abc import Callable as Callable

class Menu:
    title: Incomplete
    items: Incomplete
    def __init__(self, title: str, items: list[str] = []) -> None: ...

class MenuAction:
    title: Incomplete
    function: Incomplete
    def __init__(self, title: str, function: Callable[[], None]) -> None: ...

class MenuSeparator: ...
