import logging
import pathlib
import subprocess
import multiprocessing as mp

import time
from pathlib import Path
from wsgiref.simple_server import make_server

import flask
import wsgiref

import tap
import webview  # type: ignore
import sys

from lib.api import API
from lib.application import Application
from lib.log_helper import getLogger

IS_FROZEN = getattr(sys, "frozen", False)

LOG = getLogger(__name__)
HERE = Path(__file__).parent if IS_FROZEN is False else Path(sys.executable).parent
UI_DIR = (HERE / "ui") if (HERE / "ui").exists() else (HERE / ".." / "ui")
DB_DIR = pathlib.Path.cwd()


class Arguments(tap.Tap):
    debug: bool = False
    port: str = "8080"
    transform_api_target: Path | None = None
    alternate_db: Path | None = None


def setup_logging(level=logging.DEBUG):
    print(f"Setting up logging for {__name__}")

    root = getLogger(__name__)
    lib = getLogger("lib")

    root.setLevel(level)
    lib.setLevel(level)

    console = logging.StreamHandler()
    console.setLevel(level)

    basic_format = logging.Formatter(
        "%(levelname)s - %(name)s.%(funcName)s@%(lineno)s - %(message)s"
    )
    console.setFormatter(basic_format)

    root.addHandler(console)
    lib.addHandler(console)

    root.info("Logging setup")


def transform_api(dest: pathlib.Path):
    from lib import transformer

    dest.touch(exist_ok=True)
    transformer.process_source(
        (HERE / "lib/api.py"), dest, (UI_DIR / "lib/api_header.ts.html")
    )


def spinup_pnpm(url_path: pathlib.Path, port: str):
    ui_dir = url_path
    LOG.debug("Spinup CWD {}", ui_dir)

    process = subprocess.Popen(
        ["pnpm", "dev", "--port", port, "--host"],
        cwd=str(ui_dir),
        creationflags=subprocess.CREATE_NEW_PROCESS_GROUP,
    )

    status = process.poll()
    if status is not None:
        raise Exception(f"pnpm failed to run {status}")

    time.sleep(2)

    return process


def run_flask(ui_dir: pathlib.Path, port: str):
    DIST_DIR = ui_dir / "dist"
    if DIST_DIR.exists() is False:
        raise RuntimeError("Dist dir does not exist @ {}".format(ui_dir))

    app = flask.Flask(__name__)

    @app.route("/", defaults={"path": ""})
    @app.route("/<path:path>")
    def catch_all(path):
        file_path = DIST_DIR / path
        if (
            file_path.exists()
            and file_path.is_relative_to(DIST_DIR)
            and file_path.is_file()
        ):
            return flask.send_file(file_path)
        else:
            return (DIST_DIR / "index.html").read_text()

    from werkzeug import wsgi

    with make_server("127.0.0.1", int(port), app) as httpd:
        httpd.serve_forever()

    app.run(host="127.0.0.1", port=int(port))


def spinup_flask(ui_dir: pathlib.Path, port: str) -> mp.Process:
    worker = mp.Process(target=run_flask, args=(ui_dir, port))
    worker.start()
    return worker


def main(argv):
    results = Arguments().parse_args()

    print(f"{HERE=}")
    print(f"{UI_DIR=}")
    print(f"{DB_DIR=}")

    print(f"{results=}", results)
    print(f"{results.debug=}")
    print(f"{results.transform_api_target=}")
    print(f"{results.alternate_db=}")

    db_dir = results.alternate_db if results.alternate_db is not None else DB_DIR

    setup_logging()

    app = Application(HERE, db_dir / "pyminder.sqlite3")
    app.port = results.port

    if results.debug:
        print("Debug mode")

        if (
            results.transform_api_target is not None
            and Path(results.transform_api_target).exists()
            and Path(results.transform_api_target).is_file()
        ):
            transform_api(results.transform_api_target)

    api = API(app)

    window_args = {
        "title": "PyMinder",
        "js_api": api,
        "width": 350,
        "height": 570,
        "background_color": "#000000",
        # "min_size": (350, 250),
        "url": f"http://127.0.0.1:{results.port}/",
        "on_top": True,
        "resizable": False,
    }

    worker = None
    if results.debug:
        worker = spinup_pnpm(UI_DIR, results.port)
    else:
        worker = spinup_flask(UI_DIR, results.port)

    app.main_window = webview.create_window(**window_args)

    if results.debug:
        webview.start(debug=True)
    else:
        webview.start(debug=True)

    print("Finished, trying to shutdown")

    if results.debug:
        import signal

        LOG.debug("Stopping worker")
        worker.send_signal(signal.CTRL_BREAK_EVENT)
        worker.send_signal(signal.CTRL_C_EVENT)
        LOG.debug("Waiting for worker")
        time.sleep(2)

    else:
        LOG.debug("Stopping worker")
        worker.terminate()
        worker.kill()
        LOG.debug("Waiting for worker")
        worker.join()
        worker.close()

    sys.exit(0)


if __name__ == "__main__":
    if IS_FROZEN and sys.platform.startswith("win"):
        mp.freeze_support()

    try:
        main(sys.argv)
    except Exception as e:
        LOG.error(e)
        sys.exit(1)
