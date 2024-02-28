import contextlib
import datetime as DT
import enum
import pathlib
import typing as T

import sqlalchemy
from sqlalchemy import (
    select,
    update,
    ForeignKey,
    create_engine,
    func,
    UniqueConstraint,
    and_,
    delete,
    cast,
    Integer,
    CheckConstraint,
)
from sqlalchemy.ext.hybrid import hybrid_property, hybrid_method
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

from lib import app_types
from lib.app_types import TaskStatus, StopReasons, Identifier, TimeObject
from lib.log_helper import getLogger

log = getLogger(__name__)

Self = T.TypeVar("Self", bound="Base")


@contextlib.contextmanager
def db_with(db_url="sqlite:///test.sqlite3", echo=True):
    from sqlalchemy import create_engine

    engine = create_engine(db_url, echo=echo)
    Base.metadata.create_all(engine, checkfirst=True)

    with Session(engine) as session:
        yield session


def connect(db_path: pathlib.Path, echo=False, create=True):
    engine = create_engine(
        f"sqlite:///{db_path}", echo=echo, pool_size=10, max_overflow=20
    )
    if create:
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

    type_annotation_map = {
        enum.Enum: sqlalchemy.Enum(enum.Enum),
    }

    @classmethod
    def Touch(cls, session: Session, fetch_id: int):
        stmt = update(cls).where(cls.id == fetch_id).values()
        session.execute(stmt)

    def touch(self):
        self.updated_on = DT.datetime.now()

    @classmethod
    def Fetch_by_id(cls: type[Self], session: Session, fetch_id: Identifier) -> Self:
        stmt = select(cls).where(cls.id == fetch_id)
        return session.execute(stmt).scalars().one()

    @classmethod
    def Delete_By_Id(cls, session, client_id):
        stmt = delete(cls).where(cls.id == client_id)
        result = session.execute(stmt)
        return result.rowcount == 1

    @classmethod
    def GetAll(cls, session: Session):
        stmt = select(cls)
        return session.execute(stmt).scalars().all()

    @classmethod
    def GetOrCreate(cls, session: Session, defaults=None, **kwargs):
        instance = session.execute(select(cls).filter_by(**kwargs)).one_or_none()
        if instance:
            return instance
        else:
            kwargs |= defaults or {}
            instance = cls(**kwargs)
            try:
                session.add(instance)
                session.commit()
            except Exception as e:
                session.rollback()
                return session.execute(select(cls).filter_by(**kwargs)).one()
            else:
                return instance

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

    projects: Mapped[list["Project"]] = relationship(
        "Project", back_populates="client", cascade="all, delete-orphan"
    )

    def to_dict(self):
        return dict(name=self.name, id=self.id)

    @classmethod
    def GetTimeBetweenDates(
        cls, session: Session, client_id, start: DT.date, end: DT.date
    ):
        stmt = (
            select(func.sum(Entry.seconds).label("total_seconds"))
            .join(Project, Project.client_id == client_id)
            .join(Task, Task.project_id == Project.id)
            .join(Event, Event.task_id == Task.id)
            .where(Event.by_task_and_dates(Task.id, start, end))
            .where(Entry.event_id == Event.id)
        )
        row = session.execute(stmt).scalar()
        total = row.total_seconds if row and row.total_seconds > 0 else 0
        hours, remainder = divmod(total, 3600)
        minutes, seconds = divmod(remainder, 60)
        return app_types.TimeObject(
            hours=hours, minutes=minutes, seconds=round(seconds)
        )

    @classmethod
    def GetAllTime(cls, session: Session, client_id):
        stmt = (
            select(func.sum(Entry.seconds).label("total_seconds"))
            .join(Project, Project.client_id == client_id)
            .join(Task, Task.project_id == Project.id)
            .join(Event, Event.task_id == Task.id)
            .where(Entry.event_id == Event.id)
        )
        total_seconds = session.execute(stmt).scalar()
        total = total_seconds if total_seconds and total_seconds > 0 else 0
        hours, remainder = divmod(total, 3600)
        minutes, seconds = divmod(remainder, 60)
        return app_types.TimeObject(
            hours=hours, minutes=minutes, seconds=round(seconds)
        )


