import System.Windows.Forms as WinForms
from _typeshed import Incomplete
from webview import FOLDER_DIALOG as FOLDER_DIALOG, OPEN_DIALOG as OPEN_DIALOG, SAVE_DIALOG as SAVE_DIALOG, windows as windows
from webview.guilib import forced_gui_ as forced_gui_
from webview.menu import Menu as Menu, MenuAction as MenuAction, MenuSeparator as MenuSeparator
from webview.screen import Screen as Screen
from webview.util import inject_base_uri as inject_base_uri, parse_file_type as parse_file_type
from webview.window import FixPoint as FixPoint

kernel32: Incomplete
logger: Incomplete
cache_dir: Incomplete
is_cef: Incomplete
is_chromium: Incomplete
IWebBrowserInterop = object
renderer: str
IWebBrowserInterop = object

class BrowserView:
    instances: Incomplete
    app_menu_list: Incomplete
    class BrowserForm(WinForms.Form):
        uid: Incomplete
        pywebview_window: Incomplete
        real_url: Incomplete
        Text: Incomplete
        Size: Incomplete
        MinimumSize: Incomplete
        AutoScaleDimensions: Incomplete
        AutoScaleMode: Incomplete
        scale_factor: Incomplete
        StartPosition: Incomplete
        Location: Incomplete
        FormBorderStyle: Incomplete
        MaximizeBox: bool
        WindowState: Incomplete
        old_state: Incomplete
        Icon: Incomplete
        closed: Incomplete
        closing: Incomplete
        shown: Incomplete
        loaded: Incomplete
        url: Incomplete
        text_select: Incomplete
        TopMost: Incomplete
        is_fullscreen: bool
        frameless: Incomplete
        browser: Incomplete
        BackColor: Incomplete
        TransparencyKey: Incomplete
        localization: Incomplete
        def __init__(self, window, cache_dir) -> None: ...
        def on_activated(self, *_) -> None: ...
        def on_shown(self, *_) -> None: ...
        def on_close(self, *_) -> None: ...
        def on_closing(self, sender, args) -> None: ...
        def on_resize(self, sender, args) -> None: ...
        def on_move(self, sender, args) -> None: ...
        def evaluate_js(self, script): ...
        def get_cookies(self): ...
        def load_html(self, content, base_uri) -> None: ...
        def load_url(self, url) -> None: ...
        def hide(self) -> None: ...
        def show(self) -> None: ...
        def set_window_menu(self, menu_list): ...
        old_size: Incomplete
        old_style: Incomplete
        old_location: Incomplete
        old_screen: Incomplete
        Bounds: Incomplete
        def toggle_fullscreen(self) -> None: ...
        def resize(self, width, height, fix_point) -> None: ...
        def move(self, x, y) -> None: ...
        def minimize(self) -> None: ...
        def restore(self) -> None: ...
    @staticmethod
    def alert(message) -> None: ...

def init_storage() -> None: ...
def setup_app() -> None: ...
def create_window(window) -> None: ...
def set_title(title, uid) -> None: ...
def create_confirmation_dialog(title, message, _): ...
def create_file_dialog(dialog_type, directory, allow_multiple, save_filename, file_types, uid): ...
def get_cookies(uid): ...
def get_current_url(uid): ...
def load_url(url, uid) -> None: ...
def load_html(content, base_uri, uid) -> None: ...
def set_app_menu(app_menu_list) -> None: ...
def get_active_window(): ...
def show(uid) -> None: ...
def hide(uid) -> None: ...
def toggle_fullscreen(uid) -> None: ...
def set_on_top(uid, on_top) -> None: ...
def resize(width, height, uid, fix_point) -> None: ...
def move(x, y, uid) -> None: ...
def minimize(uid) -> None: ...
def restore(uid) -> None: ...
def destroy_window(uid) -> None: ...
def evaluate_js(script, uid, result_id: Incomplete | None = None): ...
def get_position(uid): ...
def get_size(uid): ...
def get_screens(): ...
def add_tls_cert(certfile) -> None: ...
