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


class Base(T.TypedDict):
    id: Identifier
    is_active: bool
    created_on: DT.datetime
    updated_on: DT.datetime


class Client(Base):
    name: str
    projects_count: int
    time: T.Optional["TimeObject"]


class Project(Base):
    name: str
    client_id: int
    tasks_count: int
    time: T.Optional["TimeObject"]


class Task(Base):
    name: str
    project_id: int
    status: str
    events_count: int
    time: T.Optional["TimeObject"]


class Event(Base):
    task_id: int
    start_date: str
    details: str
    notes: str
    time: T.Optional["TimeObject"]
    entries: list["Entry"]


class EventDate(T.TypedDict):
    event_id: Identifier
    start_date: str | DT.datetime


class Entry(Base):
    event_id: int
    started_on: str
    stopped_on: str
    seconds: int
    stop_reason: str | StopReasons


class Shortcut(Base):
    compound_name: list[str]
    client_id: Identifier
    project_id: Identifier
    task_id: Identifier


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
    name: str
    category: str


class TaskTimeCard(ReportTimeValues):
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


class Timeframe:
    seconds: float
    child_type: str
    children: list["Timeframe"]


class TimeReportCard(T.TypedDict):
    options: ReportPayload
    seconds: float
    child_type: str
    children: list[Timeframe]
