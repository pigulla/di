import {Test} from '@nestjs/testing'
import {expect} from 'chai'
import {match, stub, useFakeTimers, SinonFakeTimers, SinonStubbedInstance, SinonStub} from 'sinon'
import {Merge} from 'type-fest'

import {PeriodicTrigger, ILogger, Options} from '@server/service'

import {create_logger_stub} from '../../util'

describe('PeriodicTrigger service', function () {
    let options: Merge<Options, {callback: SinonStub}>
    let logger_stub: SinonStubbedInstance<ILogger>
    let clock: SinonFakeTimers
    let periodic_trigger: PeriodicTrigger
    let tickAsync: (ms: number) => Promise<void>

    beforeEach(async function () {
        options = {
            callback: stub(),
            scope: {},
            timeout_id: 5_000,
        }

        logger_stub = create_logger_stub()

        const module = await Test.createTestingModule({
            providers: [
                {
                    provide: 'ILogger',
                    useValue: logger_stub,
                },
                {
                    inject: ['ILogger'],
                    provide: 'PeriodicTrigger',
                    useFactory (logger: ILogger): PeriodicTrigger {
                        return new PeriodicTrigger(logger, options)
                    },
                },
            ],
        }).compile()

        periodic_trigger = module.get(PeriodicTrigger)

        // See https://github.com/sinonjs/sinon/issues/738
        const originalSetImmediate = setImmediate
        clock = useFakeTimers()
        tickAsync = async function (ms: number) {
            clock.tick(ms)
            await new Promise(resolve => originalSetImmediate(resolve))
        }
    })

    afterEach(function () {
        clock.restore()
    })

    it('should not be running by default', function () {
        expect(periodic_trigger.is_running()).to.be.false
    })

    it('should start on application bootstrap', function () {
        periodic_trigger.onApplicationBootstrap()

        expect(periodic_trigger.is_running()).to.be.true
    })

    it('should stop on application shutdown', function () {
        periodic_trigger.start()
        periodic_trigger.onApplicationShutdown()

        expect(periodic_trigger.is_running()).to.be.false
    })

    describe('when started', function () {
        beforeEach(function () {
            periodic_trigger.start()
        })

        it('should run', function () {
            expect(periodic_trigger.is_running()).to.be.true
        })

        it('should be stoppable', function () {
            periodic_trigger.stop()
            expect(periodic_trigger.is_running()).to.be.false
        })

        it('should log errors', async function () {
            const error = new Error('oh_noes')

            options.callback.rejects(error)
            periodic_trigger.start()

            await tickAsync(5_000)
            expect(logger_stub.error).to.have.been.calledOnceWithExactly(match(/oh_noes/))
        })

        it('should not invoke the callback', function () {
            clock.tick(4_500)
            expect(options.callback).to.not.have.been.called
        })

        it('should invoke the callback', function () {
            clock.tick(5_500)
            expect(options.callback).to.have.been.calledOnceWithExactly()
            expect(options.callback).to.have.been.calledOn(options.scope)
        })

        it('should invoke the callback repeatedly', async function () {
            await tickAsync(5_000)
            await tickAsync(5_000)
            await tickAsync(5_000)

            expect(options.callback).to.have.been.calledThrice
        })
    })
})
