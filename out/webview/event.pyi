from _typeshed import Incomplete
from typing import Any, Callable
from typing_extensions import Self

logger: Incomplete

class Event:
    def __init__(self, should_lock: bool = False) -> None: ...
    def set(self, *args: Any, **kwargs: Any) -> bool: ...
    def is_set(self) -> bool: ...
    def wait(self, timeout: float = 0) -> bool: ...
    def clear(self) -> None: ...
    def __add__(self, item: Callable[..., Any]) -> Self: ...
    def __sub__(self, item: Callable[..., Any]) -> Self: ...
    def __iadd__(self, item: Callable[..., Any]) -> Self: ...
    def __isub__(self, item: Callable[..., Any]) -> Self: ...
