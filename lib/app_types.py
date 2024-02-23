import datetime
import typing as T
from enum import Enum as pyEnum


Identifier = str | int


class TaskStatus(pyEnum):
    ACTIVE = "active"
    IN_PROGRESS = "in_progress"
    COMPLETE = "complete"
    CANCELLED = "cancelled"


class StopReasons(pyEnum):
    PAUSED = "Paused"
    FINISHED = "Finished"


class Client(T.TypedDict):
    id: int
    name: str


class Project(T.TypedDict):
    id: int
    name: str
    client_id: int
    seconds: int
    minutes: int
    hours: int


class Task(T.TypedDict):
    id: int
    name: str
    project_id: int
    status: TaskStatus
    seconds: int
    minutes: int
    hours: int


class Event(T.TypedDict):
    id: int
    task_id: int
    start_date: datetime.date
    details: str
    notes: str
    duration: int
    hours: int
    minutes: int
    seconds: int
    entries: list["Entry"]


class Entry(T.TypedDict):
    id: int
    event_id: int
    started_on: datetime.date
    ended_on: datetime.date
    seconds: int
    stop_reason: str
