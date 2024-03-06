import datetime as DT
import pathlib
import pandas as pd

import IPython

from lib import models
from lib.application import Application
from lib.api import API

HERE = pathlib.Path(__file__).parent.parent


app = Application(HERE, HERE / "pyminder.sqlite3")
api = API(app)

stmt = models.Queries.BreakdownByConditionsStmt()

df = pd.read_sql(sql=stmt, con=app.engine)

print(df)
