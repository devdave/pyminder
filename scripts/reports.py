import datetime as DT
import pathlib

import IPython

from lib import models
from lib.application import Application
from lib.api import API

HERE = pathlib.Path(__file__).parent.parent


app = Application(HERE, HERE / "events.sqlite3")
api = API(app)

report = api.report_build({})
print(report)

report = api.report_build2text({})
print(report)
