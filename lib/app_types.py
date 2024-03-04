import enum
import typing as T
from enum import Enum as pyEnum
import datetime as DT


Identifier = str | int


class TaskStatus(pyEnum):
    ACTIVE = "active"
    IN_PROGRESS = "in_progress"
    COMPLETE = "complete"
    CANCELLED = "cancelled"


class StopReasons(enum.Enum):
    PLACEHOLDER = "placeholder"
    PAUSED = "paused"
    FINISHED = "finished"


class Client(T.TypedDict):
    id: int
    name: str
    time: T.Optional["TimeObject"]


class Project(T.TypedDict):
    id: int
    name: str
    client_id: int
    time: T.Optional["TimeObject"]


class Task(T.TypedDict):
    id: int
    name: str
    project_id: int
    status: str
    time: T.Optional["TimeObject"]


class Event(T.TypedDict):
    id: int
    task_id: int
    start_date: str
    details: str
    notes: str
    time: T.Optional["TimeObject"]
    entries: list["Entry"]


class Entry(T.TypedDict):
    id: int
    event_id: int
    started_on: str
    stopped_on: str
    seconds: int
    stop_reason: str | StopReasons


class TimeOwner(T.TypedDict):
    client: Client
    project: Project
    task: Task
    event: Event
    isRunning: bool
    isPaused: bool


class TimeObject(T.TypedDict):
    seconds: int
    minutes: int
    hours: int


class ReportTimeValues(T.TypedDict):
    hours: float
    minutes: float
    seconds: float
    total_seconds: float
    decimal: float


class TaskTimeCard(ReportTimeValues):
    name: str
    entries: int


class DateTimeCard(ReportTimeValues):
    tasks: list[TaskTimeCard]


class ProjectTime(ReportTimeValues):
    dates: dict[str, DateTimeCard]


class ClientTime(ReportTimeValues):
    projects: dict[str, ProjectTime]


class TimeReport(ReportTimeValues):
    clients: dict[str, ClientTime]


class ReportPayload(T.TypedDict):
    start_date: str | DT.date | None
    end_date: str | DT.date | None
    client_id: int
    project_id: int
    task_id: int
    wage: int
    sort_order: list[str]
