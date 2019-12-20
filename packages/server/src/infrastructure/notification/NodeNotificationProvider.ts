import {Inject, Injectable} from '@nestjs/common'
import {NodeNotifier} from 'node-notifier'

import {ILogger, INotificationProvider} from '../../domain'

@Injectable()
export class NodeNotificationProvider implements INotificationProvider {
    private readonly logger: ILogger
    private readonly node_notifier: NodeNotifier

    public constructor (
        @Inject('ILogger') logger: ILogger,
        @Inject('NodeNotifier') node_notifier: NodeNotifier,
    ) {
        this.logger = logger.child_for_service(NodeNotificationProvider.name)
        this.node_notifier = node_notifier

        this.logger.debug('Service instantiated')
    }

    public send (title: string, message: string): void {
        this.node_notifier.notify({title, message})
    }
}
