import datetime as DT
import pathlib

import IPython

from lib import models
from lib.application import Application
from lib.api import API

HERE = pathlib.Path(__file__).parent.parent


app = Application(HERE, HERE / "pyminder.sqlite3")
api = API(app)

# report = api.report_build({})
# print(report)
#
# report = api.report_build2text({})
# print(report)


def frame2time(frame):
    return f"{frame['hours']:02}:{frame['minutes']:02}:{frame['seconds']:02}"


report = api.report_generate({})

print("Breakdown:")
for cname, client in report["clients"].items():
    perc = client["total_seconds"] / report["total_seconds"]
    print("\tClient: ", cname)
    print("\tTotal Time: ", frame2time(client))
    print("\tPercentage: ", round(perc, 2) * 100)

print()
print("Report:")


for cname, client in report["clients"].items():
    print("Client: ", cname)
    print("Total Time: ", frame2time(client))
    for pname, project in client["projects"].items():
        print("\tProject: ", pname, frame2time(project))
        for dtwhen, dateframe in project["dates"].items():
            print()
            print("\t\tDate: ", dtwhen)
            print("\t\ttasks: -")
            for task in dateframe["tasks"]:
                print("\t\t\t", task["name"].ljust(30), frame2time(task))
            print("\t\tTotal time:", frame2time(dateframe))
print()
