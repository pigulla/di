import {Test} from '@nestjs/testing'
import {expect} from 'chai'
import {SinonStubbedInstance} from 'sinon'

import {ILogger} from '~src/domain'
import {LogNotificationProvider} from '~src/infrastructure/notification'

import {stub_logger} from '../../../util'

describe('LogNotificationProvider', function () {
    let log_notification_provider: LogNotificationProvider
    let logger_stub: SinonStubbedInstance<ILogger>

    beforeEach(async function () {
        const parent_logger_stub = stub_logger()
        logger_stub = stub_logger()
        parent_logger_stub.child_for_service.returns(logger_stub)

        const module = await Test.createTestingModule({
            providers: [
                {
                    provide: 'ILogger',
                    useValue: parent_logger_stub,
                },
                LogNotificationProvider,
            ],
        }).compile()

        log_notification_provider = module.get(LogNotificationProvider)
    })

    it('should log a message', async function () {
        log_notification_provider.send('My title', 'My message')

        expect(logger_stub.info).to.have.been.calledOnceWithExactly('My message', {
            title: 'My title',
        })
    })
})
