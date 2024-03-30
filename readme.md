PyMinder
========

![Fullsize of timer app](./imgs/full_size.png)

A time tracker that breaks down tracked events by Client->Project->Task.

Status: pre-release

## Project goals

1. Make a working/usable time tracker.
2. Learn how the new SQLAlchemy 2 typed ORM works.
3. Learn how PyWebview works
4. Learn ReactJS
5. Learn how to use the ReactJS UI library MantineJS


## Major components

The glue that holds it all together - 
https://pywebview.flowrl.com/

The library that abstracts working with the database - https://www.sqlalchemy.org/

The framework that makes up the frontend - https://react.dev/

The UI library that makes it prettier - https://mantine.dev/

## How to set up

1. Clone this repo
2. Initialize with poetry (https://python-poetry.org/docs/basic-usage/#initialising-a-pre-existing-project)
3. `poetry shell` and then `pip install -r requirements.txt` to install missing dependencies.
4. `python pyminder/main.py` to run.

## Basic usage

To create a new client, click the client select/combo-box, enter the client name, click "Create..." in the drop down.
To create a new project or task, repeat the steps above.

Once Client, Project, Task are set, you can press Start to begin timing.



## Important notes

PyMinder will create a file named `pyminder.sqlite3` which must always be in the 
CWD(current working directory) when running

When the timer is running, it saves progress every ~10 seconds to the database.


## Major issues

* A dependency of pywebview isn't playing nice with poetry and a workaround needs to be found. 


## TODOs

1. Clean up the `Manage` pages and homogenize their layout.
2. Change the Timer/home page times for project & task to be settable as current week, month, or year.
3. Cleanup transformer.py so it is less scary
4. More unit tests!
5. Disable debug mode when not requested


## Directories

- `pyminder/` is the application root directory
- `out/` is a work in project typing for pywebview
- `schema/` is the alembic/schema change management versions and utility file dir
- `scripts/` are one off or utility tools that should be considered dangerous
- `ui/` is the Reactjs app.
- `ui/dist` is the packaged version of the reactjs app bundled into the
- `ui/src/api.ts` is the transformed bridge code between the reactjs app and the pywebview application

