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
    CheckConstraint,
    true,
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
    InstrumentedAttribute,
)

from . import app_types
from .app_types import TaskStatus, StopReasons, Identifier, TimeObject
from .log_helper import getLogger

log = getLogger(__name__)


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
    is_active: Mapped[bool] = mapped_column(default=True, server_default=true())

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
    def Fetch_by_id(cls, session: Session, fetch_id: Identifier) -> T.Self:
        stmt = select(cls).where(cls.id == fetch_id)
        return session.execute(stmt).scalars().one()

    @classmethod
    def FetchActive_by_id(cls, session: Session, fetch_id: Identifier) -> T.Self:
        stmt = select(cls).where(cls.id == fetch_id).where(cls.is_active == true())
        return session.execute(stmt).scalars().one()

    @classmethod
    def Delete_By_Id(cls, session, client_id) -> bool:
        stmt = delete(cls).where(cls.id == client_id)
        result = session.execute(stmt)
        return result.rowcount == 1

    @classmethod
    def GetAll(cls, session: Session) -> T.Sequence[T.Self]:
        stmt = select(cls)
        return session.execute(stmt).scalars().all()

    @classmethod
    def GetAllActive(cls, session: Session) -> T.Sequence[T.Self]:
        stmt = select(cls).where(cls.is_active == true())
        return session.execute(stmt).scalars().all()

    @classmethod
    def GetOrCreate(cls, session: Session, defaults=None, **kwargs) -> T.Self | None:
        instance = session.execute(select(cls).filter_by(**kwargs)).one_or_none()
        if instance:
            return instance[0]
        else:
            kwargs |= defaults or {}
            new_instance = cls(**kwargs)
            try:
                session.add(new_instance)
                session.commit()
            except sqlalchemy.exc.IntegrityError:  # type: ignore
                session.rollback()
                return session.execute(select(cls).filter_by(**kwargs)).one()[0]
            else:
                return new_instance

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

    shortcuts: Mapped[list["Shortcut"]] = relationship(
        "Shortcut", back_populates="client", cascade="all, delete-orphan"
    )

    def to_dict(self) -> app_types.Client:
        return app_types.Client(
            name=self.name,
            id=self.id,
            is_active=self.is_active,
            projects_count=len(self.projects),
            time=None,
            created_on=self.created_on.isoformat(),
            updated_on=self.updated_on.isoformat(),
        )

    @classmethod
    def GetTimeBetweenDates(
        cls, session: Session, client_id, start: DT.date, end: DT.date
    ) -> app_types.TimeObject:
        stmt = (
            select(func.sum(Entry.seconds).label("total_seconds"))
            .join(Project, Project.client_id == client_id)
            .join(Task, Task.project_id == Project.id)
            .join(Event, Event.task_id == Task.id)
            .where(Event.by_task_and_dates(Task.id, start, end))
            .where(Entry.event_id == Event.id)
        )
        total_seconds = session.execute(stmt).scalar() or 0
        hours, remainder = divmod(total_seconds, 3600)
        minutes, seconds = divmod(remainder, 60)
        return app_types.TimeObject(
            hours=hours, minutes=minutes, seconds=round(seconds)
        )

    @classmethod
    def GetAllTime(cls, session: Session, client_id) -> app_types.TimeObject:
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

    client_id: Mapped[int] = mapped_column(
        ForeignKey("Client.id", ondelete="CASCADE", name="fk_project_client"),
        index=True,
    )
    client: Mapped[Client] = relationship("Client", back_populates="projects")

    tasks: Mapped[list["Task"]] = relationship(
        "Task", back_populates="project", cascade="all, delete-orphan"
    )

    shortcuts: Mapped[list["Shortcut"]] = relationship(
        "Shortcut", back_populates="project", cascade="all, delete-orphan"
    )

    __table_args__ = (
        UniqueConstraint("client_id", "name", name="unique_client"),
        CheckConstraint(
            func.length(func.trim(sqlalchemy.column("name"))) > 0,
            name="name_is_not_empty",
        ),
    )

    def to_dict(self) -> app_types.Project:
        return app_types.Project(
            id=self.id,
            name=self.name,
            client_id=self.client_id,
            is_active=self.is_active,
            tasks_count=len(self.tasks),
            time=None,
            created_on=self.created_on.isoformat(),
            updated_on=self.updated_on.isoformat(),
        )

    @classmethod
    def GetByClient(cls, session, client_id) -> T.Sequence[T.Self]:
        stmt = select(cls).where(cls.client_id == client_id)
        return session.execute(stmt).scalars().all()

    @classmethod
    def FetchActive_by_Client(cls, session, client_id):
        stmt = (
            select(cls).where(cls.client_id == client_id).where(cls.is_active == true())
        )
        return session.execute(stmt).scalars().all()

    @classmethod
    def GetAllTime(
        cls, session: Session, project_id: Identifier
    ) -> app_types.TimeObject:
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
    def GetTimeBetweenDates(
        cls, session, project_id, start, end
    ) -> app_types.TimeObject:
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

    project_id: Mapped[int] = mapped_column(
        ForeignKey("Project.id", ondelete="CASCADE", name="fk_task_project"), index=True
    )
    project: Mapped[Project] = relationship("Project", back_populates="tasks")

    status: Mapped[TaskStatus] = mapped_column(default=TaskStatus.ACTIVE)
    events: Mapped[list["Event"]] = relationship(
        "Event", back_populates="task", cascade="all, delete-orphan"
    )

    shortcuts: Mapped[list["Shortcut"]] = relationship(
        "Shortcut", back_populates="task", cascade="all, delete-orphan"
    )

    __table_args__ = (
        UniqueConstraint("project_id", "name", name="unique_task"),
        CheckConstraint("length(trim(name)) != 0", name="name_not_empty"),
    )

    def to_dict(self) -> app_types.Task:
        return app_types.Task(
            id=self.id,
            name=self.name,
            project_id=self.project_id,
            status=self.status.value,
            is_active=self.is_active,
            events_count=len(self.events),
            time=None,
            created_on=self.created_on.isoformat(),
            updated_on=self.updated_on.isoformat(),
        )

    @classmethod
    def GetByProject(cls, session, project_id) -> list["Task"]:
        stmt = (
            select(cls)
            .where(cls.project_id == project_id)
            .order_by(cls.created_on.desc())
        )
        return session.execute(stmt).scalars().all()

    @classmethod
    def GetActiveByProject(cls, session, project_id) -> list["Task"]:
        stmt = (
            select(cls)
            .where(cls.project_id == project_id)
            .where(cls.is_active == true())
            .order_by(cls.created_on.desc())
        )
        return session.execute(stmt).scalars().all()

    @classmethod
    def GetTimeBetweenDates(cls, session, task_id, start, end) -> app_types.TimeObject:
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
    def GetAllTime(cls, session, task_id) -> app_types.TimeObject:
        stmt = (
            select(func.sum(Entry.seconds).label("total_seconds"))
            .join(Event, Event.task_id == task_id)
            .where(Entry.event_id == Event.id)
        )

        total_seconds = session.execute(stmt).scalar() or 0
        hours, remainder = divmod(total_seconds, 3600)
        minutes, seconds = divmod(remainder, 60)

        return TimeObject(hours=hours, minutes=minutes, seconds=seconds)

    @classmethod
    def Update_Status(cls, session: Session, task_id: Identifier, status: bool) -> bool:
        stmt = update(cls).values(is_active=status).where(cls.id == task_id)
        return session.execute(stmt).rowcount == 1


