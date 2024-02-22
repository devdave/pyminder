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
    UniqueConstraint,
    and_,
    delete,
)
from sqlalchemy.ext.hybrid import hybrid_property
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

from .app_types import TaskStatus
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

    def touch(self):
        self.updated_on = DT.datetime.now()

    @classmethod
    def Fetch_by_id(cls, session: Session, fetch_id: int):
        stmt = select(cls).where(cls.id == fetch_id)
        return session.execute(stmt).scalars().one()

    @classmethod
    def Delete_By_Id(cls, session, client_id):
        stmt = delete(cls).where(cls.id == client_id)
        session.execute(stmt)

    @classmethod
    def GetAll(cls, session: Session):
        stmt = select(cls)
        return session.execute(stmt).scalars().all()

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

    projects: Mapped[list["Project"]] = relationship("Project", back_populates="client")


class Project(Base):
    name: Mapped[str] = mapped_column()

    client_id: Mapped[int] = mapped_column(ForeignKey("Client.id"), index=True)
    client: Mapped[Client] = relationship("Client", back_populates="projects")

    tasks: Mapped[list["Task"]] = relationship("Task", back_populates="project")

    @classmethod
    def GetByClient(cls, session, client_id):
        stmt = select(cls).where(cls.client_id == client_id)
        return session.execute(stmt).scalars().all()

    @classmethod
    def GetTimeBetweenDates(cls, session, project_id, start, end):
        stmt = (
            select(cls)
            .join(Task.project_id == Event.task_id)
            .join(Event.task_id == Task.id)
            .where(Task.project_id == project_id)
            .where(and_(Event.start_date > start, Event.start_date < end))
        )
        records = session.execute(stmt).scalars().all()
        hours, minutes, seconds = 0, 0, 0
        for record in records:
            hours += record.hours
            minutes += record.minutes
            seconds += record.seconds

        return hours, minutes, seconds

    @hybrid_property
    def seconds(self):
        return sum(self.tasks.seconds)

    @hybrid_property
    def minutes(self):
        return sum(self.tasks.minutes)

    @hybrid_property
    def hours(self):
        return sum(self.tasks.hours)


class Task(Base):
    name: Mapped[str] = mapped_column(index=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("Project.id"), index=True)
    project: Mapped[Project] = relationship("Project", back_populates="tasks")

    status: Mapped[TaskStatus] = mapped_column(default=TaskStatus.ACTIVE)
    events: Mapped[list["Event"]] = relationship("Event", back_populates="task")

    __table_args__ = (UniqueConstraint("project_id", "name", name="unique_task"),)

    @classmethod
    def GetByProject(cls, session, project_id):
        stmt = select(cls).where(cls.project_id == project_id)
        return session.execute(stmt).scalars().all()

    @classmethod
    def GetTimeBetweenDates(cls, session, task_id, start, end):
        stmt = (
            select(cls)
            .join(Task.project_id == Event.task_id)
            .join(Entry.event_id == Event.id)
            .where(Task.id == task_id)
            .where(and_(Event.start_date > start, Event.start_date < end))
        )
        records = session.execute(stmt).scalars().all()
        hours, minutes, seconds = 0, 0, 0
        for record in records:
            hours += record.hours
            minutes += record.minutes
            seconds += record.seconds

        return hours, minutes, seconds

    @hybrid_property
    def seconds(self):
        return sum(event.seconds for event in self.events)

    @hybrid_property
    def minutes(self):
        return sum(event.minutes for event in self.events)

    @hybrid_property
    def hours(self):
        return sum(event.hours for event in self.events)


class Event(Base):
    task_id: Mapped[int] = mapped_column(ForeignKey("Task.id"), index=True)
    task: Mapped[Task] = relationship("Task", back_populates="events")

    start_date: Mapped[DT.date] = mapped_column()

    detail: Mapped[str] = mapped_column()
    notes: Mapped[str] = mapped_column()

    duration: Mapped[int] = mapped_column()  # seconds

    entries: Mapped[list["Entry"]] = relationship("Event", back_populates="event")

    @classmethod
    def GetByTask(cls, session, task_id):
        stmt = select(cls).where(cls.task_id == task_id)
        return session.execute(stmt).scalars().all()

    @hybrid_property
    def seconds(self):
        return sum(entry.seconds for entry in self.entries)

    @hybrid_property
    def minutes(self):
        return sum(entry.minutes for entry in self.entries)

    @hybrid_property
    def hours(self):
        return sum(entry.hours for entry in self.entries)


class StopReasons(enum.Enum):
    PAUSED = "Paused"
    FINISHED = "Finished"


class Entry(Base):
    event_id: Mapped[int] = mapped_column(ForeignKey("Event.id"), index=True)
    event: Mapped[Event] = relationship("Event", back_populates="entries")

    started_on: Mapped[DT.datetime] = mapped_column()
    stopped_on: Mapped[DT.datetime] = mapped_column()
    stop_reason: Mapped[StopReasons] = mapped_column()

    @hybrid_property
    def seconds(self):
        return (self.stopped_on - self.started_on).seconds

    @hybrid_property
    def minutes(self):
        minutes, remainder = divmod(self.seconds, 60)
        return minutes

    @hybrid_property
    def hours(self):
        hours, remainder = divmod(self.seconds, 3600)
        return hours

    @classmethod
    def GetByEvent(cls, session, event_id):
        stmt = select(cls).where(cls.event_id == event_id)
        return session.execute(stmt).scalars().all()
