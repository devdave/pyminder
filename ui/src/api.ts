import { Identifier } from '@src/types'

interface Boundary {
    remote: (method_name:string, ...args:[unknown?])=> Promise<unknown>
}

class APIBridge {
    boundary:Boundary

    constructor(boundary:Boundary) {
        this.boundary = boundary
    }


    info(message:any = undefined) {
        return this.boundary.remote('info', message) as void
    }

    client_create(name:any) {
        return this.boundary.remote('client_create', name) as void
    }

    clients_list() {
        return this.boundary.remote('clients_list') as void
    }

    client_get(client_id:any) {
        return this.boundary.remote('client_get', client_id) as void
    }

    client_update(client_id:any, client_name:any) {
        
        return this.boundary.remote('client_update', client_id, client_name) as void
    }

    client_destroy(client_id:any) {
        return this.boundary.remote('client_destroy', client_id) as void
    }

    projects_list_by_client_id(client_id:any) {
        return this.boundary.remote('projects_list_by_client_id', client_id) as void
    }

    tasks_lists_by_project_id(project_id:any) {
        return this.boundary.remote('tasks_lists_by_project_id', project_id) as void
    }

    events_lists_by_task_id(task_id:any) {
        return this.boundary.remote('events_lists_by_task_id', task_id) as void
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
