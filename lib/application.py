import typing as T
import pathlib
from contextlib import contextmanager

import sqlalchemy
import webview

import models
from lib.app_types import Identifier
from lib.log_helper import getLogger

LOG = getLogger(__name__)


class Application:
    here: pathlib.Path
    database_path: pathlib.Path
    _main_window: webview.Window | None = None
    _port: T.Optional[int] = None

    engine: sqlalchemy.engine.Engine
    Session: models.scoped_session

    current_client_id: int
    current_project_id: int
    current_task_id: int
    windows: dict[str, webview.Window]

    def __init__(self, here: pathlib.Path, db_path: pathlib.Path) -> None:
        self.here = here
        self.database_path = db_path
        self.engine, self.Session = models.connect(self.database_path)

        self._main_window = None
        self.current_client_id = None
        self.current_project_id = None
        self.current_task_id = None

        self.windows = dict()

    @property
    def main_window(self) -> webview.Window:
        return self._main_window

    @main_window.setter
    def main_window(self, window: webview.Window) -> None:
        if self._main_window is None:
            self._main_window = window

    @property
    def port(self) -> int:
        return self._port

    @port.setter
    def port(self, port: int) -> None:
        self._port = port

    def tell(self, identifier: Identifier, *args):
        import json

        def check_success(result):
            LOG.debug(f"Checking {identifier} success {result}")

        temp = json.dumps(args)
        script = f"window.criticalCall('{identifier}', {temp})"
        # LOG.debug(f"Telling {identifier} - `{script=}`")
        response = self.main_window.evaluate_js(script, check_success)
        # LOG.debug(f"Telling {identifier} - `{response=}`")
        return response

    def clearCallback(self, identifier: Identifier):
        script = f"window.endCallback('{identifier}')"
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
        return False
