import {Logger as Pino} from 'pino'
import {Injectable} from '@nestjs/common'

import {ILogger, ChildLoggerOptions, LogLevel} from '../../domain'

@Injectable()
export class PinoLogger implements ILogger {
    private readonly pino: Pino

    public constructor (pino: Pino) {
        this.pino = pino
    }

    public set_level (level: LogLevel): this {
        this.pino.level = level
        return this
    }

    public child (child_options: ChildLoggerOptions): ILogger {
        return new PinoLogger(this.pino.child(child_options))
    }

    public child_for_controller (name: string): ILogger {
        return this.child({controller: name})
    }

    public child_for_service (name: string): ILogger {
        return this.child({service: name})
    }

    public fatal (message: string, object: object = {}): void {
        this.pino.fatal(object, message)
    }

    public error (message: string, object: object = {}): void {
        this.pino.error(object, message)
    }

    public warn (message: string, object: object = {}): void {
        this.pino.warn(object, message)
    }

    public info (message: string, object: object = {}): void {
        this.pino.info(object, message)
    }

    public debug (message: string, object: object = {}): void {
        this.pino.debug(object, message)
    }

    public trace (message: string, object: object = {}): void {
        this.pino.trace(object, message)
    }
}
