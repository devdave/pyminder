import datetime
import enum
import typing as T
from enum import Enum as pyEnum


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
