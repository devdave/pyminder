export type Identifier = string | number

export enum TaskStatus {
    ACTIVE = 'active',
    IN_PROGRESS = 'in_progress',
    COMPLETE = 'complete',
    CANCELLED = 'cancelled'
}

export enum StopReasons {
    PAUSED = 'Paused',
    FINISHED = 'Finished'
}

export interface HasTime {
    hours: number
    minutes: number
    seconds: number
}

export interface Client {
    id: Identifier
    name: string
}

export interface Project extends HasTime {
    id: Identifier
    name: string
    client_id: number
}

export interface Task extends HasTime {
    id: Identifier
    name: string
    project_id: number
}

export interface Event extends HasTime {
    id: Identifier
    task_id: number

    entries: Entry[]
}

export interface Entry {
    id: Identifier
    event_id: Identifier
    start_date: string
    end_date: string
    seconds: number
}

export interface TimeObj {
    hour: number
    minute: number
    second: number
}

export interface TimeOwner {
    client: Client
    project: Project
    task: Task
    event: Event
    isRunning: boolean
    isPaused: boolean
}
