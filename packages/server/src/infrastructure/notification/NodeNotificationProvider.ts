import {Inject, Injectable} from '@nestjs/common'
import notifier from 'node-notifier'

import {ILogger, INotificationProvider} from '../../domain'

@Injectable()
export class NodeNotificationProvider implements INotificationProvider {
    private readonly logger: ILogger
    private readonly node_notifier: typeof notifier

    public constructor (
        @Inject('ILogger') logger: ILogger,
    ) {
        this.logger = logger.child_for_service(NodeNotificationProvider.name)
        this.node_notifier = require('node-notifier')

        this.logger.debug('Service instantiated')
    }

    public send (title: string, message: string): void {
        this.node_notifier.notify({title, message})
    }
}
