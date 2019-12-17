import {expect} from 'chai'
import {stub} from 'sinon'

import {ServerProcessProxy} from '@src/infrastructure'

describe('ServerProcessProxy service', function () {
    it('should terminate the process', function () {
        const process_stub = {
            kill: stub(),
            pid: 42,
        }

        const server_process_proxy = new ServerProcessProxy(process_stub as any as NodeJS.Process)
        server_process_proxy.terminate()

        expect(process_stub.kill).to.have.been.calledOnceWithExactly(42, 'SIGTERM')
    })
})
