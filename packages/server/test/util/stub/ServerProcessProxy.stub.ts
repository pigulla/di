import sinon, {SinonStubbedInstance} from 'sinon'

import {IServerProcessProxy} from '@src/domain'

export function create_server_process_proxy_stub (): SinonStubbedInstance<IServerProcessProxy> {
    return {
        terminate: sinon.stub(),
    }
}
