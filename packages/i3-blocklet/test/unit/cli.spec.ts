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

    it('should throw if invalid arguments are passed', async function () {
        await expect(run_cli(['--foo'])).to.eventually.be.rejectedWith('Unknown argument: foo')
    })

    it('should throw if the port is not an integer', async function () {
        await expect(run_cli(['-p', '80.80'])).to.eventually.be.rejectedWith(
            'Port must be an integer'
        )
    })

    it('should throw if the port is out of range', async function () {
        await expect(run_cli(['--port', '471100'])).to.eventually.be.rejectedWith(
            'Port must be below'
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
        client_ctor.withArgs({endpoint: 'https://di.local:4711'}).returns(client_instance)

        await run_cli(['--hostname', 'di.local', '-p', '4711', '--https'])

        expect(client_ctor).to.have.been.calledWithNew
        expect(blocklet_fn).to.have.been.calledOnceWithExactly(client_instance)
    })
})
