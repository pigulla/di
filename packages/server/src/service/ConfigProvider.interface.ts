import {LogLevel} from '@nestjs/common'
import {Quality} from '@server/service/di'

export class ConfigError extends Error {}

export type IConfigProvider = {
    server_hostname: string
    server_port: number

    log_level: LogLevel

    vlc_path: string
    vlc_timeout: number
    vlc_initial_volume: number|null

    di_url: string
    di_listenkey: string
    di_frequency_ms: number
    di_quality: Quality
}
