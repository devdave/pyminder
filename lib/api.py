import datetime
import datetime as DT
import time

from application import Application
from . import models
from .app_types import (
    Identifier,
    Client,
    Project,
    Task,
    Event,
    StopReasons,
    Entry,
    TaskStatus,
    TimeOwner,
)
from .log_helper import getLogger
from .timer import Timer

LOG = getLogger(__name__)


class API:
    app: Application
    timer: "Timer"

    def __init__(self, app):
        self.app = app

        self.timer = None

    def info(self, message: str | None = None) -> None:
        LOG.info("frontend-> {}", message)

    def client_create(self, name: str) -> Client:
        with self.app.get_db() as session:
            record = models.Client(name=name)
            session.add(record)
            session.commit()
            return Client(id=record.id, name=record.name)

    def clients_list(self) -> list[Client]:
        with self.app.get_db() as session:
            return [
                {"id": record.id, "name": record.name}
                for record in models.Client.GetAll(session)
            ]

    def client_get(self, client_id: Identifier) -> Client:
        with self.app.get_db() as session:
            record = models.Client.Fetch_by_id(session, client_id)
            if record:
                return {"id": record.id, "name": record.name}

    def client_update(self, client_id: Identifier, client_name: str) -> Client:
        with self.app.get_db() as session:
            record = models.Client.Fetch_by_id(session, client_id)
            if record:
                record.name = client_name
                session.add(record)
                session.commit()
                return {"id": record.id, "name": record.name}

    def client_destroy(self, client_id: Identifier) -> bool:
        with self.app.get_db() as session:
            models.Client.Delete_By_Id(session, client_id)
            session.commit()
            return True

    def project_create(self, client_id: Identifier, name: str) -> Project:
        with self.app.get_db() as session:
            record = models.Project(name=name, client_id=client_id)
            session.add(record)
            session.commit()
            return Project(id=record.id, name=record.name, client_id=record.client_id)

    def projects_list_by_client_id(self, client_id: Identifier) -> list[Project]:
        with self.app.get_db() as session:
            return [
                Project(id=record.id, name=record.name, client_id=record.client_id)
                for record in models.Project.GetByClient(session, client_id)
            ]

    def project_get(self, project_id: Identifier) -> Project:
        with self.app.get_db() as session:
            return models.Project.Fetch_by_id(session, project_id).to_dict()

    def project_update(self, project_id: Identifier, project_name: str) -> Project:
        with self.app.get_db() as session:
            record = models.Project.Fetch_by_id(session, project_id)
            if record:
                record.name = project_name
                session.add(record)
                session.commit()
            return record

    def project_destroy(self, project_id: Identifier) -> bool:
        with self.app.get_db() as session:
            return models.Project.Delete_By_Id(session, project_id)

    def task_create(self, project_id: Identifier, name: str) -> Task:
        with self.app.get_db() as session:
            record = models.Task(name=name, project_id=project_id)
            session.add(record)
            session.commit()
            return Task(id=record.id, name=record.name)

    def tasks_lists_by_project_id(self, project_id: Identifier) -> list[Task]:
        with self.app.get_db() as session:
            return [
                Task(id=record.id, name=record.name, project_id=record.project_id)
                for record in models.Task.GetByProject(session, project_id)
            ]

    def task_get(self, task_id: Identifier) -> Task:
        with self.app.get_db() as session:
            return models.Task.Fetch_by_id(session, task_id).to_dict()

    def task_update(
        self, task_id: Identifier, name: str | None = None, status: str | None = None
    ) -> Task:
        with self.app.get_db() as session:
            record = models.Task.Fetch_by_id(session, task_id)
            if record:
                if name is not None:
                    record.name = name
                if status is not None:
                    record.status = TaskStatus[status]

                session.add(record)
                session.commit()
                return record.to_dict()

    def task_destroy(self, task_id: Identifier) -> bool:
        with self.app.get_db() as session:
            return models.Task.Delete_By_Id(session, task_id)

    def event_create(
        self,
        task_id: Identifier,
        start_date: datetime.date | None = None,
        details: str | None = None,
        notes: str | None = None,
    ) -> Event:
        with self.app.get_db() as session:
            my_date = start_date or datetime.date.today()
            record = models.Event(
                start_date=my_date,
                task_id=task_id,
                details=details,
                notes=notes,
            )
            session.add(record)
            session.commit()
            return record.to_dict()

    def events_get_or_create_by_date(
        self, task_id: Identifier, start_date: datetime.date | None = None
    ) -> list[Event]:
        with self.app.get_db() as session:
            my_date = start_date or datetime.date.today()
            record = models.Event.GetOrCreateByDate(session, task_id, my_date)
            return record.to_dict()

    def events_by_task_id(self, task_id: Identifier) -> list[Event]:
        with self.app.get_db() as session:
            return [
                record.to_dict() for record in models.Event.GetByTask(session, task_id)
            ]

    def event_get(self, event_id: Identifier) -> Event:
        with self.app.get_db() as session:
            record = models.Event.Fetch_by_id(session, event_id)
            if record:
                return record.to_dict()

    def event_update(
        self, event_id: Identifier, detail: str | None = None, notes: str | None = None
    ) -> Event:
        with self.app.get_db() as session:
            record = models.Event.Fetch_by_id(session, event_id)
            if record:
                if detail is not None:
                    record.detail = detail
                if notes is not None:
                    record.notes = notes
                session.add(record)
                session.commit()

    def event_destroy(self, event_id: Identifier) -> bool:
        with self.app.get_db() as session:
            return models.Event.Delete_By_Id(session, event_id)

    def event_add_entry(
        self,
        event_id: Identifier,
        start_dt: datetime.datetime,
        end_dt: datetime.datetime,
        seconds: int,
        reason: str,
    ) -> Entry:
        with self.app.get_db() as session:
            event = models.Event.Fetch_by_id(session, event_id)
            key = StopReasons[reason]
            entry = event.create_entry(
                start=start_dt, end=end_dt, seconds=seconds, reason=key
            )
            session.add(event)
            session.commit()
            return entry.to_dict()

    def entries_lists_by_event_id(self, event_id: Identifier) -> list[Entry]:
        with self.app.get_db() as session:
            return [
                entry.to_dict() for entry in models.Entry.GetByEvent(session, event_id)
            ]

    def entry_get(self, entry_id: Identifier) -> Entry:
        with self.app.get_db() as session:
            record = models.Entry.Fetch_by_id(session, entry_id)
            if record:
                return record.to_dict()

    def entry_update(
        self,
        entry_id: Identifier,
        start_dt: datetime.datetime | None = None,
        end_dt: datetime.datetime | None = None,
        seconds: int | None = None,
        reason: str | None = None,
    ) -> Entry:
        with self.app.get_db() as session:
            record = models.Entry.Fetch_by_id(session, entry_id)
            if start_dt is not None:
                record.start_date = start_dt
            if end_dt is not None:
                record.end_date = end_dt
            if seconds is not None:
                record.seconds = seconds
            if reason is not None:
                record.reason = reason

            session.add(record)
            session.commit()
            return record.to_dict()

    def entry_destroy(self, entry_id: Identifier) -> bool:
        with self.app.get_db() as session:
            return models.Entry.Delete_By_Id(session, entry_id)

    def timer_check(self) -> bool:
        return self.timer is not None and self.timer.running is True

    def timer_owner(self) -> TimeOwner:
        with self.app.get_db() as session:
            entry = models.Entry.Fetch_by_id(session, self.timer.entry_id)
            event = entry.event
            task = event.task
            project = task.project
            client = project.client
            return TimeOwner(
                client=client.to_dict(),
                project=project.to_dict(),
                task=task.to_dict(),
                event=event.to_dict(),
                isRunning=self.timer.running,
                isPaused=self.timer.paused,
            )

    def timer_override(self, new_receiver: Identifier) -> None:
        old_receiver = self.timer.identifier
        self.timer.identifier = new_receiver
        self.app.clearCallback(old_receiver)

    def timer_start(
        self,
        listener_id: Identifier,
        task_id: Identifier,
    ) -> Event:
        event_id = None
        with self.app.get_db() as session:
            event = models.Event.GetOrCreateByDate(session, task_id, DT.date.today())
            session.add(event)
            session.commit()
            event_id = event.id

        LOG.debug("timer_start {}", self.timer)
        if self.timer is None:
            LOG.debug("timer_starting for {}", listener_id)
            self.timer = Timer(self.app, listener_id, event_id, 0.500)

            self.timer.start()
            LOG.debug("timer_started")

        with self.app.get_db() as session:
            return models.Event.Fetch_by_id(session, event_id).to_dict()

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
