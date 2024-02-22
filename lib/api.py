import time

from application import Application
from . import models
from .app_types import Identifier
from .log_helper import getLogger
from .timer import Timer

LOG = getLogger(__name__)


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

    def client_create(self, name):
        with self.app.get_db() as session:
            record = models.Client(name=name)
            session.add(record)
            session.commit()
            return dict(id=record.id, name=record.name)

    def clients_list(self):
        with self.app.get_db() as session:
            return [
                {"id": record.id, "name": record.name}
                for record in models.Client.GetAll(session)
            ]

    def client_get(self, client_id):
        with self.app.get_db() as session:
            record = models.Client.Fetch_by_id(session, client_id)
            if record:
                return {"id": record.id, "name": record.name}

    def client_update(self, client_id, client_name):
        with self.app.get_db() as session:
            record = models.Client.Fetch_by_id(session, client_id)
            if record:
                record.name = client_name
                session.add(record)
                session.commit()
                return {"id": record.id, "name": record.name}

    def client_destroy(self, client_id):
        with self.app.get_db() as session:
            models.Client.Delete_By_Id(session, client_id)
            session.commit()

    def projects_list_by_client_id(self, client_id):
        with self.app.get_db() as session:
            return [
                {"id": record.id, "name": record.name}
                for record in models.Project.GetByClient(session, client_id)
            ]

    def tasks_lists_by_project_id(self, project_id):
        with self.app.get_db() as session:
            return [
                {"id": record.id, "name": record.name}
                for record in models.Task.GetByProject(session, project_id)
            ]

    def events_lists_by_task_id(self, task_id):
        with self.app.get_db() as session:
            return [
                dict(
                    id=record.id,
                    hours=record.hours,
                    minutes=record.minutes,
                    seconds=record.seconds,
                )
                for record in models.Event.GetByTask(session, task_id)
            ]

    def timer_start(self, listener_id: Identifier) -> bool:
        print("timer_start", repr(listener_id))
        LOG.debug("timer_start {}", self.timer)
        if self.timer is None:
            LOG.debug("timer_starting for {}", listener_id)
            self.timer = Timer(self.app, listener_id, 0.500)

            self.timer.start()
            LOG.debug("timer_started")

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
