import sinon, {SinonStubbedInstance} from 'sinon'

import {IListenKeyProvider} from '../../../src/service'

export function create_listen_key_provider_stub (): SinonStubbedInstance<IListenKeyProvider> {
    return {
        get_listen_key: sinon.stub(),
    }
}