class Project(Base):
    name: Mapped[str] = mapped_column()

    client_id: Mapped[int] = mapped_column(ForeignKey("Client.id"), index=True)
    client: Mapped[Client] = relationship("Client", back_populates="projects")

    tasks: Mapped[list["Task"]] = relationship(
        "Task", back_populates="project", cascade="all, delete-orphan"
    )

    __table_args__ = (
        UniqueConstraint("client_id", "name", name="unique_client"),
        CheckConstraint(
            func.length(func.trim(sqlalchemy.column("name"))) > 0,
            name="name_is_not_empty",
        ),
    )

    def to_dict(self):
        return app_types.Project(
            id=self.id,
            name=self.name,
            client_id=self.client_id,
        )

    @classmethod
    def GetByClient(cls, session, client_id):
        stmt = select(cls).where(cls.client_id == client_id)
        return session.execute(stmt).scalars().all()

    @classmethod
    def GetAllTime(cls, session: Session, project_id: Identifier):
        stmt = (
            select(func.sum(Entry.seconds).label("total_seconds"))
            .join(Task, Task.project_id == project_id)
            .join(Event, Event.task_id == Task.id)
            .where(Entry.event_id == Event.id)
        )
        total_seconds = session.execute(stmt).scalar() or 0

        hours, remainder = divmod(total_seconds, 3600)
        minutes, seconds = divmod(remainder, 60)
        return app_types.TimeObject(
            hours=hours, minutes=minutes, seconds=round(seconds)
        )

    @classmethod
    def GetTimeBetweenDates(cls, session, project_id, start, end):
        stmt = (
            select(func.sum(Entry.seconds).label("total_seconds"))
            .join(Task, Task.project_id == project_id)
            .join(Event, Event.task_id == Task.id)
            .join(Entry, Entry.event_id == Event.id)
            .where(and_(Event.start_date > start, Event.start_date < end))
        )
        total_seconds = session.execute(stmt).scalar() or 0
        hours, remainder = divmod(total_seconds, 3600)
        minutes, seconds = divmod(remainder, 60)
        return app_types.TimeObject(
            hours=hours, minutes=minutes, seconds=round(seconds)
        )


class Task(Base):
    name: Mapped[str] = mapped_column(index=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("Project.id"), index=True)
    project: Mapped[Project] = relationship("Project", back_populates="tasks")

    status: Mapped[TaskStatus] = mapped_column(default=TaskStatus.ACTIVE)
    events: Mapped[list["Event"]] = relationship(
        "Event", back_populates="task", cascade="all, delete-orphan"
    )

    __table_args__ = (
        UniqueConstraint("project_id", "name", name="unique_task"),
        CheckConstraint("length(trim(name)) != 0", name="name_not_empty"),
    )

    def to_dict(self) -> dict[str, str | int]:
        return app_types.Task(
            id=self.id,
            name=self.name,
            project_id=self.project_id,
            status=self.status.value,
            hours=self.hours,
            minutes=self.minutes,
            seconds=self.seconds,
        )

    @classmethod
    def GetByProject(cls, session, project_id):
        stmt = select(cls).where(cls.project_id == project_id)
        return session.execute(stmt).scalars().all()

    @classmethod
    def GetTimeBetweenDates(cls, session, task_id, start, end):
        stmt = (
            select(func.sum(Entry.seconds).label("total_seconds"))
            .join(Event, Event.task_id == task_id)
            .join(Entry, Entry.event_id == Event.id)
            .where(and_(Event.start_date > start, Event.start_date < end))
        )
        total_seconds = session.execute(stmt).scalar() or 0
        hours, remainder = divmod(total_seconds, 3600)
        minutes, seconds = divmod(remainder, 60)

        return TimeObject(hours=hours, minutes=minutes, seconds=seconds)

    @classmethod
    def GetAllTime(cls, session, task_id):
        stmt = (
            select(func.sum(Entry.seconds).label("total_seconds"))
            .join(Event, Event.task_id == task_id)
            .where(Entry.event_id == Event.id)
        )

        total_seconds = session.execute(stmt).scalar() or 0
        hours, remainder = divmod(total_seconds, 3600)
        minutes, seconds = divmod(remainder, 60)

        return TimeObject(hours=hours, minutes=minutes, seconds=seconds)


