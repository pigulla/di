import {LogLevel} from '@nestjs/common'
import {Quality} from '@server/service/di'

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
}