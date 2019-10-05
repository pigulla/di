import pino, {Logger as Pino} from 'pino';
import {Inject, LoggerService} from '@nestjs/common';

import {IConfigProvider} from './ConfigProvider.service';
import {get_request_logger, RequestLogger} from '../middleware';

export interface ILogger extends Required<LoggerService> {
    get_request_logger(): RequestLogger;
    for_controller (name: string): ILogger;
    for_service (name: string): ILogger;
}

export class Logger implements ILogger {
    private readonly config: IConfigProvider;
    private readonly pino: Pino;
    private readonly pino_request_logger: RequestLogger;

    public constructor (
        @Inject('IConfigProvider') config: IConfigProvider,
            pino_instance?: Pino,
            request_logger?: RequestLogger,
    ) {
        this.config = config;
        this.pino = pino_instance || pino({
            level: config.server.loglevel,
            prettyPrint: config.server.logformat === 'pretty',
        });
        this.pino_request_logger = request_logger || get_request_logger(this.pino);
    }

    public get_request_logger (): RequestLogger {
        return this.pino_request_logger;
    }

    public for_controller (name: string): ILogger {
        return new Logger(this.config, this.pino.child({controller: name}), this.pino_request_logger);
    }

    public for_service (name: string): ILogger {
        return new Logger(this.config, this.pino.child({service: name}), this.pino_request_logger);
    }

    public log (message: string): void {
        this.pino.info(message);
    }

    public error (message: string, trace: string): void {
        this.pino.error(message, trace);
    }

    public warn (message: string): void {
        this.pino.warn(message);
    }

    public debug (message: string): void {
        this.pino.debug(message);
    }

    public verbose (message: string): void {
        this.pino.trace(message);
    }
}
