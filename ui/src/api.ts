import {
    type Identifier,
    type Client,
    type Project,
    type Task,
    type Event,
    type Entry,
    type TimeOwner,
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

    info(message:string | undefined = undefined): Promise<void> {
        return this.boundary.remote('info', message) as Promise<void>
    }
    client_create(name:string):Promise<Client> {
        return this.boundary.remote('client_create', name) as Promise<Client>
    }
    clients_list():Promise<Client[]> {
        return this.boundary.remote('clients_list') as Promise<Client[]>
    }
    client_list_active():Promise<Client[]> {
        return this.boundary.remote('client_list_active') as Promise<Client[]>
    }
    client_get(client_id:Identifier):Promise<Client | undefined > {
        return this.boundary.remote('client_get', client_id) as Promise<Client | undefined >
    }
    client_update(client_id:Identifier, client_name:string):Promise<Client | undefined > {
        return this.boundary.remote('client_update', client_id, client_name) as Promise<Client | undefined >
    }
    client_destroy(client_id:Identifier):Promise<boolean> {
        return this.boundary.remote('client_destroy', client_id) as Promise<boolean>
    }
    project_create(client_id:Identifier, name:string):Promise<Project> {
        return this.boundary.remote('project_create', client_id, name) as Promise<Project>
    }
    projects_list_by_client_id(client_id:Identifier):Promise<Project[]> {
        return this.boundary.remote('projects_list_by_client_id', client_id) as Promise<Project[]>
    }
    projects_list_active_by_client_id(client_id:Identifier):Promise<Project[]> {
        return this.boundary.remote('projects_list_active_by_client_id', client_id) as Promise<Project[]>
    }
    project_get(project_id:Identifier):Promise<Project> {
        return this.boundary.remote('project_get', project_id) as Promise<Project>
    }
    project_update(project_id:Identifier, project_name:string):Promise<Project> {
        return this.boundary.remote('project_update', project_id, project_name) as Promise<Project>
    }
    project_set_status(project_id:Identifier, status:boolean):Promise<Project> {
        return this.boundary.remote('project_set_status', project_id, status) as Promise<Project>
    }
    project_destroy(project_id:Identifier):Promise<boolean> {
        return this.boundary.remote('project_destroy', project_id) as Promise<boolean>
    }
    task_create(project_id:Identifier, name:string):Promise<Task> {
        return this.boundary.remote('task_create', project_id, name) as Promise<Task>
    }
    tasks_lists_by_project_id(project_id:Identifier):Promise<Task[]> {
        return this.boundary.remote('tasks_lists_by_project_id', project_id) as Promise<Task[]>
    }
    tasks_list_active_by_project_id(project_id:Identifier):Promise<Task[]> {
        return this.boundary.remote('tasks_list_active_by_project_id', project_id) as Promise<Task[]>
    }
    task_get(task_id:Identifier):Promise<Task> {
        return this.boundary.remote('task_get', task_id) as Promise<Task>
    }
    task_update(task_id:Identifier, name:string | undefined = undefined, status:string | undefined = undefined):Promise<Task | undefined > {
        return this.boundary.remote('task_update', task_id, name, status) as Promise<Task | undefined >
    }
    task_destroy(task_id:Identifier):Promise<boolean> {
        return this.boundary.remote('task_destroy', task_id) as Promise<boolean>
    }
    task_set_status(task_id:Identifier, status:boolean):Promise<boolean> {
        return this.boundary.remote('task_set_status', task_id, status) as Promise<boolean>
    }
    event_create(task_id:Identifier, start_date:string | undefined = undefined, details:string | undefined = undefined, notes:string | undefined = undefined):Promise<Event> {
        return this.boundary.remote('event_create', task_id, start_date, details, notes) as Promise<Event>
    }
    events_get_or_create_by_date(task_id:Identifier, start_date:string | undefined = undefined):Promise<Event[]> {
        return this.boundary.remote('events_get_or_create_by_date', task_id, start_date) as Promise<Event[]>
    }
    events_by_task_id(task_id:Identifier):Promise<Event[]> {
        return this.boundary.remote('events_by_task_id', task_id) as Promise<Event[]>
    }
    event_active_by_task_id(task_id:Identifier): Promise<void> {
        return this.boundary.remote('event_active_by_task_id', task_id) as Promise<void>
    }
    event_get(event_id:Identifier): Promise<void> {
        return this.boundary.remote('event_get', event_id) as Promise<void>
    }
    event_get_by_date(task_id:Identifier, event_date:string | undefined): Promise<void> {
        return this.boundary.remote('event_get_by_date', task_id, event_date) as Promise<void>
    }
    event_list_dates_by_project_id(task_id:Identifier):Promise<EventDate[]> {
        return this.boundary.remote('event_list_dates_by_project_id', task_id) as Promise<EventDate[]>
    }
    event_update(event_id:Identifier, details:string | undefined = undefined, notes:string | undefined = undefined): Promise<void> {
        return this.boundary.remote('event_update', event_id, details, notes) as Promise<void>
    }
    event_destroy(event_id:Identifier):Promise<boolean> {
        return this.boundary.remote('event_destroy', event_id) as Promise<boolean>
    }
    event_add_entry(event_id:Identifier, start_dt:string, end_dt:string, seconds:number, reason:string):Promise<Entry> {
        return this.boundary.remote('event_add_entry', event_id, start_dt, end_dt, seconds, reason) as Promise<Entry>
    }
    entries_lists_by_event_id(event_id:Identifier):Promise<Entry[]> {
        return this.boundary.remote('entries_lists_by_event_id', event_id) as Promise<Entry[]>
    }
    entry_get(entry_id:Identifier): Promise<void> {
        return this.boundary.remote('entry_get', entry_id) as Promise<void>
    }
    entry_update(entry_id:Identifier, start_dt:string | undefined = undefined, end_dt:string | undefined = undefined, seconds:number | undefined = undefined, reason:StopReasons | undefined = undefined):Promise<Entry> {
        return this.boundary.remote('entry_update', entry_id, start_dt, end_dt, seconds, reason) as Promise<Entry>
    }
    entry_destroy(entry_id:Identifier):Promise<boolean> {
        return this.boundary.remote('entry_destroy', entry_id) as Promise<boolean>
    }
    entry_create(event_id:Identifier, started_on:string, stopped_on:string, seconds:number | undefined = undefined):Promise<Entry> {
        return this.boundary.remote('entry_create', event_id, started_on, stopped_on, seconds) as Promise<Entry>
    }
    timer_check():Promise<boolean> {
        return this.boundary.remote('timer_check') as Promise<boolean>
    }
    timer_owner():Promise<TimeOwner | undefined > {
        return this.boundary.remote('timer_owner') as Promise<TimeOwner | undefined >
    }
    timer_override(new_receiver:Identifier): Promise<void> {
        return this.boundary.remote('timer_override', new_receiver) as Promise<void>
    }
    timer_start(listener_id:Identifier, task_id:Identifier):Promise<Event> {
        return this.boundary.remote('timer_start', listener_id, task_id) as Promise<Event>
    }
    timer_stop():Promise<boolean> {
        return this.boundary.remote('timer_stop') as Promise<boolean>
    }
    timer_pause():Promise<boolean> {
        return this.boundary.remote('timer_pause') as Promise<boolean>
    }
    timer_resume():Promise<boolean> {
        return this.boundary.remote('timer_resume') as Promise<boolean>
    }
    shortcut_get_all():Promise<Shortcut[]> {
        return this.boundary.remote('shortcut_get_all') as Promise<Shortcut[]>
    }
    shortcut_add(client_id:Identifier, project_id:Identifier, task_id:Identifier): Promise<void> {
        return this.boundary.remote('shortcut_add', client_id, project_id, task_id) as Promise<void>
    }
    open_window(win_name:string):Promise<boolean> {
        return this.boundary.remote('open_window', win_name) as Promise<boolean>
    }
    window_toggle_resize(win_name:string, size:string):Promise<boolean> {
        return this.boundary.remote('window_toggle_resize', win_name, size) as Promise<boolean>
    }
    report_generate(payload:ReportPayload):Promise<TimeReport> {
        return this.boundary.remote('report_generate', payload) as Promise<TimeReport>
    }
    report_build2text(payload:ReportPayload):Promise<string> {
        return this.boundary.remote('report_build2text', payload) as Promise<string>
    }
}

export default APIBridge
