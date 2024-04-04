import {
    type Identifier,
    type Client,
    type Project,
    type Task,
    type Event,
    type Entry,
    type TimeOwner,
    type Shortcut,
    type StopReasons,
    type DateTimeCard,
    type ProjectTime,
    type ClientTime,
    type TimeReport,
    type ReportPayload,
    type EventDate
} from '@src/types'

interface Boundary {
    remote: (method_name:string, ...args:unknown[])=> Promise<unknown>
}

class APIBridge {
    boundary:Boundary

    constructor(boundary:Boundary) {
        this.boundary = boundary
    }


/*
Print a message to the console.

:param message:
:return:
*/
info(message:string): Promise<void> {
        return this.boundary.remote('info', message) as Promise<void>
    }

/*
Set the application window title.

:param new_title:
:return:
*/
title_set(new_title:string): Promise<void> {
        return this.boundary.remote('title_set', new_title) as Promise<void>
    }

/*
Create a client instance.
:param name:
:return:
*/
client_create(name:string):Promise<Client> {
        return this.boundary.remote('client_create', name) as Promise<Client>
    }

/*
List all clients.
:return:
*/
clients_list():Promise<Client[]> {
        return this.boundary.remote('clients_list') as Promise<Client[]>
    }

/*
List all active clients.

:return:
*/
client_list_active():Promise<Client[]> {
        return this.boundary.remote('client_list_active') as Promise<Client[]>
    }

/*
Get a client instance.

:param client_id:
:return:
*/
client_get(client_id:Identifier):Promise<Client | undefined > {
        return this.boundary.remote('client_get', client_id) as Promise<Client | undefined >
    }

/*
Update a client record.
:param client_id:
:param client_name:
:return:
*/
client_update(client_id:Identifier, client_name:string):Promise<Client | undefined > {
        return this.boundary.remote('client_update', client_id, client_name) as Promise<Client | undefined >
    }

/*
Destroy a client record.
:param client_id:
:return:
*/
client_destroy(client_id:Identifier):Promise<boolean> {
        return this.boundary.remote('client_destroy', client_id) as Promise<boolean>
    }

/*
Create a project record.
:param client_id:
:param name:
:return:
*/
project_create(client_id:Identifier, name:string):Promise<Project> {
        return this.boundary.remote('project_create', client_id, name) as Promise<Project>
    }

/*
List all projects by client.
:param client_id:
:return:
*/
projects_list_by_client_id(client_id:Identifier):Promise<Project[]> {
        return this.boundary.remote('projects_list_by_client_id', client_id) as Promise<Project[]>
    }

/*
List all active projects by client.
:param client_id:
:return:
*/
projects_list_active_by_client_id(client_id:Identifier):Promise<Project[]> {
        return this.boundary.remote('projects_list_active_by_client_id', client_id) as Promise<Project[]>
    }

/*
Get a project record.
:param project_id:
:return:
*/
project_get(project_id:Identifier):Promise<Project> {
        return this.boundary.remote('project_get', project_id) as Promise<Project>
    }

/*
Update a project record.
:param project_id:
:param project_name:
:return:
*/
project_update(project_id:Identifier, project_name:string):Promise<Project> {
        return this.boundary.remote('project_update', project_id, project_name) as Promise<Project>
    }

/*
Set a project status.
:param project_id:
:param status:
:return:
*/
project_set_status(project_id:Identifier, status:boolean):Promise<Project> {
        return this.boundary.remote('project_set_status', project_id, status) as Promise<Project>
    }

/*
Destroy a project record.
:param project_id:
:return:
*/
project_destroy(project_id:Identifier):Promise<boolean> {
        return this.boundary.remote('project_destroy', project_id) as Promise<boolean>
    }

/*
Create a task record.
:param project_id:
:param name:
:return:
*/
task_create(project_id:Identifier, name:string):Promise<Task> {
        return this.boundary.remote('task_create', project_id, name) as Promise<Task>
    }

/*
List all tasks by project.
:param project_id:
:return:
*/
tasks_lists_by_project_id(project_id:Identifier):Promise<Task[]> {
        return this.boundary.remote('tasks_lists_by_project_id', project_id) as Promise<Task[]>
    }

/*
List all active tasks by project.
:param project_id:
:return:
*/
tasks_list_active_by_project_id(project_id:Identifier):Promise<Task[]> {
        return this.boundary.remote('tasks_list_active_by_project_id', project_id) as Promise<Task[]>
    }

/*
Get a task record.
:param task_id:
:return:
*/
task_get(task_id:Identifier):Promise<Task> {
        return this.boundary.remote('task_get', task_id) as Promise<Task>
    }

/*
Update a task record.
:param task_id:
:param name:
:param status:
:return:
*/
task_update(task_id:Identifier, name:string | undefined = undefined, status:string | undefined = undefined):Promise<Task | undefined > {
        return this.boundary.remote('task_update', task_id, name, status) as Promise<Task | undefined >
    }

/*
Destroy given task record by its id
:param task_id:
:return:
*/
task_destroy(task_id:Identifier):Promise<boolean> {
        return this.boundary.remote('task_destroy', task_id) as Promise<boolean>
    }

/*
Set a task status to hide it from the select/dropdown list.

Even if deactivated, the time will still be counted.
:param task_id:
:param status:
:return:
*/
task_set_status(task_id:Identifier, status:boolean):Promise<boolean> {
        return this.boundary.remote('task_set_status', task_id, status) as Promise<boolean>
    }

/*
Create an event record.

:param task_id:
:param start_date:
:param details:
:param notes:
:return:
*/
event_create(task_id:Identifier, start_date:string | undefined = undefined, details:string | undefined = undefined, notes:string | undefined = undefined):Promise<Event> {
        return this.boundary.remote('event_create', task_id, start_date, details, notes) as Promise<Event>
    }

/*
Get an event by date no matter if it doesn't exist yet.
:param task_id:
:param start_date:
:return:
*/
events_get_or_create_by_date(task_id:Identifier, start_date:string | undefined = undefined):Promise<Event[]> {
        return this.boundary.remote('events_get_or_create_by_date', task_id, start_date) as Promise<Event[]>
    }

/*
Get all events by task id.
:param task_id:
:return:
*/
events_by_task_id(task_id:Identifier):Promise<Event[]> {
        return this.boundary.remote('events_by_task_id', task_id) as Promise<Event[]>
    }

/*
Get all active events by task id.
:param task_id:
:return:
*/
event_active_by_task_id(task_id:Identifier): Promise<void> {
        return this.boundary.remote('event_active_by_task_id', task_id) as Promise<void>
    }

/*
Get an event record.
:param event_id:
:return:
*/
event_get(event_id:Identifier): Promise<void> {
        return this.boundary.remote('event_get', event_id) as Promise<void>
    }

/*
Get an event record based on date.
:param task_id:
:param event_date:
:return:
*/
event_get_by_date(task_id:Identifier, event_date:string | undefined): Promise<void> {
        return this.boundary.remote('event_get_by_date', task_id, event_date) as Promise<void>
    }

/*
Get a list of event record id by their start date.
:param task_id:
:return:
*/
event_list_dates_by_project_id(task_id:Identifier):Promise<EventDate[]> {
        return this.boundary.remote('event_list_dates_by_project_id', task_id) as Promise<EventDate[]>
    }

/*
Update an event record.

:param event_id:
:param details:
:param notes:
:return:
*/
event_update(event_id:Identifier, details:string | undefined = undefined, notes:string | undefined = undefined): Promise<void> {
        return this.boundary.remote('event_update', event_id, details, notes) as Promise<void>
    }

/*
Destroy an event record.

:param event_id:
:return:
*/
event_destroy(event_id:Identifier):Promise<boolean> {
        return this.boundary.remote('event_destroy', event_id) as Promise<boolean>
    }

/*
Add an entry to the event record.

@TODO refactor so its a changeset and not a bunch of arguments

:param event_id:
:param start_dt:
:param end_dt:
:param seconds:
:param reason:
:return:
*/
event_add_entry(event_id:Identifier, start_dt:string, end_dt:string, seconds:number, reason:string):Promise<Entry> {
        return this.boundary.remote('event_add_entry', event_id, start_dt, end_dt, seconds, reason) as Promise<Entry>
    }

/*
Get all entries by the given parent event id.

:param event_id:
:return:
*/
entries_lists_by_event_id(event_id:Identifier):Promise<Entry[]> {
        return this.boundary.remote('entries_lists_by_event_id', event_id) as Promise<Entry[]>
    }

/*
Get an entry record.

:param entry_id:
:return:
*/
entry_get(entry_id:Identifier):Promise<Entry> {
        return this.boundary.remote('entry_get', entry_id) as Promise<Entry>
    }

/*
Update an entry record.
@TODO refactor so its a changeset and not a bunch of arguments

:param entry_id:
:param start_dt:
:param end_dt:
:param seconds:
:param reason:
:return:
*/
entry_update(entry_id:Identifier, start_dt:string | undefined = undefined, end_dt:string | undefined = undefined, seconds:number | undefined = undefined, reason:StopReasons | undefined = undefined):Promise<Entry> {
        return this.boundary.remote('entry_update', entry_id, start_dt, end_dt, seconds, reason) as Promise<Entry>
    }

/*
Destroy an entry record.

:param entry_id:
:return:
*/
entry_destroy(entry_id:Identifier):Promise<boolean> {
        return this.boundary.remote('entry_destroy', entry_id) as Promise<boolean>
    }

/*
Create an entry record.

:param event_id:
:param started_on:
:param stopped_on:
:param seconds:
:return:
*/
entry_create(event_id:Identifier, started_on:string, stopped_on:string, seconds:number | undefined = undefined):Promise<Entry> {
        return this.boundary.remote('entry_create', event_id, started_on, stopped_on, seconds) as Promise<Entry>
    }

/*
Check if timer still exists and is running.

:return:
*/
timer_check():Promise<boolean> {
        return this.boundary.remote('timer_check') as Promise<boolean>
    }

/*
Get everything about the timer's owner.

:return:
*/
timer_owner():Promise<TimeOwner | undefined > {
        return this.boundary.remote('timer_owner') as Promise<TimeOwner | undefined >
    }

/*
Change how to update the frontend

:param new_receiver:
:return:
*/
timer_override(new_receiver:Identifier): Promise<void> {
        return this.boundary.remote('timer_override', new_receiver) as Promise<void>
    }

/*
Create a new event if not exists and then start the timer with the provised event record id.

:param listener_id:
:param task_id:
:return:
*/
timer_start(listener_id:Identifier, task_id:Identifier):Promise<Event> {
        return this.boundary.remote('timer_start', listener_id, task_id) as Promise<Event>
    }

/*
Stop the timer.

:return:
*/
timer_stop():Promise<boolean> {
        return this.boundary.remote('timer_stop') as Promise<boolean>
    }

/*
Pause the timer.

:return:
*/
timer_pause():Promise<boolean> {
        return this.boundary.remote('timer_pause') as Promise<boolean>
    }

/*
Resume the timer.
:return:
*/
timer_resume():Promise<boolean> {
        return this.boundary.remote('timer_resume') as Promise<boolean>
    }

/*
Get all shortcuts (client, project, task) for rapid context switching.

:return:
*/
shortcut_get_all():Promise<Shortcut[]> {
        return this.boundary.remote('shortcut_get_all') as Promise<Shortcut[]>
    }

/*
Get a specific shortcut by its id.

:param shortcut_id:
:return:
*/
shortcut_get(shortcut_id:Identifier):Promise<Shortcut> {
        return this.boundary.remote('shortcut_get', shortcut_id) as Promise<Shortcut>
    }

/*
Add a new shortcut .

:param client_id:
:param project_id:
:param task_id:
:return:
*/
shortcut_add(client_id:Identifier, project_id:Identifier, task_id:Identifier):Promise<Shortcut> {
        return this.boundary.remote('shortcut_add', client_id, project_id, task_id) as Promise<Shortcut>
    }

/*
Open a new child window.

:param win_name:
:return:
*/
open_window(win_name:string):Promise<boolean> {
        return this.boundary.remote('open_window', win_name) as Promise<boolean>
    }

/*
Resize the main window as either expanded or minimized.

:param win_name:
:param size:
:return:
*/
window_toggle_resize(win_name:string, size:string):Promise<boolean> {
        return this.boundary.remote('window_toggle_resize', win_name, size) as Promise<boolean>
    }

/*
Generate a report using the given payload.

:param payload:
:return:
*/
report_generate(payload:ReportPayload):Promise<TimeReport> {
        return this.boundary.remote('report_generate', payload) as Promise<TimeReport>
    }

/*
Converts a Report payload dictionary into a text block.

:param payload:
:return:
*/
report_build2text(payload:ReportPayload):Promise<string> {
        return this.boundary.remote('report_build2text', payload) as Promise<string>
    }
}

export default APIBridge
