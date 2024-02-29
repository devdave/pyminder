import webview.http as http
from collections.abc import Iterable, Mapping
from typing import Any, Callable
from webview.event import Event as Event
from webview.guilib import GUIType
from webview.menu import Menu
from webview.screen import Screen as Screen
from webview.util import WebViewException as WebViewException, _TOKEN as _TOKEN, base_uri as base_uri, escape_line_breaks as escape_line_breaks, escape_string as escape_string, parse_file_type as parse_file_type
from webview.window import Window as Window

__all__ = ['start', 'create_window', 'token', 'screens', 'Event', '_TOKEN', 'base_uri', 'parse_file_type', 'escape_string', 'escape_line_breaks', 'WebViewException', 'Screen', 'Window']

token = _TOKEN

def start(func: Callable[..., None] | None = None, args: Iterable[Any] | None = None, localization: dict[str, str] = {}, gui: GUIType | None = None, debug: bool = False, http_server: bool = False, http_port: int | None = None, user_agent: str | None = None, private_mode: bool = True, storage_path: str | None = None, menu: list[Menu] = [], server: type[http.ServerType] = ..., server_args: dict[Any, Any] = {}, ssl: bool = False): ...
def create_window(title: str, url: str | None = None, html: str | None = None, js_api: Any = None, width: int = 800, height: int = 600, x: int | None = None, y: int | None = None, screen: Screen = None, resizable: bool = True, fullscreen: bool = False, min_size: tuple[int, int] = (200, 100), hidden: bool = False, frameless: bool = False, easy_drag: bool = True, focus: bool = True, minimized: bool = False, maximized: bool = False, on_top: bool = False, confirm_close: bool = False, background_color: str = '#FFFFFF', transparent: bool = False, text_select: bool = False, zoomable: bool = False, draggable: bool = False, vibrancy: bool = False, localization: Mapping[str, str] | None = None, server: type[http.ServerType] = ..., http_port: int | None = None, server_args: http.ServerArgs = {}) -> Window: ...
def screens() -> list[Screen]: ...
