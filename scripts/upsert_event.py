import pathlib
import datetime as DT

from sqlalchemy import func, cast, Integer, Date

from lib import models

engine, Session = models.connect(
    pathlib.Path("events.sqlite3"), create=False, echo=True
)

with Session() as session:
    event = models.Event.GetOrCreateByDate(session, 2, DT.datetime.today())
