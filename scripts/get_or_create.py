import pathlib
import datetime as DT

from sqlalchemy import func, cast, Integer, Date

from lib import models

engine, Session = models.connect(
    pathlib.Path("events.sqlite3"), create=False, echo=True
)

with Session() as session:
    task = models.Task.GetOrCreate(session, project_id=2, name="Add Reports")
    print(type(task), task)
