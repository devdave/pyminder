export type Identifier = string | number

export enum TaskStatus {
    ACTIVE = 'active',
    IN_PROGRESS = 'in_progress',
    COMPLETE = 'complete',
    CANCELLED = 'cancelled'
}

export enum StopReasons {
    PAUSED = 'Paused',
    FINISHED = 'Finished',
    PLACEHOLDER = 'PLACEHOLDER'
}

export interface TimeFacts {
    hours: number
    minutes: number
    seconds: number
}

export interface TimeObj {
    hour: number
    minute: number
    second: number
}

export interface HasTime {
    time?: TimeFacts
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

export interface TimeOwner {
    client: Client
    project: Project
    task: Task
    event: Event
    isRunning: boolean
    isPaused: boolean
}

export interface CommonTimeCardValues {
    hours: number
    minutes: number
    seconds: number
    total_seconds: number
    decimal: number
}

export interface TaskTimeCard {
    name: string
    entries: number
}

export interface DateTimeCard extends CommonTimeCardValues {
    tasks: TaskTimeCard[]
}

export interface ProjectTime extends CommonTimeCardValues {
    dates: { [date: string]: DateTimeCard }
}

export interface ClientTime extends CommonTimeCardValues {
    projects: { [project_name: string]: ProjectTime }
}

export interface TimeReport extends CommonTimeCardValues {
    clients: { [client_name: string]: ClientTime }
}

export interface ReportPayload {
    start_date: string | undefined
    end_date: string | undefined
    client_id: number | undefined
    project_id: number | undefined
    task_id: number | undefined
    wage: number | undefined
    sort_order: string[]
}
