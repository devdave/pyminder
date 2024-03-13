import webview.http as http
from logging import Logger
from .js import css as css
from .screen import Screen as Screen
from _typeshed import Incomplete
from collections.abc import Mapping, Sequence
from enum import Flag
from typing import Any, Callable, TypeVar, Self
from typing_extensions import ParamSpec, TypeAlias
from webview.event import Event as Event
from webview.localization import original_localization as original_localization
from webview.util import (
    WebViewException as WebViewException,
    base_uri as base_uri,
    escape_string as escape_string,
    is_app as is_app,
    is_local_url as is_local_url,
    parse_file_type as parse_file_type,
)

P = ParamSpec("P")
T = TypeVar("T")
logger: Logger

class FixPoint(Flag):
    NORTH: int
    WEST: int
    EAST: int
    SOUTH: int

class EventContainer:
    def __getattr__(self, __name: str) -> Event: ...
    def __setattr__(self, __name: str, __value: Event) -> None: ...

class Window:
    uid: Incomplete
    original_url: Incomplete
    real_url: Incomplete
    html: Incomplete
    initial_width: Incomplete
    initial_height: Incomplete
    initial_x: Incomplete
    initial_y: Incomplete
    resizable: Incomplete
    fullscreen: Incomplete
    min_size: Incomplete
    confirm_close: Incomplete
    background_color: Incomplete
    text_select: Incomplete
    frameless: Incomplete
    easy_drag: Incomplete
    focus: Incomplete
    hidden: Incomplete
    minimized: Incomplete
    maximized: Incomplete
    transparent: Incomplete
    zoomable: Incomplete
    draggable: Incomplete
    localization_override: Incomplete
    vibrancy: Incomplete
    screen: Incomplete
    events: Incomplete
    gui: Incomplete
    def __init__(
        self,
        uid: str,
        title: str,
        url: str | None,
        html: str = "",
        width: int = 800,
        height: int = 600,
        x: int | None = None,
        y: int | None = None,
        resizable: bool = True,
        fullscreen: bool = False,
        min_size: tuple[int, int] = (200, 100),
        hidden: bool = False,
        frameless: bool = False,
        easy_drag: bool = True,
        focus: bool = True,
        minimized: bool = False,
        maximized: bool = False,
        on_top: bool = False,
        confirm_close: bool = False,
        background_color: str = "#FFFFFF",
        js_api: Any = None,
        text_select: bool = False,
        transparent: bool = False,
        zoomable: bool = False,
        draggable: bool = False,
        vibrancy: bool = False,
        localization: Mapping[str, str] | None = None,
        http_port: int | None = None,
        server: type[http.ServerType] | None = None,
        server_args: http.ServerArgs = {},
        screen: Screen | None = None,
    ) -> None: ...
    @property
    def width(self) -> int: ...
    @property
    def height(self) -> int: ...
    @property
    def title(self) -> str: ...
    @title.setter
    def title(self, title: str) -> None: ...
    @property
    def x(self) -> int: ...
    @property
    def y(self) -> int: ...
    @property
    def on_top(self) -> bool: ...
    @on_top.setter
    def on_top(self, on_top: bool) -> None: ...
    def get_elements(self, selector: str) -> Any: ...
    def load_url(self, url: str) -> None: ...
    def load_html(self, content: str, base_uri: str = ...) -> None: ...
    def load_css(self, stylesheet: str) -> None: ...
    def set_title(self, title: str) -> None: ...
    def get_cookies(self): ...
    def get_current_url(self) -> str | None: ...
    def destroy(self) -> None: ...
    def show(self) -> None: ...
    def hide(self) -> None: ...
    def set_window_size(self, width: int, height: int) -> None: ...
    def resize(self, width: int, height: int, fix_point: FixPoint = ...) -> None: ...
    def minimize(self) -> None: ...
    def restore(self) -> None: ...
    def toggle_fullscreen(self) -> None: ...
    def move(self, x: int, y: int) -> None: ...
    def evaluate_js(
        self, script: str, callback: Callable[..., Any] | None = None
    ) -> Any: ...
    def create_confirmation_dialog(self, title: str, message: str) -> bool: ...
    def create_file_dialog(
        self,
        dialog_type: int = 10,
        directory: str = "",
        allow_multiple: bool = False,
        save_filename: str = "",
        file_types: Sequence[str] = ...,
    ) -> Sequence[str] | None: ...
    def expose(self, *functions: Callable[..., Any]) -> None: ...

WindowFunc: TypeAlias
