import sinon, {SinonStubbedInstance} from 'sinon'

import {IListenkeyProvider} from '../../../src/service'

export function create_listenkey_provider_stub (): SinonStubbedInstance<IListenkeyProvider> {
    return {
        get_listen_key: sinon.stub(),
    }
}