class Event(Base):
    task_id: Mapped[int] = mapped_column(ForeignKey("Task.id"), index=True)
    task: Mapped[Task] = relationship("Task", back_populates="events")

    start_date: Mapped[DT.date] = mapped_column()

    details: Mapped[str] = mapped_column(default="")
    notes: Mapped[str] = mapped_column(default="")

    duration: Mapped[int] = mapped_column(default=0)  # seconds

    entries: Mapped[list["Entry"]] = relationship(
        "Entry", back_populates="event", cascade="all, delete-orphan"
    )

    __table_args__ = (UniqueConstraint("task_id", "start_date", name="unique_event"),)

    def to_dict(self):
        app_types.Event(
            task_id=self.task_id,
            start_date=self.start_date,
            details=self.details,
            notes=self.notes,
            duration=self.duration,
            entries=[entry.to_dict() for entry in self.entries],
        )

    def create_entry(self, start: DT.date, end: DT.date, seconds: int) -> "Entry":
        entry = Entry(
            event=self,
            started_on=start,
            stopped_on=end,
            seconds=seconds,
            stop_reason=StopReasons.PLACEHOLDER,
        )
        self.entries.append(entry)
        return entry

    @classmethod
    def GetByTask(cls, session, task_id):
        stmt = select(cls).filter(cls.by_task(task_id))
        return session.execute(stmt).scalars().all()

    @hybrid_method
    def by_task(self, task_id: Identifier):
        return self.task_id == task_id

    @hybrid_method
    def by_task_and_dates(
        self, task_id: Identifier, start_date: DT.date, end_date: DT.date
    ):
        return and_(
            self.by_task(task_id),
            and_(Event.start_date <= start_date, Event.start_date <= end_date),
        )

    @hybrid_method
    def by_dates(self, start_date: DT.date, end_date: DT.date):
        return and_(Event.start_date <= start_date, Event.start_date <= end_date)

    @classmethod
    def GetOrCreateByDate(cls, session, task_id, my_date):
        return cls.GetOrCreate(session, task_id=task_id, start_date=my_date)

    @hybrid_property
    def total_seconds(self):
        return sum(entry.seconds for entry in self.entries)

    @classmethod
    def GetTimeBetweenDates(
        cls, session, event_id: Identifier, start: DT.date, end: DT.date
    ):
        stmt = (
            select(func.sum(Entry.seconds).label("total_seconds"))
            .join(Entry, Entry.event_id == event_id)
            .filter(cls.by_dates(start, end))
        )
        total_seconds = session.execute(stmt).scalar().total_seconds or 0

        hours, remainder = divmod(total_seconds, 3600)
        minutes, seconds = divmod(remainder, 60)
        return TimeObject(hours=hours, minutes=minutes, seconds=seconds)

    @classmethod
    def GetAllTime(cls, session, event_id: Identifier):
        stmt = select(func.sum(Entry.seconds).label("total_seconds")).join(
            Entry, Entry.event_id == event_id
        )
        total_seconds = session.execute(stmt).scalar().total_seconds or 0

        hours, remainder = divmod(total_seconds, 3600)
        minutes, seconds = divmod(remainder, 60)
        return TimeObject(hours=hours, minutes=minutes, seconds=seconds)


class Entry(Base):
    event_id: Mapped[int] = mapped_column(ForeignKey("Event.id"), index=True)
    event: Mapped[Event] = relationship("Event", back_populates="entries")

    started_on: Mapped[DT.datetime] = mapped_column()
    stopped_on: Mapped[DT.datetime] = mapped_column()
    seconds: Mapped[int] = mapped_column()
    stop_reason: Mapped[StopReasons]

    def to_dict(self):
        dict(
            event_id=self.event_id,
            started_on=self.started_on,
            stopped_on=self.stopped_on,
            seconds=self.seconds,
            stop_reason=self.stop_reason.value,
        )

    @hybrid_property
    def minutes(self):
        hours, remainder = divmod(self.seconds, 3600)
        minutes, seconds = divmod(remainder, 60)
        return int(minutes)

    @hybrid_property
    def hours(self):
        hours, remainder = divmod(self.seconds, 3600)
        return int(hours)

    @classmethod
    def GetByEvent(cls, session, event_id):
        stmt = select(cls).where(cls.event_id == event_id)
        return session.execute(stmt).scalars().all()


class Queries:
    @classmethod
    def _BaseSelect(cls):
        return (
            select(
                (func.strftime("%Y-%m-%d", Entry.started_on)).label("dtwhen"),
                Client.name.label("cname"),
                Project.name.label("pname"),
                Task.name.label("tname"),
                cast(
                    func.round(func.sum(Entry.seconds) / 3600).label("hours"),
                    Integer,
                ),
                cast(
                    func.round(func.sum(Entry.seconds) % 3600 / 60).label("minutes"),
                    Integer,
                ),
                func.count(Entry.id).label("entries"),
            )
            .select_from(Event)
            .join(Entry, Entry.event_id == Event.id)
            .join(Task, Event.task_id == Task.id)
            .join(Project, Task.project_id == Project.id)
            .join(Client, Project.client_id == Client.id)
            .group_by("cname", "pname", "tname", "dtwhen")
            .order_by("dtwhen")
        )

    @classmethod
    def BreakdownAll(cls, session):
        stmt = cls._BaseSelect()
        return session.execute(stmt).all()

    def BreakdownClient(cls, session, client_name):
        stmt = cls._BaseSelect().where(Client.name == client_name)
        result = session.execute(stmt).all()
        return result

    def BreakdownClientProjectDate(cls, session, client_name, project_name, target):
        stmt = (
            cls._BaseSelect()
            .where(Client.name == client_name)
            .where(Project.name == project_name)
            .where(Event.start_date == target)
        )
        return session.execute(stmt).all()

    def BreakdownClientProjectBetweenDates(
        cls, session, client_name, project_name, start_date, end_date
    ):
        stmt = (
            cls._BaseSelect()
            .where(Client.name == client_name)
            .where(Project.name == project_name)
            .where(Event.start_date >= start_date)
            .where(Event.start_date <= end_date)
        )
        return session.execute(stmt).all()
