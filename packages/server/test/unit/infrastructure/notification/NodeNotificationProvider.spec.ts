import {Test} from '@nestjs/testing'
import {expect} from 'chai'
import {stub, SinonStubbedInstance} from 'sinon'
import notifier from 'node-notifier'

import {ILogger} from '@src/domain'

import {create_logger_stub} from '../../../util'
import {NodeNotificationProvider} from '@src/infrastructure/notification'

function create_node_notifier_stub (): Partial<SinonStubbedInstance<typeof notifier>> {
    return {
        notify: stub(),
    }
}

describe('NodeNotificationProvider', function () {
    let node_notification_provider: NodeNotificationProvider
    let logger_stub: SinonStubbedInstance<ILogger>
    let node_notifier_stub: Partial<SinonStubbedInstance<typeof notifier>>

    beforeEach(async function () {
        const parent_logger_stub = create_logger_stub()
        logger_stub = create_logger_stub()
        parent_logger_stub.child_for_service.returns(logger_stub)
        node_notifier_stub = create_node_notifier_stub()

        const module = await Test.createTestingModule({
            providers: [
                {
                    provide: 'ILogger',
                    useValue: parent_logger_stub,
                },
                {
                    provide: 'NodeNotifier',
                    useValue: node_notifier_stub,
                },
                NodeNotificationProvider,
            ],
        }).compile()

        node_notification_provider = module.get(NodeNotificationProvider)
    })

    it('should log a message', async function () {
        node_notification_provider.send('My title', 'My message')

        expect(node_notifier_stub.notify).to.have.been.calledOnceWithExactly({
            title: 'My title',
            message: 'My message',
        })
    })
})
