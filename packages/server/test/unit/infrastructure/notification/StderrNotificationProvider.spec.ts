import hook_std from 'hook-std'
import {Test} from '@nestjs/testing'
import {expect} from 'chai'

import {StderrNotificationProvider} from '@src/infrastructure/notification'

describe('StderrNotificationProvider', function () {
    let stderr_notification_provider: StderrNotificationProvider

    beforeEach(async function () {
        const module = await Test.createTestingModule({
            providers: [
                StderrNotificationProvider,
            ],
        }).compile()

        stderr_notification_provider = module.get(StderrNotificationProvider)
    })

    it('should log a message', async function () {
        const promise = hook_std.stderr(output => {
            promise.unhook()
            expect(output).to.equal('[My title] My message')
        })

        stderr_notification_provider.send('My title', 'My message')

        await promise
    })
})
