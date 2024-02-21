import logging
import pathlib
import subprocess
import sys
import time
from pathlib import Path

import tap
import webview

from lib.api import API
from lib.application import Application
from lib.log_helper import getLogger

HERE = Path(__file__).parent
LOG = getLogger(__name__)


class Arguments(tap.Tap):
    debug: bool = False
    port: str = "8080"
    transform_api_target: Path = None


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
    import transformer

    dest.touch(exist_ok=True)
    transformer.process_source(
        (HERE / "lib" / "api.py"), dest, (HERE / "ui" / "lib" / "api_header.ts")
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


def main(argv):
    results = Arguments().parse_args()

    print(f"{results=}", results)
    print(f"{results.debug=}")
    print(f"{results.transform_api_target=}")

    setup_logging()

    app = Application(HERE, HERE)

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
        "url": "./ui/dist/index.html",
        "title": "PyMinder",
        "js_api": api,
    }

    worker = None
    if results.debug:
        worker = spinup_pnpm(str(HERE / "ui"), results.port)
        window_args["url"] = f"http://127.0.0.1:{results.port}/"

    app.main_window = webview.create_window(**window_args)

    webview.start(debug=True)

    if worker:
        import signal

        worker.send_signal(signal.CTRL_BREAK_EVENT)
        worker.send_signal(signal.CTRL_C_EVENT)
        worker.kill()


if __name__ == "__main__":
    main(sys.argv)
