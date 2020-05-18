import {Test} from '@nestjs/testing'
import {expect} from 'chai'
import sinon, {SinonFakeTimers, SinonStubbedInstance, SinonStub} from 'sinon'
import {Merge} from 'type-fest'

import {PeriodicTrigger, Options, ILogger} from '~src/domain'

import {stub_logger} from '~test/util'

const {match, stub} = sinon

describe('PeriodicTrigger', function () {
    let options: Merge<Options, {callback: SinonStub}>
    let logger_stub: SinonStubbedInstance<ILogger>
    let clock: SinonFakeTimers
    let periodic_trigger: PeriodicTrigger
    let tick_async: (ms: number) => Promise<void>

    beforeEach(async function () {
        options = {
            log_id: 'log-id',
            callback: stub(),
            scope: {},
            interval_ms: 5_000,
        }

        const parent_logger_stub = stub_logger()
        logger_stub = stub_logger()
        parent_logger_stub.child_for_service.returns(logger_stub)

        const module = await Test.createTestingModule({
            providers: [
                {
                    provide: 'ILogger',
                    useValue: parent_logger_stub,
                },
                {
                    inject: ['ILogger'],
                    provide: 'PeriodicTrigger',
                    useFactory(logger: ILogger): PeriodicTrigger {
                        return new PeriodicTrigger(logger, options)
                    },
                },
            ],
        }).compile()

        periodic_trigger = module.get(PeriodicTrigger)

        // See https://github.com/sinonjs/sinon/issues/738
        const original_set_immediate = setImmediate
        clock = sinon.useFakeTimers()
        tick_async = async function (ms: number) {
            clock.tick(ms)
            await new Promise(resolve => original_set_immediate(resolve))
        }
    })

    afterEach(function () {
        clock.restore()
    })

    describe('when it has not yet been started', function () {
        it('should not be running by default', function () {
            expect(periodic_trigger.is_running()).to.be.false
        })

        it('should start on module init', function () {
            periodic_trigger.onModuleInit()

            expect(periodic_trigger.is_running()).to.be.true
        })

        it('should not stop', function () {
            periodic_trigger.stop()

            expect(clock.countTimers()).to.equal(0)
        })
    })

    describe('when started', function () {
        beforeEach(function () {
            periodic_trigger.start()
        })

        it('should run', function () {
            expect(periodic_trigger.is_running()).to.be.true
        })

        it('should stop on module destruction', function () {
            periodic_trigger.onModuleDestroy()

            expect(periodic_trigger.is_running()).to.be.false
        })

        it('should be stoppable', function () {
            periodic_trigger.stop()
            expect(periodic_trigger.is_running()).to.be.false
        })

        it('should log errors', async function () {
            const error = new Error('oh_noes')

            options.callback.rejects(error)
            periodic_trigger.start()

            await tick_async(5_000)
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
            await tick_async(5_000)
            await tick_async(5_000)
            await tick_async(5_000)

            expect(options.callback).to.have.been.calledThrice
        })
    })
})
