import {SpawnFn} from '@server/service/playback/vlc/ChildProcessFacade'

export type ChildProcessFacadeCtor = new (path: string, timeout_ms: number, spawn: SpawnFn) => IChildProcessFacade

export interface IChildProcessFacade {
    is_running (): boolean
    get_pid (): number
    start (prompt: string, welcome_message: string): Promise<string>
    stop (): Promise<void>
    send (command: string, args: string): Promise<string>
}
