import sinon, {SinonStubbedInstance} from 'sinon'

import {IServerProcessProxy} from '@server/service'

export function create_server_process_proxy_stub (): SinonStubbedInstance<IServerProcessProxy> {
    return {
        terminate: sinon.stub(),
    }
}
