import json
import typing as T
import datetime
import datetime as DT
import time

import pandas as pd

from . import app_types
from .application import Application
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
    TimeReport,
    DateTimeCard,
    ClientTime,
    ProjectTime,
    TaskTimeCard,
    ReportTimeValues,
)
from .log_helper import getLogger
from .timer import Timer

LOG = getLogger(__name__)


class API:
    app: Application
    timer: T.Optional["Timer"]

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
            return Client(id=record.id, name=record.name, time=None)

    def clients_list(self) -> list[Client]:
        with self.app.get_db() as session:
            return [
                Client(id=record.id, name=record.name, time=None)
                for record in models.Client.GetAll(session)
            ]

    def client_get(self, client_id: Identifier) -> T.Optional[Client]:
        with self.app.get_db() as session:
            record = models.Client.Fetch_by_id(session, client_id)
            if record:
                all_time = models.Client.GetAllTime(session, record.id)
                return {"id": record.id, "name": record.name, "time": all_time}
            return None

    def client_update(
        self, client_id: Identifier, client_name: str
    ) -> T.Optional[Client]:
        with self.app.get_db() as session:
            record = models.Client.Fetch_by_id(session, client_id)
            if record:
                record.name = client_name
                session.add(record)
                session.commit()
                return record.to_dict()
            return None

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
            return Project(
                id=record.id, name=record.name, client_id=record.client_id, time=None
            )

    def projects_list_by_client_id(self, client_id: Identifier) -> list[Project]:
        with self.app.get_db() as session:
            return [
                Project(
                    id=record.id,
                    name=record.name,
                    client_id=record.client_id,
                    time=None,
                )
                for record in models.Project.GetByClient(session, client_id)
            ]

    def project_get(self, project_id: Identifier) -> Project:
        with self.app.get_db() as session:
            record = models.Project.Fetch_by_id(session, project_id).to_dict()
            record["time"] = models.Project.GetAllTime(session, project_id)
            return record

    def project_update(self, project_id: Identifier, project_name: str) -> Project:
        with self.app.get_db() as session:
            record = models.Project.Fetch_by_id(session, project_id)
            if record:
                record.name = project_name
                session.add(record)
                session.commit()
            return record.to_dict()

    def project_destroy(self, project_id: Identifier) -> bool:
        with self.app.get_db() as session:
            retval = models.Project.Delete_By_Id(session, project_id)
            session.commit()
            return retval

    def task_create(self, project_id: Identifier, name: str) -> Task:
        with self.app.get_db() as session:
            record = models.Task(name=name, project_id=project_id)
            session.add(record)
            session.commit()
            return Task(
                id=record.id,
                name=record.name,
                time=None,
                project_id=int(project_id),
                status=record.status.value,
            )

    def tasks_lists_by_project_id(self, project_id: Identifier) -> list[Task]:
        with self.app.get_db() as session:
            return [
                record.to_dict()
                for record in models.Task.GetByProject(session, project_id)
            ]

    def task_get(self, task_id: Identifier) -> Task:
        with self.app.get_db() as session:
            record = models.Task.Fetch_by_id(session, task_id).to_dict()
            record["time"] = models.Task.GetAllTime(session, task_id)
            return record

    def task_update(
        self, task_id: Identifier, name: str | None = None, status: str | None = None
    ) -> T.Optional[Task]:
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
            return None

    def task_destroy(self, task_id: Identifier) -> bool:
        with self.app.get_db() as session:
            models.Task.Delete_By_Id(session, task_id)
            session.commit()
            return True

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

    def event_get(self, event_id: Identifier) -> Event | None:
        with self.app.get_db() as session:
            record = models.Event.Fetch_by_id(session, event_id)
            if record:
                response = record.to_dict()
                response["time"] = models.Event.GetAllTime(session, event_id)
                return response
            return None

    def event_update(
        self, event_id: Identifier, details: str | None = None, notes: str | None = None
    ) -> Event | None:
        with self.app.get_db() as session:
            record = models.Event.Fetch_by_id(session, event_id)
            if record:
                if details is not None:
                    record.details = details
                if notes is not None:
                    record.notes = notes
                session.add(record)
                session.commit()
                return record.to_dict()

            return None

    def event_destroy(self, event_id: Identifier) -> bool:
        with self.app.get_db() as session:
            retval = models.Event.Delete_By_Id(session, event_id)
            return retval

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
                start=start_dt, end=end_dt, seconds=seconds, stop_reason=key
            )
            session.add(entry)
            session.commit()
            return entry.to_dict()

    def entries_lists_by_event_id(self, event_id: Identifier) -> list[Entry]:
        with self.app.get_db() as session:
            return [
                entry.to_dict() for entry in models.Entry.GetByEvent(session, event_id)
            ]

    def entry_get(self, entry_id: Identifier) -> Entry | None:
        with self.app.get_db() as session:
            record = models.Entry.Fetch_by_id(session, entry_id)
            if record:
                return record.to_dict()
            return None

    def entry_update(
        self,
        entry_id: Identifier,
        start_dt: datetime.datetime | None = None,
        end_dt: datetime.datetime | None = None,
        seconds: int | None = None,
        reason: app_types.StopReasons | None = None,
    ) -> Entry:
        with self.app.get_db() as session:
            record = models.Entry.Fetch_by_id(session, entry_id)
            if start_dt is not None:
                record.started_on = start_dt
            if end_dt is not None:
                record.started_on = end_dt
            if seconds is not None:
                record.seconds = seconds
            if reason is not None:
                record.stop_reason = reason

            session.add(record)
            session.commit()
            return record.to_dict()

    def entry_destroy(self, entry_id: Identifier) -> bool:
        with self.app.get_db() as session:
            retval = models.Entry.Delete_By_Id(session, entry_id)
            session.commit()
            return retval

    def timer_check(self) -> bool:
        return self.timer is not None and self.timer.running is True

    def timer_owner(self) -> T.Optional[TimeOwner]:
        if self.timer is not None:
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
        return None

    def timer_override(self, new_receiver: Identifier) -> None:
        if self.timer is not None:
            old_receiver = self.timer.identifier
            self.timer.identifier = new_receiver
            self.app.clearCallback(old_receiver)

    def timer_start(
        self,
        listener_id: Identifier,
        task_id: Identifier,
    ) -> Event:
        with self.app.get_db() as session:
            event = models.Event.GetOrCreateByDate(session, task_id, DT.date.today())
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

    def open_window(self, win_name: str) -> bool:
        return self.app.open_window(self, win_name)

    def report_generate(self, payload: dict[str, str]) -> TimeReport:
        start_date = payload.get("start_date", None)
        end_date = payload.get("end_date", None)
        client_id = payload.get("client_id", None)
        project_id = payload.get("project_id", None)
        task_id = payload.get("task_id", None)
        wage = payload.get("wage", None)
        sort_order = payload.get("sort_order", ["cname", "dtwhen", "pname", "tname"])

        with self.app.get_db() as session:
            with self.app.get_db() as session:
                start_date = (
                    DT.datetime.strptime(start_date, "%Y-%m-%d").date()
                    if start_date is not None
                    else None
                )
                end_date = (
                    DT.datetime.strptime(end_date, "%Y-%m-%d").date()
                    if end_date is not None
                    else None
                )
                stmt = models.Queries.BreakdownByConditionsStmt(
                    client_id, project_id, task_id, start_date, end_date
                )

                def mk_time(my_seconds):
                    hours, rem = divmod(my_seconds, 3600)
                    minutes, seconds = divmod(rem, 60)
                    return int(hours), int(minutes), int(seconds)

                def to_dec(hours, minutes, seconds):
                    return hours + (minutes / 60) + (seconds / 3600)

                def to_frame(subframe) -> ReportTimeValues:
                    total_seconds = subframe["seconds"].sum()
                    total_time = mk_time(total_seconds)
                    total_dec = to_dec(*total_time)

                    return dict(
                        hours=total_time[0],
                        minutes=total_time[1],
                        seconds=total_time[2],
                        total_seconds=total_seconds,
                        decimal=total_dec,
                    )

                df = pd.read_sql(sql=stmt, con=self.app.engine)

                report = TimeReport(clients={}, **to_frame(df))

                for client, client_data in df.groupby("client_name"):
                    cname = str(client)
                    report["clients"][cname] = ClientTime(
                        projects={}, **to_frame(client_data)
                    )
                    for project, project_data in client_data.groupby("project_name"):
                        pname = str(project)
                        report["clients"][cname]["projects"][pname] = ProjectTime(
                            dates={}, **to_frame(project_data)
                        )

                        for dtwhen, date_data in client_data.groupby("date_when"):
                            my_date = str(dtwhen)
                            report["clients"][cname]["projects"][pname]["dates"][
                                my_date
                            ] = DateTimeCard(tasks=[], **to_frame(date_data))
                            for task, task_data in date_data.groupby("task_name"):
                                my_task = str(task)
                                report["clients"][cname]["projects"][pname]["dates"][
                                    my_date
                                ]["tasks"].append(
                                    TaskTimeCard(
                                        name=my_task,
                                        entries=task_data["entries"].sum(),
                                        **to_frame(task_data),
                                    )
                                )

        return report

    def report_build(
        self,
        payload: dict[str, str],
    ) -> TimeReport:
        start_date = payload.get("start_date", None)
        end_date = payload.get("end_date", None)
        client_id = payload.get("client_id", None)
        project_id = payload.get("project_id", None)
        task_id = payload.get("task_id", None)
        report_text = "Report:\n"
        with self.app.get_db() as session:
            start_date = (
                DT.datetime.strptime(start_date, "%Y-%m-%d").date()
                if start_date is not None
                else None
            )
            end_date = (
                DT.datetime.strptime(end_date, "%Y-%m-%d").date()
                if end_date is not None
                else None
            )

            timecards = models.Queries.BreakdownByConditions(
                session, client_id, project_id, task_id, start_date, end_date
            )

            if len(timecards) == 0:
                return None

            def make_time(total_time):
                my_hours, remainder = divmod(total_time, 3600)
                my_minutes, my_seconds = divmod(remainder, 60)
                return my_hours, my_minutes, my_seconds

            make_decimal = (
                lambda x: x["hours"] + (x["minutes"] / 60) + (x["seconds"] / 3600)
            )

            report = TimeReport(
                clients={},
                hours=0.0,
                minutes=0.0,
                seconds=0.0,
                total_seconds=0.0,
                decimal=0.0,
            )
            for timecard in timecards:
                if timecard.client_name not in report["clients"]:
                    report["clients"][timecard.client_name] = ClientTime(
                        projects={}, hours=0, minutes=0, seconds=0, total_seconds=0
                    )

                if (
                    timecard.project_name
                    not in report["clients"][timecard.client_name]["projects"]
                ):
                    report["clients"][timecard.client_name]["projects"][
                        timecard.project_name
                    ] = ProjectTime(
                        dates={},
                        hours=0,
                        minutes=0,
                        seconds=0,
                        total_seconds=0,
                        decimal=0,
                    )

                if (
                    timecard.date_when
                    not in report["clients"][timecard.client_name]["projects"][
                        timecard.project_name
                    ]["dates"]
                ):
                    report["clients"][timecard.client_name]["projects"][
                        timecard.project_name
                    ]["dates"][timecard.date_when] = []

                hours, minutes, seconds = make_time(timecard.seconds)
                computed = hours + (minutes / 60) + (seconds / 3600)
                report["clients"][timecard.client_name]["projects"][
                    timecard.project_name
                ]["dates"][timecard.date_when].append(
                    DateTimeCard(
                        name=timecard.task_name,
                        hours=hours,
                        minutes=minutes,
                        seconds=seconds,
                        total_seconds=timecard.seconds,
                        entries=timecard.entries,
                        decimal=computed,
                    )
                )

                report["clients"][timecard.client_name]["projects"][
                    timecard.project_name
                ]["seconds"] += timecard.seconds

            total_seconds = 0
            for client, client_data in report["clients"].items():
                project_seconds = 0
                for project, project_data in client_data["projects"].items():
                    date_seconds = 0
                    for date, entries in project_data["dates"].items():
                        entry_seconds = 0
                        for entry in entries:
                            entry_seconds += entry["total_seconds"]

                        date_seconds += entry_seconds

                    project_seconds += date_seconds
                    project_data["total_seconds"] = date_seconds
                    (
                        project_data["hours"],
                        project_data["minutes"],
                        project_data["seconds"],
                    ) = make_time(date_seconds)
                    project_data["decimal"] = make_decimal(project_data)

                total_seconds += project_seconds
                client_data["total_seconds"] = project_seconds
                (
                    client_data["hours"],
                    client_data["minutes"],
                    client_data["seconds"],
                ) = make_time(project_seconds)
                client_data["decimal"] = make_decimal(client_data)

            report["total_seconds"] = total_seconds
            (
                report["hours"],
                report["minutes"],
                report["seconds"],
            ) = make_time(total_seconds)
            report["decimal"] = make_decimal(report)

        return report

    def report_build2text(self, payload: dict[str, str]) -> str:
        report = self.report_build(payload)
        body = "Report:\n"
        if payload.get("start_date", None) is not None:
            body += f"Start:\t{payload['start_date']}\n"
        if payload.get("end_date", None) is not None:
            body += f"End:\t{payload['end_date']}\n"
        body += "\n"

        float2int = lambda x: f"{int(x):02}"

        print_time = (
            lambda x: f"{float2int(x['hours'])}:{float2int(x['minutes'])}:{float2int(x['seconds'])}"
        )

        for client, client_data in report["clients"].items():
            body += f"Client: {client}\t\t{print_time(client_data)}\n"
            for project, project_data in client_data["projects"].items():
                body += (
                    f"\tProject: {project}".ljust(35) + f"{print_time(project_data)}\n"
                )
                for date, tasks in project_data["dates"].items():
                    body += f"\t\t{date}\n"
                    for task in tasks:
                        body += (
                            f"\t\t\t{task['name']}".ljust(40) + f"{print_time(task)}\n"
                        )

        body += "\n"
        body += f"Total time: {round(report['decimal'],4)}\n"
        return body
