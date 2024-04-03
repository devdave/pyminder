"""
Bridge API between the frontend and the backend models & Application instance

"""
import io

import typing as T
import datetime as DT
import time
import contextlib
from decimal import Decimal

import pandas as pd

from . import models
from .application import Application

from .app_types import (
    Identifier,
    Client,
    Project,
    Task,
    Event,
    EventDate,
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
    ReportPayload,
    Shortcut,
)
from .log_helper import getLogger
from .timer import Timer

LOG = getLogger(__name__)


class API:
    """
    Project bridge API class

    """

    __app: Application
    # todo relocate this to app
    __timer: T.Optional["Timer"]

    def __init__(self, app):
        self.__app = app
        self.__timer = None

    def info(self, message: str) -> None:
        """
        Print a message to the console.

        :param message:
        :return:
        """
        if isinstance(message, str) and message.strip():
            LOG.info("frontend-> {}", message)
        elif message:
            LOG.info(
                f"frontend-> {message}",
            )

    def title_set(self, new_title: str) -> None:
        """
        Set the application window title.

        :param new_title:
        :return:
        """
        self.__app.main_window.set_title(new_title)

    def client_create(self, name: str) -> Client:
        """
        Create a client instance.
        :param name:
        :return:
        """
        with self.__app.get_db() as session:
            record = models.Client(name=name, is_active=True)
            session.add(record)
            session.commit()
            return record.to_dict()

    def clients_list(self) -> list[Client]:
        """
        List all clients.
        :return:
        """
        with self.__app.get_db() as session:
            return [record.to_dict() for record in models.Client.GetAll(session)]

    def client_list_active(self) -> list[Client]:
        """
        List all active clients.

        :return:
        """
        with self.__app.get_db() as session:
            return [record.to_dict() for record in models.Client.GetAllActive(session)]

    def client_get(self, client_id: Identifier) -> T.Optional[Client]:
        """
        Get a client instance.

        :param client_id:
        :return:
        """
        with self.__app.get_db() as session:
            record = models.Client.Fetch_by_id(session, client_id)
            if record:
                all_time = models.Client.GetAllTime(session, record.id)
                return record.to_dict() if all_time else None
            return None

    def client_update(
        self, client_id: Identifier, client_name: str
    ) -> T.Optional[Client]:
        """
        Update a client record.
        :param client_id:
        :param client_name:
        :return:
        """
        with self.__app.get_db() as session:
            record = models.Client.Fetch_by_id(session, client_id)
            if record:
                record.name = client_name
                session.add(record)
                session.commit()
                return record.to_dict()
            return None

    def client_destroy(self, client_id: Identifier) -> bool:
        """
        Destroy a client record.
        :param client_id:
        :return:
        """
        with self.__app.get_db() as session:
            models.Client.Delete_By_Id(session, client_id)
            session.commit()
            return True

    def project_create(self, client_id: Identifier, name: str) -> Project:
        """
        Create a project record.
        :param client_id:
        :param name:
        :return:
        """
        with self.__app.get_db() as session:
            record = models.Project(name=name, is_active=True, client_id=client_id)
            session.add(record)
            session.commit()
            return record.to_dict()

    def projects_list_by_client_id(self, client_id: Identifier) -> list[Project]:
        """
        List all projects by client.
        :param client_id:
        :return:
        """
        with self.__app.get_db() as session:
            return [
                record.to_dict()
                for record in models.Project.GetByClient(session, client_id)
            ]

    def projects_list_active_by_client_id(self, client_id: Identifier) -> list[Project]:
        """
        List all active projects by client.
        :param client_id:
        :return:
        """
        with self.__app.get_db() as session:
            return [
                record.to_dict()
                for record in models.Project.FetchActive_by_Client(session, client_id)
            ]

    def project_get(self, project_id: Identifier) -> Project:
        """
        Get a project record.
        :param project_id:
        :return:
        """
        with self.__app.get_db() as session:
            record = models.Project.Fetch_by_id(session, project_id).to_dict()
            record["time"] = models.Project.GetAllTime(session, project_id)
            return record

    def project_update(self, project_id: Identifier, project_name: str) -> Project:
        """
        Update a project record.
        :param project_id:
        :param project_name:
        :return:
        """
        with self.__app.get_db() as session:
            record = models.Project.Fetch_by_id(session, project_id)
            if record:
                record.name = project_name
                session.add(record)
                session.commit()
            return record.to_dict()

    def project_set_status(self, project_id: Identifier, status: bool) -> Project:
        """
        Set a project status.
        :param project_id:
        :param status:
        :return:
        """
        with self.__app.get_db() as session:
            record = models.Project.Fetch_by_id(session, project_id)
            record.is_active = status
            session.commit()
            return record.to_dict()

    def project_destroy(self, project_id: Identifier) -> bool:
        """
        Destroy a project record.
        :param project_id:
        :return:
        """
        with self.__app.get_db() as session:
            retval = models.Project.Delete_By_Id(session, project_id)
            session.commit()
            return retval

    def task_create(self, project_id: Identifier, name: str) -> Task:
        """
        Create a task record.
        :param project_id:
        :param name:
        :return:
        """
        with self.__app.get_db() as session:
            record = models.Task(name=name, project_id=project_id)
            session.add(record)
            session.commit()
            return record.to_dict()

    def tasks_lists_by_project_id(self, project_id: Identifier) -> list[Task]:
        """
        List all tasks by project.
        :param project_id:
        :return:
        """
        with self.__app.get_db() as session:
            return [
                record.to_dict()
                for record in models.Task.GetByProject(session, project_id)
            ]

    def tasks_list_active_by_project_id(self, project_id: Identifier) -> list[Task]:
        """
        List all active tasks by project.
        :param project_id:
        :return:
        """
        with self.__app.get_db() as session:
            return [
                record.to_dict()
                for record in models.Task.GetActiveByProject(session, project_id)
            ]

    def task_get(self, task_id: Identifier) -> Task:
        """
        Get a task record.
        :param task_id:
        :return:
        """
        with self.__app.get_db() as session:
            record = models.Task.Fetch_by_id(session, task_id).to_dict()
            record["time"] = models.Task.GetAllTime(session, task_id)
            return record

    def task_update(
        self, task_id: Identifier, name: str | None = None, status: str | None = None
    ) -> T.Optional[Task]:
        """
        Update a task record.
        :param task_id:
        :param name:
        :param status:
        :return:
        """
        with self.__app.get_db() as session:
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
        with self.__app.get_db() as session:
            models.Task.Delete_By_Id(session, task_id)
            session.commit()
            return True

    def task_set_status(self, task_id: Identifier, status: bool) -> bool:
        with self.__app.get_db() as session:
            status = models.Task.Update_Status(session, task_id, status)
            session.commit()
            return status

    def event_create(
        self,
        task_id: Identifier,
        start_date: DT.datetime.date | None = None,
        details: str | None = None,
        notes: str | None = None,
    ) -> Event:
        with self.__app.get_db() as session:
            my_date = start_date or DT.date.today()
            record = models.Event(
                start_date=my_date,
                task_id=task_id,
                details=details,
                notes=notes,
                is_active=True,
            )
            session.add(record)
            session.commit()
            return record.to_dict()

    def events_get_or_create_by_date(
        self, task_id: Identifier, start_date: DT.datetime.date | None = None
    ) -> list[Event]:
        with self.__app.get_db() as session:
            my_date = start_date or DT.date.today()
            record = models.Event.GetOrCreateByDate(session, task_id, my_date)
            return record.to_dict()

    def events_by_task_id(self, task_id: Identifier) -> list[Event]:
        with self.__app.get_db() as session:
            return [
                record.to_dict() for record in models.Event.GetByTask(session, task_id)
            ]

    def event_active_by_task_id(self, task_id: Identifier) -> T.List[Event]:
        with self.__app.get_db() as session:
            return [
                record.to_dict()
                for record in models.Event.GetActiveByTask(session, task_id)
            ]

    def event_get(self, event_id: Identifier) -> Event | None:
        with self.__app.get_db() as session:
            record = models.Event.Fetch_by_id(session, event_id)
            if record:
                response = record.to_dict()
                response["time"] = models.Event.GetAllTime(session, event_id)
                return response
            return None

    def event_get_by_date(
        self, task_id: Identifier, event_date: str | None
    ) -> Event | None:
        with self.__app.get_db() as session:
            record = models.Event.GetByDate(session, task_id, event_date)
            if record is not None:
                return record.to_dict()

            return None

    def event_list_dates_by_project_id(self, task_id: Identifier) -> list[EventDate]:
        with self.__app.get_db() as session:
            return [
                {"event_id": record.id, "start_date": record.start_date}
                for record in models.Event.GetAllEventDatesByTask(session, task_id)
            ]

    def event_update(
        self, event_id: Identifier, details: str | None = None, notes: str | None = None
    ) -> Event | None:
        with self.__app.get_db() as session:
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
        with self.__app.get_db() as session:
            retval = models.Event.Delete_By_Id(session, event_id)
            return retval

    def event_add_entry(
        self,
        event_id: Identifier,
        start_dt: DT.datetime,
        end_dt: DT.datetime,
        seconds: int,
        reason: str,
    ) -> Entry:
        with self.__app.get_db() as session:
            event = models.Event.Fetch_by_id(session, event_id)
            key = StopReasons[reason]
            entry = event.create_entry(
                start=start_dt, end=end_dt, seconds=seconds, stop_reason=key
            )
            session.add(entry)
            session.commit()
            return entry.to_dict()

    def entries_lists_by_event_id(self, event_id: Identifier) -> list[Entry]:
        with self.__app.get_db() as session:
            return [
                entry.to_dict() for entry in models.Entry.GetByEvent(session, event_id)
            ]

    def entry_get(self, entry_id: Identifier) -> Entry | None:
        with self.__app.get_db() as session:
            record = models.Entry.Fetch_by_id(session, entry_id)
            if record:
                return record.to_dict()
            return None

    def entry_update(
        self,
        entry_id: Identifier,
        start_dt: DT.datetime | None = None,
        end_dt: DT.datetime | None = None,
        seconds: int | None = None,
        reason: StopReasons | None = None,
    ) -> Entry:
        with self.__app.get_db() as session:
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
        with self.__app.get_db() as session:
            retval = models.Entry.Delete_By_Id(session, entry_id)
            session.commit()
            return retval

    def entry_create(
        self,
        event_id: Identifier,
        started_on: str,
        stopped_on: str,
        seconds: int | None = None,
    ) -> Entry:
        with self.__app.get_db() as session:
            LOG.debug(f"creating entry {started_on=} to {stopped_on=} with {seconds=}")
            started_on = DT.datetime.fromisoformat(started_on)
            stopped_on = DT.datetime.fromisoformat(stopped_on)

            if seconds is not None and seconds > 0:
                record = models.Entry(
                    started_on=started_on, stopped_on=stopped_on, seconds=seconds
                )
            else:
                diff = stopped_on - started_on
                record = models.Entry(
                    event_id=event_id,
                    started_on=started_on,
                    stopped_on=stopped_on,
                    seconds=int(diff.total_seconds()),
                    stop_reason=StopReasons.FINISHED,
                )

            session.add(record)
            session.commit()
            return record.to_dict()

    def timer_check(self) -> bool:
        return self.__timer is not None and self.__timer.running is True

    def timer_owner(self) -> T.Optional[TimeOwner]:
        if self.__timer is not None:
            with self.__app.get_db() as session:
                entry = models.Entry.Fetch_by_id(session, self.__timer.entry_id)
                event = entry.event
                task = event.task
                project = task.project
                client = project.client
                return TimeOwner(
                    client=client.to_dict(),
                    project=project.to_dict(),
                    task=task.to_dict(),
                    event=event.to_dict(),
                    isRunning=self.__timer.running,
                    isPaused=self.__timer.paused,
                )
        return None

    def timer_override(self, new_receiver: Identifier) -> None:
        if self.__timer is not None:
            old_receiver = self.__timer.identifier
            self.__timer.identifier = new_receiver
            self.__app.clearCallback(old_receiver)

    def timer_start(
        self,
        listener_id: Identifier,
        task_id: Identifier,
    ) -> Event:
        with self.__app.get_db() as session:
            event = models.Event.GetOrCreateByDate(session, task_id, DT.date.today())
            session.commit()
            event_id = event.id

        LOG.debug("timer_start {}", self.__timer)
        if self.__timer is None:
            LOG.debug("timer_starting for {}", listener_id)
            self.__timer = Timer(self.__app, listener_id, event_id, 0.500)

            self.__timer.start()
            LOG.debug("timer_started")

        with self.__app.get_db() as session:
            return models.Event.Fetch_by_id(session, event_id).to_dict()

    def timer_stop(self) -> bool:
        if self.__timer is not None:
            self.__timer.stop()
            time.sleep(1)
            while self.__timer.running:
                time.sleep(1)

            del self.__timer
            self.__timer = None
            return True

        return False

    def timer_pause(self) -> bool:
        if self.__timer is not None:
            self.__timer.pause()
            return True

        return False

    def timer_resume(self) -> bool:
        if self.__timer is not None:
            self.__timer.resume()
            return True
        return False

    def shortcut_get_all(self) -> list[Shortcut]:
        with self.__app.get_db() as session:
            return [record.to_dict() for record in models.Shortcut.GetAll(session)]

    def shortcut_get(self, shortcut_id: Identifier) -> Shortcut:
        with self.__app.get_db() as session:
            record = models.Shortcut.Fetch_by_id(session, shortcut_id)
            return record.to_dict()

    def shortcut_add(
        self, client_id: Identifier, project_id: Identifier, task_id: Identifier
    ) -> Shortcut:
        with self.__app.get_db() as session:
            record = models.Shortcut.GetOrCreate(
                session, client_id=client_id, project_id=project_id, task_id=task_id
            )
            return record.to_dict()

    def open_window(self, win_name: str) -> bool:
        return self.__app.open_window(self, win_name)

    def window_toggle_resize(self, win_name: str, size: str) -> bool:
        return self.__app.window_toggle_resize(win_name, size)

    def report_generate(self, payload: ReportPayload) -> TimeReport:
        end_date = payload.get("end_date", None)
        client_id = payload.get("client_id", None)
        project_id = payload.get("project_id", None)
        task_id = payload.get("task_id", None)
        # sort_order = payload.get("sort_order", ["cname", "dtwhen", "pname", "tname"])

        with self.__app.get_db():
            start_date = (
                DT.datetime.strptime(payload.get("start_date"), "%Y-%m-%d").date()
                if payload.get("start_date", None) is not None
                and isinstance(payload.get("start_date", None), str)
                else None
            )
            end_date = (
                DT.datetime.strptime(end_date, "%Y-%m-%d").date()
                if end_date is not None and isinstance(end_date, str)
                else None
            )  # type: DT.date
            stmt = models.Queries.BreakdownByConditionsStmt(
                client_id, project_id, task_id, start_date, end_date
            )

            def mk_time(my_seconds):
                hours, rem = divmod(my_seconds, 3600)
                minutes, seconds = divmod(rem, 60)
                return int(hours), int(minutes), int(seconds)

            def to_dec(hours, minutes, seconds):
                return hours + (minutes / 60) + (seconds / 3600)

            def to_frame(name, category, subframe) -> ReportTimeValues:
                total_seconds = subframe["seconds"].sum()
                total_time = mk_time(total_seconds)
                total_dec = to_dec(*total_time)

                return {
                    "name": name,
                    "category": category,
                    "hours": total_time[0],
                    "minutes": total_time[1],
                    "seconds": total_time[2],
                    "total_seconds": total_seconds,
                    "decimal": total_dec,
                }

            df = pd.read_sql_query(sql=stmt, con=self.__app.engine)

            report = TimeReport(clients={}, **to_frame("report", "report", df))

            for client, client_data in df.groupby("client_name"):
                cname = str(client)
                report["clients"][cname] = ClientTime(
                    projects={}, **to_frame(cname, "client", client_data)
                )
                for project, project_data in client_data.groupby("project_name"):
                    pname = str(project)
                    report["clients"][cname]["projects"][pname] = ProjectTime(
                        dates={}, **to_frame(pname, "project", project_data)
                    )

                    for dtwhen, date_data in project_data.groupby("date_when"):
                        my_date = str(dtwhen)
                        report["clients"][cname]["projects"][pname]["dates"][
                            my_date
                        ] = DateTimeCard(
                            tasks=[], **to_frame(my_date, "date", date_data)
                        )
                        for task, task_data in date_data.groupby("task_name"):
                            my_task = str(task)
                            report["clients"][cname]["projects"][pname]["dates"][
                                my_date
                            ]["tasks"].append(
                                TaskTimeCard(
                                    entries=task_data["entries"].sum(),
                                    **to_frame(my_task, "task", task_data),
                                )
                            )

        return report

    def report_build2text(self, payload: ReportPayload) -> str:
        report = self.report_generate(payload)

        def frame2time(frame):
            return f"{frame['hours']:02}:{frame['minutes']:02}:{frame['seconds']:02}"

        def get_wage(message: ReportPayload) -> Decimal | None:
            wage = message.get("wage", None)
            if wage and str(wage).isnumeric():
                return Decimal(wage)

            return None

        f = io.StringIO()
        with contextlib.redirect_stdout(f):
            print("Report: ")
            if payload.get("start_date", None) is not None:
                print(f"Start:\t{payload['start_date']}")
            if payload.get("end_date", None) is not None:
                print(f"End:\t{payload['end_date']}")

            wage = get_wage(payload)
            if wage:
                print("Hourly wage:", payload["wage"])
                total_time = Decimal(report["decimal"])
                print("Hours:", round(total_time, 2))
                print(f"Gross:\t{round(total_time * wage, 2)}")

            print()

            print("Client & project breakdown:")
            for cname, client in report["clients"].items():
                perc = client["total_seconds"] / report["total_seconds"]
                print(
                    "\tClient: ",
                    cname,
                    " - ",
                    frame2time(client),
                    f"{round(perc, 2) * 100}%",
                )
                for pname, project in client["projects"].items():
                    perc = project["total_seconds"] / client["total_seconds"]
                    print(
                        "\t\t\tProject: ",
                        pname,
                        " - ",
                        f"{round(perc, 2) * 100}%",
                        " - ",
                        frame2time(project),
                    )

            print()
            print("Daily details:")

            for cname, client in report["clients"].items():
                print("Client: ", cname)
                print("Total Time: ", frame2time(client))
                for pname, project in client["projects"].items():
                    print("\tProject: ", pname, frame2time(project))
                    for dtwhen, dateframe in project["dates"].items():
                        print("\t\tDate: ", dtwhen, "\t", frame2time(dateframe))
                        print("\t\ttasks: -")
                        for task in dateframe["tasks"]:
                            print("\t\t\t", task["name"].ljust(30), frame2time(task))
                        print()

        return f.getvalue()
