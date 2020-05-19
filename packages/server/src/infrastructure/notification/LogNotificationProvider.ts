import {Inject, Injectable} from '@nestjs/common'

import {ILogger, INotificationProvider} from '../../domain'

@Injectable()
export class LogNotificationProvider implements INotificationProvider {
    private readonly logger: ILogger

    public constructor(@Inject('ILogger') logger: ILogger) {
        this.logger = logger.child_for_service(LogNotificationProvider.name)

        this.logger.debug('Service instantiated')
    }

    public send(title: string, message: string): void {
        this.logger.info(message, {title})
    }
}
