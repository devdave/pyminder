import pathlib
import datetime as DT

from sqlalchemy import func, cast, Integer, Date

from lib import models

engine, Session = models.connect(
    pathlib.Path("pyminder.sqlite3"), create=False, echo=True
)

with Session() as session:
    for entry in models.Entry.GetAll(session=Session):  # type: models.Entry
        # print(
        #     entry.id, entry.seconds, (entry.stopped_on - entry.started_on).total_seconds()
        # )
        if int(entry.seconds) < int(
            (entry.stopped_on - entry.started_on).total_seconds()
        ):
            print(entry.seconds, (entry.stopped_on - entry.started_on).total_seconds())
            # entry.seconds = (entry.stopped_on - entry.started_on).total_seconds()
            # session.add(entry)
            # session.commit()
