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

    engine: sqlalchemy.engine.Engine
    Session: models.scoped_session

    current_client_id: int
    current_project_id: int
    current_task_id: int

    def __init__(self, here: pathlib.Path, db_path: pathlib.Path) -> None:
        self.here = here
        self.database_path = db_path
        self.engine, self.Session = models.connect(self.database_path)

        self._main_window = None
        self.current_client_id = None
        self.current_project_id = None
        self.current_task_id = None

    @property
    def main_window(self) -> webview.Window:
        return self._main_window

    @main_window.setter
    def main_window(self, window: webview.Window) -> None:
        if self._main_window is None:
            self._main_window = window

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
