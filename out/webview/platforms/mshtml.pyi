from WebBrowserInterop import IWebBrowserInterop
from _typeshed import Incomplete
from webview.js import alert as alert
from webview.js.css import disable_text_select as disable_text_select
from webview.util import DEFAULT_HTML as DEFAULT_HTML, inject_base_uri as inject_base_uri, interop_dll_path as interop_dll_path, js_bridge_call as js_bridge_call, parse_api_js as parse_api_js

logger: Incomplete
settings: Incomplete

class MSHTML:
    alert: Incomplete
    class JSBridge(IWebBrowserInterop):
        __namespace__: str
        window: Incomplete
        def call(self, func_name, param, value_id): ...
        def alert(self, message) -> None: ...
        def console(self, message) -> None: ...
    pywebview_window: Incomplete
    web_view: Incomplete
    js_result_semaphore: Incomplete
    js_bridge: Incomplete
    first_load: bool
    cancel_back: bool
    form: Incomplete
    def __init__(self, form, window, alert) -> None: ...
    js_result: Incomplete
    def evaluate_js(self, script) -> None: ...
    def load_html(self, content, base_uri) -> None: ...
    def load_url(self, url) -> None: ...
    def on_preview_keydown(self, _, args) -> None: ...
    def on_new_window(self, sender, args) -> None: ...
    def on_download_complete(self, *_) -> None: ...
    def on_navigating(self, _, args) -> None: ...
    url: Incomplete
    def on_document_completed(self, _, args) -> None: ...
    def on_mouse_move(self, _, e) -> None: ...