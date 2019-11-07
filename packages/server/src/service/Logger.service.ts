import pino, {Logger as Pino} from 'pino'
import {LogLevel} from '@nestjs/common'

import {create_request_logger, RequestLogger} from '@server/middleware'
import {ILogger} from './Logger.interface'

export class Logger implements ILogger {
    private readonly log_level: LogLevel
    private readonly pino: Pino
    private readonly pino_request_logger: RequestLogger

    public constructor (
        log_level: LogLevel,
        pino_instance?: Pino,
        request_logger?: RequestLogger,
    ) {
        this.log_level = log_level
        this.pino = pino_instance || pino({
            customLevels: {
                log: pino.levels.values.info,
                verbose: pino.levels.values.trace,
            },
            level: log_level,
            prettyPrint: true,
        })
        this.pino_request_logger = request_logger || create_request_logger(this.pino)
    }

    public get_request_logger (): RequestLogger {
        return this.pino_request_logger
    }

    public for_controller (name: string): ILogger {
        return new Logger(this.log_level, this.pino.child({controller: name}), this.pino_request_logger)
    }

    public for_service (name: string): ILogger {
        return new Logger(this.log_level, this.pino.child({service: name}), this.pino_request_logger)
    }

    public log (message: string): void {
        this.pino.info(message)
    }

    public error (message: string, trace: string): void {
        this.pino.error(message, trace)
    }

    public warn (message: string): void {
        this.pino.warn(message)
    }

    public debug (message: string): void {
        this.pino.debug(message)
    }

    public verbose (message: string): void {
        this.pino.trace(message)
    }
}
