from _typeshed import Incomplete
from collections.abc import Callable as Callable
from typing import Self

class Menu:
    title: str
    items: list[Self | MenuAction | MenuSeparator]
    def __init__(
        self, title: str, items: list[Self | MenuAction | MenuSeparator] = []
    ) -> None: ...

class MenuAction:
    title: Incomplete
    function: Incomplete
    def __init__(self, title: str, function: Callable[[], None]) -> None: ...

class MenuSeparator: ...
