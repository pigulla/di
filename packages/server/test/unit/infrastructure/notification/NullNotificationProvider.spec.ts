import {Test} from '@nestjs/testing'
import {expect} from 'chai'

import {NullNotificationProvider} from '@src/infrastructure/notification'

describe('NullNotificationProvider', function () {
    let null_notification_provider: NullNotificationProvider

    beforeEach(async function () {
        const module = await Test.createTestingModule({
            providers: [
                NullNotificationProvider,
            ],
        }).compile()

        null_notification_provider = module.get(NullNotificationProvider)
    })

    it('should do nothing', async function () {
        expect(() => null_notification_provider.send('My title', 'My message')).to.not.throw
    })
})
