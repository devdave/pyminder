 import pathlib

from lib import models

engine, Session = models.connect(pathlib.Path("events.sqlite3"), create=False)

with Session() as session:
    task = models.Task.Fetch_by_id(session, 4)
    print(task.hours)
    print(task.minutes)
    print(task.seconds)
