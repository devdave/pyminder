import datetime as DT
import math
import threading
import time

from . import models
from app_types import Identifier
from application import Application
from .log_helper import getLogger

LOG = getLogger(__name__)


class Timer(threading.Thread):
    app: Application
    identifier: Identifier
    event: models.Event
    interval: int
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

    def pause(self):
        self.paused = True
        with self.app.get_db() as session:
            record = models.Entry.Fetch_by_id(session, self.entry_id)
            record.stop_reason = models.StopReasons.PAUSED
            record.stopped_on = DT.datetime.now()
            record.seconds = self.accumulated_seconds
            session.add(record)
            session.commit()

    def resume(self):
        self.paused = False
        self.now = time.time()
        with self.app.get_db() as session:
            record = models.Entry.Fetch_by_id(session, self.entry_id)
            record.stop_reason = models.StopReasons.PLACEHOLDER
            record.seconds = self.accumulated_seconds
            session.add(record)
            session.commit()

    def stop(self):
        self.status = False
        with self.app.get_db() as session:
            record = models.Entry.Fetch_by_id(session, self.entry_id)
            record.status = models.StopReasons.FINISHED
            record.stopped_on = DT.datetime.now()
            record.seconds = self.accumulated_seconds
            session.add(record)
            session.commit()

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
                    with self.app.get_db() as session:
                        record = models.Entry.Fetch_by_id(session, self.entry_id)
                        record.status = models.StopReasons.PLACEHOLDER
                        record.seconds = self.accumulated_seconds
                        session.add(record)
                        session.commit()

                self.app.tell(self.identifier, hours, minutes, math.floor(seconds))

            time.sleep(self.interval)

        LOG.debug("timer stopping: {}", self.identifier)
        self.app.clearCallback(self.identifier)
        self.running = False
