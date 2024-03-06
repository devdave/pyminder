import pathlib
import datetime as DT

from sqlalchemy import func, cast, Integer, Date

from lib import models

engine, Session = models.connect(
    pathlib.Path("pyminder.sqlite3"), create=False, echo=True
)

"""
select sum(E.seconds) as total,
       round(sum(E.seconds)/3600) as hours,
       round(sum(E.seconds)%3600/60) as minutes ,
       count(E.id) as 'entries',
       strftime('%d-%m-%Y', E.created_on) as dtwhen
FROM Event left join main.Entry E on Event.id = E.event_id GROUP BY dtwhen
"""

start_target = DT.datetime(2024, 2, 25)
end_target = DT.datetime(2024, 2, 27)
exact = DT.date(2024, 2, 23)

with Session() as session:
    stmt = (
        models.select(
            (func.strftime("%Y-%m-%d", models.Entry.started_on)).label("dtwhen"),
            models.Client.name.label("cname"),
            models.Project.name.label("pname"),
            models.Task.name.label("tname"),
            cast(
                func.round(func.sum(models.Entry.seconds) / 3600).label("hours"),
                Integer,
            ),
            cast(
                func.round(func.sum(models.Entry.seconds) % 3600 / 60).label("minutes"),
                Integer,
            ),
            func.count(models.Entry.id).label("entries"),
        )
        .select_from(models.Event)
        .join(models.Entry, models.Entry.event_id == models.Event.id)
        .join(models.Task, models.Event.task_id == models.Task.id)
        .join(models.Project, models.Task.project_id == models.Project.id)
        .join(models.Client, models.Project.client_id == models.Client.id)
        .group_by("cname", "pname", "tname", "dtwhen")
        .order_by("dtwhen")
        .where(models.Event.start_date == exact)
    )
    # if True:
    #     stmt = stmt.where(models.Entry.created_on >= target)

    result = session.execute(stmt)
    for row in result.all():
        print(type(row))
        print(
            row.dtwhen,
            row.cname,
            row.pname,
            row.tname,
            row.hours,
            row.minutes,
            row.entries,
        )

# IPython.embed()
