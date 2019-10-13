import {IncomingMessage, ServerResponse} from 'http'
import {Logger as Pino} from 'pino'
import pino_http from 'pino-http'

export type RequestLogger = (request: IncomingMessage, response: ServerResponse, next: Function) => void;

export function get_request_logger (pino: Pino): RequestLogger {
    const logger = pino_http({
        logger: pino,
        useLevel: 'trace',
    })

    return function request_logger (request: IncomingMessage, response: ServerResponse, next: Function): void {
        logger(request, response)
        next()
    }
}
