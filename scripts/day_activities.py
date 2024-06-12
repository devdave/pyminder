import datetime as DT
import pathlib
import typing as T

import IPython

from app_types import Identifier
from pyminder.lib import models

HERE = pathlib.Path(__file__).parent.parent


engine, Session = models.connect(
    pathlib.Path("pyminder.sqlite3"), create=False, echo=True
)


with Session() as session:
    stmt = (
        models.select(
            models.Event.start_date.label("start_date"),
            models.Client.name.label("client_name"),
            models.Project.name.label("project_name"),
            models.Task.name.label("task_name"),
            models.Entry.started_on,
            models.Entry.stopped_on,
            models.Entry.seconds,
            models.Client.id.label("client_id"),
            models.Project.id.label("project_id"),
            models.Task.id.label("task_id"),
            models.Event.id.label("event_id"),
            models.Entry.id.label("entry_id"),
        )
        .select_from(models.Entry)
        .join(models.Event, models.Entry.event_id == models.Event.id)
        .join(models.Task, models.Event.task_id == models.Task.id)
        .join(models.Project, models.Task.project_id == models.Project.id)
        .join(models.Client, models.Project.client_id == models.Client.id)
        .order_by(models.Entry.started_on)
        .where(models.Event.start_date == DT.date.today())
    )

    result = session.execute(stmt).all()
    for row in result:
        print(row._mapping)
