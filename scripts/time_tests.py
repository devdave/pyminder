from lib import models
import pathlib

engine, Session = models.connect(
    pathlib.Path("events.sqlite3"), create=False, echo=False
)

with Session() as session:
    for client in models.Client.GetAll(session):
        print(client.name, models.Client.GetAllTime(session, client.id))
        for project in client.projects:
            print("\t", project.name, models.Project.GetAllTime(session, project.id))
            for task in project.tasks:
                print("\t\t", task.name, models.Task.GetAllTime(session, task.id))
