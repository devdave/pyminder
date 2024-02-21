import datetime
import math
import threading
import time
import logging

from application import Application
from .timer import Timer
from .app_types import Identifier


LOG = logging.getLogger(__name__)


class API:
    app: Application
    timer: "Timer"

    def __init__(self, app):
        self.app = app

        self.timer = None

    def info(self, message=None):
        if message:
            LOG.info("frontend->", message)
        else:
            LOG.info("frontend<>")

    def timer_start(self, listener_id: Identifier) -> bool:
        print("timer_start", repr(listener_id))
        LOG.debug("timer_start %s", self.timer)
        if self.timer is None:
            LOG.debug("timer_starting for %s", listener_id)
            self.timer = Timer(self.app, listener_id, 0.500)

            self.timer.start()
            print("timer_started")

            return True

        return False

    def timer_stop(self) -> bool:
        if self.timer is not None:
            self.timer.stop()
            time.sleep(1)
            if self.timer and self.timer.running is False:
                del self.timer
                self.timer = None
                return True

        return False

    def timer_pause(self) -> bool:
        if self.timer is not None:
            self.timer.pause()
            return True

        return False

    def timer_resume(self) -> bool:
        if self.timer is not None:
            self.timer.resume()
            return True
        return False