class Event(Base):
    task_id: Mapped[int] = mapped_column(
        ForeignKey("Task.id", ondelete="CASCADE"), index=True
    )
    task: Mapped[Task] = relationship("Task", back_populates="events")

    start_date: Mapped[DT.date] = mapped_column()

    details: Mapped[str] = mapped_column(default="")
    notes: Mapped[str] = mapped_column(default="")

    duration: Mapped[int] = mapped_column(default=0)  # seconds

    entries: Mapped[list["Entry"]] = relationship(
        "Entry", back_populates="event", cascade="all, delete-orphan"
    )

    __table_args__ = (UniqueConstraint("task_id", "start_date", name="unique_event"),)

    def to_dict(self) -> app_types.Event:
        return app_types.Event(
            id=self.id,
            task_id=self.task_id,
            start_date=self.start_date.strftime("%Y-%m-%d"),
            details=self.details,
            notes=self.notes,
            is_active=self.is_active,
            entries=[entry.to_dict() for entry in self.entries],
            time=None,
            created_on=self.created_on.isoformat(),
            updated_on=self.updated_on.isoformat(),
        )

    def create_entry(
        self,
        start: DT.datetime,
        end: DT.datetime,
        seconds: int,
        stop_reason=StopReasons.PLACEHOLDER,
    ) -> "Entry":
        entry = Entry(
            event=self,
            started_on=start,
            stopped_on=end,
            seconds=seconds,
            stop_reason=stop_reason,
        )
        # self.entries.append(entry)
        return entry

    def get_time(self):
        total_seconds = sum(entry.seconds for entry in self.entries)
        hours, remainder = divmod(total_seconds, 3600)
        minutes, seconds = divmod(remainder, 60)
        return TimeObject(hours=hours, minutes=minutes, seconds=seconds)

    @classmethod
    def GetByTask(cls, session, task_id) -> T.Sequence["Event"]:
        stmt = select(cls).filter(cls.by_task(task_id))
        return session.execute(stmt).scalars().all()

    @classmethod
    def GetActiveByTask(cls, session, task_id) -> T.Sequence["Event"]:
        stmt = select(cls).filter(cls.by_task(task_id)).where(cls.is_active == true())
        return session.execute(stmt).scalars().all()

    @hybrid_method
    def by_task(self, task_id: Identifier | InstrumentedAttribute[int]):
        return self.task_id == task_id

    @hybrid_method
    def by_task_and_dates(
        self,
        task_id: Identifier | InstrumentedAttribute[int],
        start_date: DT.date,
        end_date: DT.date,
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
    ) -> app_types.TimeObject:
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
    def GetAllTime(cls, session, event_id: Identifier) -> app_types.TimeObject:
        stmt = (
            select(func.sum(Entry.seconds).label("total_seconds"))
            .select_from(Event)
            .join(Entry, Entry.event_id == event_id)
        )
        total_seconds = session.execute(stmt).scalar() or 0

        hours, remainder = divmod(total_seconds, 3600)
        minutes, seconds = divmod(remainder, 60)
        return TimeObject(hours=hours, minutes=minutes, seconds=seconds)

    @classmethod
    def GetByDate(cls, session, task_id, event_date):
        smt = (
            select(cls)
            .where(cls.task_id == task_id)
            .where(cls.start_date == event_date)
        )
        return session.execute(smt).one_or_none()

    @classmethod
    def GetAllEventDatesByTask(
        cls, session, task_id: Identifier | InstrumentedAttribute[int]
    ):
        stmt = select(cls.id, cls.start_date).where(cls.task_id == task_id)
        return session.execute(stmt).scalars().all()


