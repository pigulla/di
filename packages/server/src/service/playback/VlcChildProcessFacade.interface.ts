export interface IVlcChildProcessFacade {
    hostname: string
    port: number
    is_running (): boolean
    get_pid (): number
    start (): Promise<void>
    stop (): Promise<void>
}
