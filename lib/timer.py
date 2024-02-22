import math
import threading
import time

from app_types import Identifier
from application import Application
from .log_helper import getLogger

LOG = getLogger(__name__)


class Timer(threading.Thread):
    app: Application
    identifier: Identifier
    interval: int
    status: bool = True
    paused: bool = False
    running: bool = False
    accumulated_seconds: int = 0
    now: float = 0

    def __init__(self, app: Application, identifier: Identifier, interval: int):
        threading.Thread.__init__(self)

        self.app = app
        self.identifier = identifier
        self.interval = interval
        self.status = True
        self.paused = False
        self.running = False
        self.accumulated_seconds = 0

    def pause(self):
        self.paused = True

    def resume(self):
        self.paused = False
        self.now = time.time()

    def stop(self):
        self.status = False

    def run(self):
        LOG.debug("Timer started: {}", self.identifier)
        self.running = True
        self.now = time.time()
        while self.status:
            if self.paused is False:
                last = time.time() - self.now
                self.now = time.time()
                if last < 0:
                    last = 0

                self.accumulated_seconds += last
                hours, remainder = divmod(self.accumulated_seconds, 3600)
                minutes, seconds = divmod(remainder, 60)
                self.app.tell(self.identifier, hours, minutes, math.floor(seconds))

            time.sleep(self.interval)

        LOG.debug("timer stopping: {}", self.identifier)
        self.app.clearCallback(self.identifier)
        self.running = False
