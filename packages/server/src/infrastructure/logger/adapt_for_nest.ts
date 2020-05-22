import {LoggerService} from '@nestjs/common'

import {ILogger} from '../../domain'

export function adapt_for_nest(logger: ILogger): Required<LoggerService> {
    return {
        error(message: string, trace?: string, context?: string): void {
            logger.error(message, {trace, context})
        },
        warn(message: string, context?: string): void {
            logger.warn(message, {context})
        },
        log(message: string, context?: string): void {
            logger.info(message, {context})
        },
        debug(message: string, context?: string): void {
            logger.debug(message, {context})
        },
        verbose(message: string, context?: string): void {
            logger.trace(message, {context})
        },
    }
}
