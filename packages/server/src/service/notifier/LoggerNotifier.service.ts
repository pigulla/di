import {Inject} from '@nestjs/common'

import {INotifier} from './Notifier.interface'
import {ILogger} from '../logger'

export class LoggerNotifier implements INotifier {
    private readonly logger: ILogger

    public constructor (
        @Inject('ILogger') logger: ILogger,
    ) {
        this.logger = logger.child_for_service(LoggerNotifier.name)

        this.logger.debug('Service instantiated')
    }

    public send (title: string, message: string): void {
        this.logger.info(message, {title})
    }
}
