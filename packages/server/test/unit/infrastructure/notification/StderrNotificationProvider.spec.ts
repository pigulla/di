import {Test} from '@nestjs/testing'
import {expect} from 'chai'
import sinon, {SinonSpy} from 'sinon'

import {StderrNotificationProvider} from '~src/infrastructure/notification'

describe('StderrNotificationProvider', function () {
    let stderr_notification_provider: StderrNotificationProvider
    let stderr_write_spy: SinonSpy

    beforeAll(function () {
        stderr_write_spy = sinon.spy(process.stderr, 'write')
    })

    beforeEach(function () {
        stderr_write_spy.resetHistory()
    })

    afterAll(function () {
        stderr_write_spy.restore()
    })

    beforeEach(async function () {
        const module = await Test.createTestingModule({
            providers: [StderrNotificationProvider],
        }).compile()

        stderr_notification_provider = module.get(StderrNotificationProvider)
    })

    it('should log a message', function () {
        stderr_notification_provider.send('My title', 'My message')

        expect(stderr_write_spy).to.have.been.calledOnceWithExactly('[My title] My message')
    })
})
