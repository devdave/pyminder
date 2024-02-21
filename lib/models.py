import contextlib
import datetime as DT
import enum
import pathlib

from sqlalchemy import (
    select,
    update,
    ForeignKey,
    create_engine,
    func,
)
from sqlalchemy.orm import (
    Session,
    DeclarativeBase,
    Mapped,
    mapped_column,
    relationship,
    declared_attr,
    scoped_session,
    sessionmaker,
)

from .log_helper import getLogger

log = getLogger(__name__)


@contextlib.contextmanager
def db_with(db_url="sqlite:///test.sqlite3", echo=True):
    from sqlalchemy import create_engine

    engine = create_engine(db_url, echo=echo)
    Base.metadata.create_all(engine, checkfirst=True)

    with Session(engine) as session:
        yield session


def connect(db_path: pathlib.Path, echo=False):
    engine = create_engine(
        f"sqlite:///{db_path}", echo=echo, pool_size=10, max_overflow=20
    )
    Base.metadata.create_all(engine, checkfirst=True)

    session_factory = sessionmaker(bind=engine)

    return engine, scoped_session(session_factory)


class Base(DeclarativeBase):
    id: Mapped[int] = mapped_column(primary_key=True)

    created_on: Mapped[DT.datetime] = mapped_column(
        default=None, server_default=func.now()
    )
    updated_on: Mapped[DT.datetime] = mapped_column(
        default=None, server_default=func.now(), onupdate=func.now()
    )

    @classmethod
    def Touch(cls, session: Session, fetch_id: int):
        stmt = update(cls).where(cls.id == fetch_id).values()
        session.execute(stmt)

    def touch(self, session: Session):
        self.updated_on = DT.datetime.now()

    @classmethod
    def Fetch_by_id(cls, session: Session, fetch_id: int):
        stmt = select(cls).where(cls.id == fetch_id)
        return session.execute(stmt).scalars().one()

    @declared_attr.directive
    def __tablename__(self) -> str:
        return self.__name__

    def update(self, changeset):
        if not hasattr(self, "SAFE_KEYS"):
            raise AttributeError(
                f"Attempting to update {self} with `{changeset=}` but no safe keys"
            )

        for safe_key in getattr(self, "SAFE_KEYS", []):
            if safe_key not in changeset:
                setattr(self, safe_key, changeset[safe_key])


class Client(Base):
    name: Mapped[str] = mapped_column()


class Project(Base):
    name: Mapped[str] = mapped_column()

    client_id: Mapped[int] = mapped_column(ForeignKey("Client.id"), index=True)
    client: Mapped[Client] = relationship("Client", back_populates="projects")


from enum import Enum as pyEnum


class TaskStatus(pyEnum):
    ACTIVE = "active"
    IN_PROGRESS = "in_progress"
    COMPLETE = "complete"
    CANCELLED = "cancelled"


class Task(Base):
    project_id: Mapped[int] = mapped_column(ForeignKey("Project.id"), index=True)
    project: Mapped[Project] = relationship("Project", back_populates="tasks")

    status: Mapped[TaskStatus] = mapped_column(default=TaskStatus.ACTIVE)


class Event(Base):
    task_id: Mapped[int] = mapped_column(ForeignKey("Task.id"), index=True)
    task: Mapped[Task] = relationship("Task", back_populates="events")

    start_date: Mapped[DT.datetime] = mapped_column()

    detail: Mapped[str] = mapped_column()
    notes: Mapped[str] = mapped_column()

    duration: Mapped[int] = mapped_column()  # seconds


class StopReasons(enum.Enum):
    PAUSED = "Paused"
    INTERRUPTED = "Interrupted"
    FINISHED = "Finished"


class Entry(Base):
    event_id: Mapped[int] = mapped_column(ForeignKey("Event.id"), index=True)
    event: Mapped[Event] = relationship("Event", back_populates="entries")

    started_on: Mapped[DT.datetime] = mapped_column()
    stopped_on: Mapped[DT.datetime] = mapped_column()
    stop_reason: Mapped[StopReasons] = mapped_column()
