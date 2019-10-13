import {LoggerService} from '@nestjs/common'

import {RequestLogger} from '../middleware'

export interface ILogger extends Required<LoggerService> {
    get_request_logger(): RequestLogger
    for_controller (name: string): ILogger
    for_service (name: string): ILogger
}
