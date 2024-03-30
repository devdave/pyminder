import datetime as DT
import math
import threading
import time

from . import models
from .app_types import Identifier
from .application import Application
from .log_helper import getLogger

LOG = getLogger(__name__)


class Timer(threading.Thread):
    app: Application
    identifier: Identifier
    event: models.Event
    interval: int | float
    status: bool = True
    paused: bool = False
    running: bool = False
    accumulated_seconds: int = 0
    now: float = 0

    entry_id: Identifier

    def __init__(
        self, app: Application, identifier: Identifier, event_id, interval: int | float
    ):
        threading.Thread.__init__(self)

        self.app = app
        self.identifier = identifier
        self.interval = interval
        self.status = True
        self.paused = False
        self.running = False
        self.accumulated_seconds = 0
        with self.app.get_db() as session:
            event = models.Event.Fetch_by_id(session, event_id)
            record = event.create_entry(DT.datetime.now(), DT.datetime.now(), 0)
            session.add(event)
            session.add(record)
            session.commit()
            self.entry_id = record.id

    def update_record(
        self,
        stopped_on: DT.datetime,
        seconds: float,
        reason=models.StopReasons.PLACEHOLDER,
    ):
        with self.app.get_db() as session:
            entry = models.Entry.Fetch_by_id(
                session, self.entry_id
            )  # type: models.Entry
            entry.stop_reason = reason
            entry.seconds = seconds
            entry.stopped_on = stopped_on
            session.add(entry)
            session.commit()

    def pause(self):
        self.paused = True
        self.update_record(
            DT.datetime.now(), self.accumulated_seconds, models.StopReasons.PLACEHOLDER
        )

    def resume(self):
        self.paused = False
        self.now = time.time()
        # self.update_record(DT.datetime.now(), self.accumulated_seconds, models.StopReasons.PLACEHOLDER)

    def stop(self):
        self.status = False
        self.update_record(
            DT.datetime.now(), self.accumulated_seconds, models.StopReasons.FINISHED
        )

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
                if seconds % 10 == 0:
                    self.update_record(
                        DT.datetime.now(),
                        self.accumulated_seconds,
                        models.StopReasons.PLACEHOLDER,
                    )

                self.app.tell(self.identifier, hours, minutes, math.floor(seconds))

            time.sleep(self.interval)

        LOG.debug("timer stopping: {}", self.identifier)
        self.app.clearCallback(self.identifier)
        self.running = False
