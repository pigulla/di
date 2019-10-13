import {LogLevel} from '@nestjs/common'

export class ConfigError extends Error {};

export type IConfigProvider = {
    server_hostname: string
    server_port: number

    log_level: LogLevel

    vlc_path: string
    vlc_timeout: number
    vlc_initial_volume: number

    di_url: string
    di_username: string|null
    di_password: string|null
    di_listenkey: string|null
}
