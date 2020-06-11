import 'chai-as-promised'
import 'sinon-chai'
import {expect} from 'chai'
import sinon, {SinonStub} from 'sinon'

import {cli, Options} from '~src/cli'
import {BlockletOutput} from '~src/i3.interface'

import {with_console_silenced} from '~test/util'

const {stub} = sinon

describe('The CLI wrapper', function () {
    let client_ctor: SinonStub
    let blocklet_fn: SinonStub

    beforeEach(function () {
        client_ctor = stub()
        blocklet_fn = stub()
    })

    async function run_cli(
        argv: string[] = [],
        options: Partial<Options> = {}
    ): Promise<BlockletOutput> {
        const opts = Object.assign(
            {
                auto_exit: false,
                client_ctor,
                blocklet_fn,
            },
            options
        )

        return with_console_silenced(() => cli(argv, opts))
    }

    it('should throw if the endpoint is invalid', async function () {
        await expect(run_cli(['--endpoint', 'ftp://test.local'])).to.eventually.be.rejectedWith(
            'Endpoint must be http or https'
        )
    })

    it('should invoke the blocklet function with defaults', async function () {
        const client_instance = {}
        client_ctor.withArgs({endpoint: 'http://localhost:4979'}).returns(client_instance)

        await run_cli([])

        expect(client_ctor).to.have.been.calledWithNew
        expect(blocklet_fn).to.have.been.calledOnceWithExactly(client_instance)
    })

    it('should invoke the blocklet function with the provided parameters', async function () {
        const client_instance = {}
        client_ctor
            .withArgs({endpoint: 'https://di-server.home.local:443'})
            .returns(client_instance)

        await run_cli(['--endpoint', 'https://di-server.home.local:443'])

        expect(client_ctor).to.have.been.calledWithNew
        expect(blocklet_fn).to.have.been.calledOnceWithExactly(client_instance)
    })
})
