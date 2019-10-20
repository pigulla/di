import {Test} from '@nestjs/testing'
import {expect} from 'chai'
import {spy, useFakeTimers, SinonFakeTimers} from 'sinon'

import {PeriodicTrigger, ILogger, Options} from '@server/service'

import {create_logger_stub} from '../../util'

describe('PeriodicTrigger service', function () {
    let options: Options
    let clock: SinonFakeTimers
    let periodic_trigger: PeriodicTrigger
    let tickAsync: (ms: number) => Promise<void>

    beforeEach(async function () {
        options = {
            callback: spy(),
            scope: {},
            interval_ms: 5_000,
        }

        const module = await Test.createTestingModule({
            providers: [
                {
                    provide: 'ILogger',
                    useValue: create_logger_stub(),
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

    describe('when started', function () {
        beforeEach(function () {
            periodic_trigger.start()
        })

        it('should run', function () {
            expect(periodic_trigger.is_running()).to.be.true
        })

        it('should be stoppabled', function () {
            periodic_trigger.stop()
            expect(periodic_trigger.is_running()).to.be.false
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
