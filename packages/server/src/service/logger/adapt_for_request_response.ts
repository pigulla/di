import {IncomingMessage, ServerResponse} from 'http'

import {Logger as Pino} from 'pino'
import pino_http from 'pino-http'

import {RequestResponseLogger} from '@server/service'

export function adapt_for_request_response (pino: Pino): RequestResponseLogger {
    const http_logger = pino_http({
        logger: pino,
        useLevel: 'trace',
    })

    return function request_logger (request: IncomingMessage, response: ServerResponse, next: Function): void {
        http_logger(request, response)
        next()
    }
}
