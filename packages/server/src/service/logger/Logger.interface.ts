import {IncomingMessage, ServerResponse} from 'http'

export type ChildLoggerOptions = {
    level?: LogLevel
    [key: string]: any
}

export enum LogLevel {
    FATAL = 'fatal',
    ERROR = 'error',
    WARN = 'warn',
    INFO = 'info',
    DEBUG = 'debug',
    TRACE ='trace',
}

export interface ILogger {
    set_level (level: LogLevel): this
    child (child_options: ChildLoggerOptions): ILogger
    child_for_controller (name: string): ILogger
    child_for_service (name: string): ILogger

    fatal(message: string, object?: object): void
    error(message: string, object?: object): void
    warn(message: string, object?: object): void
    info(message: string, object?: object): void
    debug(message: string, object?: object): void
    trace(message: string, object?: object): void
}

export interface RequestResponseLogger {
    (request: IncomingMessage, response: ServerResponse, next: Function): void
}
