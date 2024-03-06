import pathlib
import datetime as DT

from sqlalchemy import func, cast, Integer, Date

from lib import models

engine, Session = models.connect(
    pathlib.Path("pyminder.sqlite3"), create=False, echo=True
)

with Session() as session:
    task = models.Task.GetOrCreate(session, project_id=2, name="Add Reports")
    event = models.Event.GetOrCreateByDate(session, task.id, DT.date.today())
