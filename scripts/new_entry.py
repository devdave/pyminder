 import datetime as DT
import pathlib

import IPython

from lib import models
from lib.app_types import StopReasons

engine, Session = models.connect(pathlib.Path("events.sqlite3"))


def other_scope(session, entry_id):
    entry = models.Entry.Fetch_by_id(session, entry_id)
    entry.stopped_on = DT.datetime.now()
    entry.stopped_reason = StopReasons.PAUSED
    session.add(entry)
    session.commit()


with Session() as session:
    task = models.Task.Fetch_by_id(session, 2)
    print(task.name)
    event = models.Event.GetOrCreateByDate(session, task.id, DT.date.today())
    entry = event.create_entry(DT.datetime.now(), DT.datetime.now(), 0)

    session.add(entry)
    session.commit()
    entry_id = entry.id

    other_scope(Session(), entry_id)


IPython.embed()
