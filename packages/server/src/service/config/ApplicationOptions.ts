import {Quality} from '@server/service/di'
import {LogLevel} from '@server/service/logger'

export interface Credentials {
    username: string
    password: string
}

export interface ApplicationOptions {
    // Server
    hostname: string
    port: number
    logLevel: LogLevel

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
