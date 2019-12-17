import {Inject} from '@nestjs/common'
import notifier from 'node-notifier'

import {ILogger, INotificationProvider} from '../../domain'

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

    private get notifier (): typeof notifier {
        if (!this.node_notifier) {
            throw new Error('Module not yet loaded')
        }

        return this.node_notifier
    }

    public send (title: string, message: string): void {
        this.notifier.notify({title, message})
    }

    public static is_node_notifier_installed (): boolean {
        try {
            require.resolve('node-notifier')
            return true
        } catch (error) {
            if (error.code === 'MODULE_NOT_FOUND') {
                return false
            }

            throw error
        }
    }
}
