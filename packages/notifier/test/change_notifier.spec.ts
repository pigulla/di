import {expect} from 'chai'
import {match, stub, SinonStub} from 'sinon'
import hook_std, {HookPromise} from 'hook-std'

import {change_notifier, Options} from '@src/change_notifier'
import {StopFn} from '@src/start_poll'

describe('The notifier wrapper', function () {
    let unhook_promise: HookPromise
    let client_ctor: SinonStub
    let start_poll: SinonStub
    let stop_fn: SinonStub

    beforeEach(function () {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        unhook_promise = hook_std.stderr(_output => {})

        client_ctor = stub()
        start_poll = stub()
        stop_fn = stub()
    })

    afterEach(async function () {
        unhook_promise.unhook()
        await unhook_promise
    })

    async function run_notifier (argv: string[] = [], options: Partial<Options> = {}): Promise<StopFn> {
        start_poll.resolves(stop_fn)

        const opts = Object.assign({
            auto_exit: false,
            ClientCtor: client_ctor,
            start_poll,
        }, options)

        return change_notifier(argv, opts)
    }

    it('should throw if invalid arguments are passed', async function () {
        await expect(run_notifier(['--foo'])).to.eventually.be.rejectedWith('Unknown argument: foo')
    })

    it('should throw if the port is not an integer', async function () {
        await expect(run_notifier(['-p', '80.80'])).to.eventually.be.rejectedWith('Port must be an integer')
    })

    it('should throw if the port is out of range', async function () {
        await expect(run_notifier(['--port', '471100'])).to.eventually.be.rejectedWith('Port must be below')
    })

    it('should invoke the start_poll function with defaults', async function () {
        const client_instance = {}
        client_ctor.withArgs({endpoint: 'http://localhost:4979'}).returns(client_instance)

        await run_notifier([])

        expect(client_ctor).to.have.been.calledWithNew
        expect(start_poll).to.have.been.calledOnceWithExactly(client_instance, 2.5, match.func)
    })

    it('should invoke the start_poll function with the provided parameters', async function () {
        const client_instance = {}
        client_ctor.withArgs({endpoint: 'https://di.local:4711'}).returns(client_instance)

        await run_notifier(['--hostname', 'di.local', '-p', '4711', '--https', '-i', '10'])

        expect(client_ctor).to.have.been.calledWithNew
        expect(start_poll).to.have.been.calledOnceWithExactly(client_instance, 10, match.func)
    })
})
