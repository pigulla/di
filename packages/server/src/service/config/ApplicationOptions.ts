import {Quality} from '@src/service/di'
import {LogLevel} from '@src/service/logger'

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
