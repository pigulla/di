export interface IPeriodicTrigger {
    start(): void
    stop(): void
    is_running(): boolean
}
