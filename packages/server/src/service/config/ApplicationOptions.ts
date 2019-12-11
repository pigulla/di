import {Quality} from '../di'
import {LogLevel} from '../logger'

export interface Credentials {
    username: string
    password: string
}

export enum NotificationService {
    CONSOLE = 'console',
    LOGGER = 'logger',
    NOTIFIER = 'notifier',
    NONE = 'none',
}

export interface ApplicationOptions {
    // Server
    hostname: string
    port: number
    logLevel: LogLevel
    notifications: NotificationService

    // VLC
    vlcPath: string
    vlcTimeout: number
    vlcInitialVolume: number

    // Digitally Imported
    url: string
    listenkey: string
    frequency: number
    quality: Quality
    credentials: Credentials|null
}
