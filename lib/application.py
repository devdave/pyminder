import typing as T
import pathlib

import webview

from .app_types import Identifier


class Application:
    here: pathlib.Path
    database_path: pathlib.Path
    _main_window: webview.Window | None = None

    tasks = []

    def __init__(self, here: pathlib.Path, db_path: pathlib.Path) -> None:
        self.here = here
        self.database_path = db_path

    @property
    def main_window(self) -> webview.Window:
        return self._main_window

    @main_window.setter
    def main_window(self, window: webview.Window) -> None:
        if self._main_window is None:
            self._main_window = window

    def tell(self, identifier: Identifier, *args):
        import json

        temp = json.dumps(args)
        script = f"window.callBack('{identifier}', {temp})"
        return self.main_window.evaluate_js(script)

    def clearCallback(self, identifier: Identifier):
        script = f"window.endCallback('{identifier}')"
        return self.main_window.evaluate_js(script)
