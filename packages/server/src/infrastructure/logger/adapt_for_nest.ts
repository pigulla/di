import {LoggerService} from '@nestjs/common'

import {ILogger} from '../../domain'

export function adapt_for_nest(logger: ILogger): Required<LoggerService> {
    return {
        error(message: any, trace?: string, context?: string) {
            logger.error(message, {trace, context})
        },
        warn(message: any, context?: string) {
            logger.warn(message, {context})
        },
        log(message: any, context?: string) {
            logger.info(message, {context})
        },
        debug(message: any, context?: string) {
            logger.debug(message, {context})
        },
        verbose(message: any, context?: string) {
            logger.trace(message, {context})
        },
    }
}
