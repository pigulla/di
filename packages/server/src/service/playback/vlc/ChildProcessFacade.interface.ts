export interface IChildProcessFacade {
    is_running (): boolean
    get_pid (): number
    start (prompt: string, welcome_message: string): Promise<string>
    stop (): Promise<void>
    send (command: string, args: string): Promise<string>
}
