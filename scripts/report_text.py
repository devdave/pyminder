import datetime as DT
import pathlib

import IPython

from lib import models
from lib.application import Application
from lib.api import API

HERE = pathlib.Path(__file__).parent.parent


app = Application(HERE, HERE / "pyminder.sqlite3", debug=True)
api = API(app)

data = api.report_build2text(dict(start_date="2024-03-10"))

print(data)
