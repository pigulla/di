import sinon, {SinonStubbedInstance} from 'sinon'

import {IServerProcessProxy} from '~src/domain'

const {stub} = sinon

export function stub_server_process_proxy(): SinonStubbedInstance<IServerProcessProxy> {
    return {
        terminate: stub(),
    }
}
