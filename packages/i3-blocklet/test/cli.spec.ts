import {expect} from 'chai'
import {stub, SinonStub} from 'sinon'
import hook_std, {HookPromise} from 'hook-std'

import {cli, Options} from '@src/cli'
import {BlockletOutput} from '@src/i3.interface'

describe('The CLI wrapper', function () {
    let unhook_promise: HookPromise
    let client_ctor: SinonStub
    let blocklet_fn: SinonStub

    beforeEach(function () {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        unhook_promise = hook_std.stderr(_output => {})

        client_ctor = stub()
        blocklet_fn = stub()
    })

    afterEach(async function () {
        unhook_promise.unhook()
        await unhook_promise
    })

    async function run_cli (argv: string[] = [], options: Partial<Options> = {}): Promise<BlockletOutput> {
        const opts = Object.assign({
            auto_exit: false,
            ClientCtor: client_ctor,
            blocklet_fn,
        }, options)

        return cli(argv, opts)
    }

    it('should throw if invalid arguments are passed', async function () {
        await expect(run_cli(['--foo'])).to.eventually.be.rejectedWith('Unknown argument: foo')
    })

    it('should throw if the port is not an integer', async function () {
        await expect(run_cli(['-p', '80.80'])).to.eventually.be.rejectedWith('Port must be an integer')
    })

    it('should throw if the port is out of range', async function () {
        await expect(run_cli(['--port', '471100'])).to.eventually.be.rejectedWith('Port must be below')
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
