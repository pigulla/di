import {Test} from '@nestjs/testing'
import {expect} from 'chai'
import notifier from 'node-notifier'
import sinon, {SinonStubbedInstance} from 'sinon'

import {ILogger} from '~src/domain'
import {NodeNotificationProvider} from '~src/infrastructure/notification'

import {stub_logger} from '../../../util'

const {stub} = sinon

function stub_node_notifier(): Partial<SinonStubbedInstance<typeof notifier>> {
    return {
        notify: stub(),
    }
}

describe('NodeNotificationProvider', function () {
    let node_notification_provider: NodeNotificationProvider
    let logger_stub: SinonStubbedInstance<ILogger>
    let node_notifier_stub: Partial<SinonStubbedInstance<typeof notifier>>

    beforeEach(async function () {
        const parent_logger_stub = stub_logger()
        logger_stub = stub_logger()
        parent_logger_stub.child_for_service.returns(logger_stub)
        node_notifier_stub = stub_node_notifier()

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
