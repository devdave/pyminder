import typing as T
from enum import Enum as pyEnum


Identifier = str | int


class Client(T.TypedDict):
    id: int
    name: str


class Project(T.TypedDict):
    id: int
    name: str
    client_id: int


class Task(T.TypedDict):
    id: int
    name: str
    project_id: int


class Event(T.TypedDict):
    id: int
    task_id: int
    hours: int
    minutes: int
    seconds: int


class TaskStatus(pyEnum):
    ACTIVE = "active"
    IN_PROGRESS = "in_progress"
    COMPLETE = "complete"
    CANCELLED = "cancelled"
