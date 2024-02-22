import { type Identifier, type Client, type Project, type Task, type Event } from '@src/types'

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
    client_get(client_id:Identifier):Promise<Client> {
        return this.boundary.remote('client_get', client_id) as Promise<Client>
    }
    client_update(client_id:Identifier, client_name:string):Promise<Client> {
        return this.boundary.remote('client_update', client_id, client_name) as Promise<Client>
    }
    client_destroy(client_id:Identifier):Promise<boolean> {
        return this.boundary.remote('client_destroy', client_id) as Promise<boolean>
    }
    projects_list_by_client_id(client_id:Identifier):Promise<Project[]> {
        return this.boundary.remote('projects_list_by_client_id', client_id) as Promise<Project[]>
    }
    tasks_lists_by_project_id(project_id:Identifier):Promise<Task[]> {
        return this.boundary.remote('tasks_lists_by_project_id', project_id) as Promise<Task[]>
    }
    events_lists_by_task_id(task_id:Identifier):Promise<Event[]> {
        return this.boundary.remote('events_lists_by_task_id', task_id) as Promise<Event[]>
    }
    timer_start(listener_id:Identifier):Promise<boolean> {
        return this.boundary.remote('timer_start', listener_id) as Promise<boolean>
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
}

export default APIBridge
