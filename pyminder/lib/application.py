import time
import typing as T
import pathlib
from contextlib import contextmanager
import json


import sqlalchemy
import webview

from . import models
from .app_types import Identifier
from .log_helper import getLogger

LOG = getLogger(__name__)


class Application:
    here: pathlib.Path
    database_path: pathlib.Path
    debug: bool

    _main_window: webview.Window | None = None
    _port: T.Optional[int] = None

    engine: sqlalchemy.engine.Engine
    Session: models.scoped_session

    current_client_id: int | None = None
    current_project_id: int | None = None
    current_task_id: int | None = None
    windows: dict[str, webview.Window]

    def __init__(
        self, here: pathlib.Path, db_path: pathlib.Path, debug: bool = False
    ) -> None:
        self.here = here
        self.database_path = db_path
        self.debug = debug

        self.engine, self.Session = models.connect(self.database_path, echo=self.debug)

        self._main_window = None
        self.current_client_id = None
        self.current_project_id = None
        self.current_task_id = None

        self.windows = dict()

        self.web_app = None

    @property
    def main_window(self) -> webview.Window | None:
        return self._main_window

    @main_window.setter
    def main_window(self, window: webview.Window) -> None:
        if self._main_window is None:
            self._main_window = window

            self._main_window.events.closed += self.shutdown

    @property
    def port(self) -> int | None:
        return self._port

    @port.setter
    def port(self, port: int) -> None:
        self._port = port

    def shutdown(self) -> None:
        LOG.debug("Shutting down application, main window closed")
        targets = list(self.windows.values())
        for window in targets:
            LOG.debug("Shutting down window")
            window.destroy()

    def tell(self, identifier: Identifier, *args):
        def check_success(result):
            LOG.debug(f"Checking {identifier} success {result}")

        temp = json.dumps(args)
        script = f"window.criticalCall('{identifier}', {temp})"
        # LOG.debug(f"Telling {identifier} - `{script=}`")
        if self.main_window is None:
            raise RuntimeError("Main window not initialized")
        response = self.main_window.evaluate_js(script)
        # LOG.debug(f"Telling {identifier} - `{response=}`")
        return response

    def clearCallback(self, identifier: Identifier):
        script = f"window.endCallback('{identifier}')"
        if self.main_window is None:
            raise RuntimeError("Main window not initialized")
        return self.main_window.evaluate_js(script)

    @contextmanager
    def get_db(self):
        session = self.Session()
        yield session
        session.close()
        del session

    def open_window(self, my_api, win_name: str) -> bool:
        valid = ["tasks", "reports", "manage"]
        if win_name in valid and win_name not in self.windows:
            self.windows[win_name] = webview.create_window(
                f"{win_name}",
                url=f"http://127.0.0.1:{self.port}/{win_name}",
                js_api=my_api,
            )

            def handle_close():
                LOG.debug(f"Closing window {win_name}")
                del self.windows[win_name]

            self.windows[win_name].events.closed += handle_close
            return True

        elif win_name in self.windows:
            self.windows[win_name].show()
            return True

        return False

    def window_toggle_resize(self, win_name, size):
        LOG.debug(f"Resizing window {win_name} to {size}")
        if win_name == "main":
            if size == "compact":
                LOG.debug(f"Resizing window {win_name} to 500, 275")
                self.main_window.resize(500, 275)
            else:
                LOG.debug(f"Resizing window {win_name} to 500, 650")
                self.main_window.resize(500, 650)
        pass