class Entry(Base):
    event_id: Mapped[int] = mapped_column(
        ForeignKey("Event.id", ondelete="CASCADE"), index=True
    )
    event: Mapped[Event] = relationship("Event", back_populates="entries")

    started_on: Mapped[DT.datetime] = mapped_column()
    stopped_on: Mapped[DT.datetime] = mapped_column()
    seconds: Mapped[int] = mapped_column()
    stop_reason: Mapped[StopReasons]

    def to_dict(self) -> app_types.Entry:
        return app_types.Entry(
            id=self.id,
            event_id=self.event_id,
            started_on=self.started_on.strftime("%Y-%m-%d %H:%M:%S"),
            stopped_on=self.stopped_on.strftime("%Y-%m-%d %H:%M:%S"),
            seconds=self.seconds,
            stop_reason=self.stop_reason.value,
            created_on=self.created_on.isoformat(),
            updated_on=self.updated_on.isoformat(),
            is_active=self.is_active,
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
    def GetByEvent(cls, session, event_id) -> T.Sequence["Entry"]:
        stmt = select(cls).where(cls.event_id == event_id)
        return session.execute(stmt).scalars().all()


class Shortcut(Base):
    client: Mapped[Client] = relationship("Client", back_populates="shortcuts")
    client_id: Mapped[int] = mapped_column(ForeignKey("Client.id"))

    project: Mapped[Project] = relationship("Project", back_populates="shortcuts")
    project_id: Mapped[int] = mapped_column(ForeignKey("Project.id"))

    task: Mapped[Task] = relationship("Task", back_populates="shortcuts")
    task_id: Mapped[int] = mapped_column(ForeignKey("Task.id"))

    @hybrid_property
    def name(self) -> str:
        return f"{self.client.name}->{self.project.name}->{self.task.name}"

    @classmethod
    def GetAll(cls, session: Session) -> T.Sequence[T.Self]:
        return (
            session.execute(select(cls).order_by(cls.created_on.asc())).scalars().all()
        )

    @classmethod
    def GetAllReversed(cls, session: Session) -> T.Sequence[T.Self]:
        return (
            session.execute(select(cls).order_by(cls.created_on.desc())).scalars().all()
        )

    @classmethod
    def GetOrCreate(
        cls,
        session,
        client_id: Identifier | None = None,
        project_id: Identifier | None = None,
        task_id: Identifier | None = None,
    ) -> T.Optional["Shortcut"]:
        assert client_id and project_id and task_id

        record = session.execute(
            select(cls)
            .where(cls.client_id == client_id)
            .where(cls.project_id == project_id)
            .where(cls.task_id == task_id)
        ).one_or_none()

        if record is not None:
            return record[0]

        try:
            record = cls.Create(session, client_id, project_id, task_id)
            session.add(record)
        except sqlalchemy.exc.IntegrityError:
            return session.execute(
                select(cls)
                .where(cls.client_id == client_id)
                .where(cls.project_id == project_id)
                .where(cls.task_id == task_id)
            ).one_or_none()

        return record

    @classmethod
    def Create(
        cls,
        session: Session,
        client_id: Identifier,
        project_id: Identifier,
        task_id: Identifier,
    ) -> "Shortcut":
        shortcut = Shortcut(client_id=client_id, project_id=project_id, task_id=task_id)
        session.add(shortcut)
        session.commit()
        shortcuts = cls.GetAll(session)
        if len(shortcuts) > 4:
            done = shortcuts[0]
            session.delete(done)
            session.commit()

        return shortcut

    def to_dict(self) -> app_types.Shortcut:
        return app_types.Shortcut(
            id=self.id,
            compound_name=[self.client.name, self.project.name, self.task.name],
            client_id=self.client_id,
            project_id=self.project_id,
            task_id=self.task_id,
            is_active=self.is_active,
            created_on=self.created_on.isoformat(),
            updated_on=self.updated_on.isoformat(),
        )


class Queries:
    @classmethod
    def _BaseSelect(cls):
        return (
            select(
                (func.strftime("%Y-%m-%d", Entry.started_on)).label("date_when"),
                Client.name.label("client_name"),
                Project.name.label("project_name"),
                Task.name.label("task_name"),
                func.sum(Entry.seconds).label("seconds"),
                func.count(Entry.id).label("entries"),
            )
            .select_from(Entry)
            .join(Event, Entry.event_id == Event.id)
            .join(Task, Event.task_id == Task.id)
            .join(Project, Task.project_id == Project.id)
            .join(Client, Project.client_id == Client.id)
            .where(Entry.seconds > 0)
            .group_by("client_name", "project_name", "task_name", "date_when")
            .order_by("date_when")
        )

    @classmethod
    def BreakdownAll(cls, session):
        stmt = cls._BaseSelect()
        return session.execute(stmt).all()

    @classmethod
    def BreakdownClientByName(cls, session, client_name):
        stmt = cls._BaseSelect().where(Client.name == client_name)
        return session.execute(stmt).all()

    @classmethod
    def BreakdownClientByID(cls, session, client_id):
        stmt = cls._BaseSelect().where(Client.id == client_id)
        return session.execute(stmt).all()

    @classmethod
    def BreakdownClientByIDAndOptionalDates(
        cls, session, client_id, start: DT.date | None, end: DT.date | None
    ):
        stmt = cls._BaseSelect().where(Client.id == client_id)
        if start is not None:
            stmt = stmt.where(Event.start_date >= start)
        if end is not None:
            stmt = stmt.where(Event.start_date <= end)

        return session.execute(stmt).all()

    @classmethod
    def BreakdownClientProjectDate(cls, session, client_name, project_name, target):
        stmt = (
            cls._BaseSelect()
            .where(Client.name == client_name)
            .where(Project.name == project_name)
            .where(Event.start_date == target)
        )
        return session.execute(stmt).all()

    @classmethod
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

    @classmethod
    def BreakdownProjectByIDAndOptionallyBetweenDates(
        cls, session, project_id, start_date: DT.date | None, end_date: DT.date | None
    ):
        stmt = cls._BaseSelect().where(Project.id == project_id)
        if start_date is not None:
            stmt = stmt.where(Event.start_date >= start_date)
        if end_date is not None:
            stmt = stmt.where(Event.start_date <= end_date)

        return session.execute(stmt).all()

    @classmethod
    def BreakdownTaskByIDAndOptionallyBetweenDates(
        cls, session, task_id, start_date, end_date
    ):
        stmt = cls._BaseSelect().where(Task.id == task_id)
        if start_date is not None:
            stmt = stmt.where(Event.start_date >= start_date)
        if end_date is not None:
            stmt = stmt.where(Event.start_date <= end_date)

        return session.execute(stmt).all()

    @classmethod
    def BreakdownByConditionsStmt(
        cls,
        client_id=None,
        project_id=None,
        task_id=None,
        start_date=None,
        end_date=None,
    ):
        stmt = cls._BaseSelect()
        if client_id is not None:
            stmt = stmt.where(Client.id == client_id)

            if project_id is not None:
                stmt = stmt.where(Project.id == project_id)

                if task_id is not None:
                    stmt = stmt.where(Task.id == task_id)

        if start_date is not None:
            stmt = stmt.where(Event.start_date >= start_date)

        if end_date is not None:
            stmt = stmt.where(Event.start_date <= end_date)

        return stmt

    @classmethod
    def BreakdownByConditions(
        cls,
        session,
        client_id=None,
        project_id=None,
        task_id=None,
        start_date=None,
        end_date=None,
    ):
        stmt = cls.BreakdownByConditionsStmt(
            client_id, project_id, task_id, start_date, end_date
        )
        return session.execute(stmt).all()
