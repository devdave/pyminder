export type Identifier = string | number

export interface Client {
    id: Identifier
    name: string
}

export interface Project {
    id: Identifier
    name: string
    client_id: number
}

export interface Task {
    id: Identifier
    name: string
    project_id: number
}

export interface Event {
    id: Identifier
    task_id: number
    hours: number
    minutes: number
    seconds: number
}

export interface TimeObj {
    hour: number
    minute: number
    second: number
}
