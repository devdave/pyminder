import time
import typing as T
import pathlib
from contextlib import contextmanager

import bottle
import sqlalchemy
import webview

from lib import models
from lib.app_types import Identifier
from lib.log_helper import getLogger

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

    def make_app(self):
        if self.web_app is not None:
            return self.web_app

        self.web_app = bottle.Bottle()
        bottle.TEMPLATE_PATH = str(self.here / "ui/dist")

        @self.web_app.route("/<catchall:re:.*>")
        def index(catchall: str):
            LOG.debug(f"Index requested")

            if (self.here / "ui/dist/" / catchall).exists() is False:
                catchall = "index.html"

            if len(catchall.strip()) == 0:
                catchall = "index.html"

            # return bottle.template(catchall)
            response = bottle.static_file(catchall, root=str(self.here / "ui/dist/"))
            return response

        return self.web_app

    @property
    def main_window(self) -> webview.Window | None:
        return self._main_window

    @main_window.setter
    def main_window(self, window: webview.Window) -> None:
        if self._main_window is None:
            self._main_window = window

    @property
    def port(self) -> int | None:
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
            pass

            return True

        return False
