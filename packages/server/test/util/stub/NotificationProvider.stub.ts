import sinon, {SinonStubbedInstance} from 'sinon'

import {INotificationProvider} from '~src/domain'

const {stub} = sinon

export function stub_notification_provider(): SinonStubbedInstance<INotificationProvider> {
    return {
        send: stub(),
    }
}
