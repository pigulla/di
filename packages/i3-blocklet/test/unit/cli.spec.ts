import 'chai-as-promised'
import 'sinon-chai'
import {expect} from 'chai'
import sinon, {SinonStub, SinonStubbedInstance} from 'sinon'
import yargs from 'yargs'

import {cli, Options} from '~src/cli'
import {BlockletOutput} from '~src/i3.interface'

import {with_console_silenced} from '~test/util'

type Yargs = typeof yargs

const {stub} = sinon

function stub_yargs_parser<T>(result: T): SinonStubbedInstance<Yargs> {
    return {
        exitProcess: stub<Parameters<Yargs['exitProcess']>>().returnsThis(),
        env: stub<Parameters<Yargs['env']>>().returnsThis(),
        scriptName: stub<Parameters<Yargs['scriptName']>>().returnsThis(),
        options: stub<Parameters<Yargs['options']>>().returnsThis(),
        help: stub<Parameters<Yargs['help']>>().returnsThis(),
        parse: stub<Parameters<Yargs['parse']>>().returns(result),
    } as SinonStubbedInstance<Yargs>
}

describe('The CLI wrapper', function () {
    let client_ctor: SinonStub
    let blocklet_fn: SinonStub
    let yargs_parser: SinonStubbedInstance<Yargs>

    beforeEach(function () {
        client_ctor = stub()
        blocklet_fn = stub()
        yargs_parser = stub_yargs_parser({
            endpoint: 'http://di.local',
        })
    })

    async function run_cli(
        argv: string[] = [],
        options: Partial<Options> = {}
    ): Promise<BlockletOutput> {
        const opts = Object.assign(
            {
                auto_exit: false,
                enable_env: true,
                yargs_parser,
                client_ctor,
                blocklet_fn,
            },
            options
        )

        return with_console_silenced(() => cli(argv, opts))
    }

    it('should invoke the blocklet function', async function () {
        const client_instance = {}
        const argv: string[] = []
        client_ctor.withArgs({endpoint: 'http://di.local'}).returns(client_instance)

        await run_cli(argv)

        expect(yargs_parser.parse).to.have.been.calledOnceWithExactly(argv)
        expect(yargs_parser.env).to.have.been.calledOnceWithExactly('DI_')
        expect(client_ctor).to.have.been.calledWithNew
        expect(blocklet_fn).to.have.been.calledOnceWithExactly(client_instance)
    })

    it('should ignore environment variables when configured to do so', async function () {
        const client_instance = {}
        const argv: string[] = []
        client_ctor.withArgs({endpoint: 'http://di.local'}).returns(client_instance)

        await run_cli(argv, {enable_env: false})

        expect(yargs_parser.env).to.have.been.calledOnceWithExactly(false)
    })
})
