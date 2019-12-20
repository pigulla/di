import {stub, SinonStubbedInstance} from 'sinon'

import {INotificationProvider} from '@src/domain'

export function create_notification_provider_stub (): SinonStubbedInstance<INotificationProvider> {
    return {
        send: stub(),
    }
}
