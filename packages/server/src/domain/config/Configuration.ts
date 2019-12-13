import {NotificationType} from './NotificationType'
import {Credentials, Quality} from '../di'
import {LogLevel} from '../Logger.interface'

export interface Configuration {
    server_hostname: string
    server_port: number

    playback_state_check_frequency_ms: number
    notifications: NotificationType
    log_level: LogLevel

    vlc_path: string
    vlc_timeout: number
    vlc_initial_volume: number|null

    di_url: string
    di_listenkey: string
    di_frequency_ms: number
    di_quality: Quality
    di_credentials: Credentials|null
}
