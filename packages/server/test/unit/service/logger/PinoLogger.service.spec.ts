import {expect} from 'chai'
import {Logger as Pino} from 'pino'

import {PinoLogger} from '@src/service/logger'

import {create_pino_stub, PinoStub} from '@test/util/stub'

describe('Logger service', function () {
    let pino_stub: PinoStub
    let logger: PinoLogger

    beforeEach(async function () {
        pino_stub = create_pino_stub()

        logger = new PinoLogger(pino_stub as any as Pino)
    })

    it('should create a new logger for controllers', function () {
        const result = logger.child_for_controller('my-controller')

        expect(result).to.be.instanceOf(PinoLogger)
        expect(pino_stub.child).to.have.been.calledOnceWith({controller: 'my-controller'})
    })

    it('should create a new logger for services', function () {
        const result = logger.child_for_service('my-service')

        expect(result).to.be.instanceOf(PinoLogger)
        expect(pino_stub.child).to.have.been.calledOnceWith({service: 'my-service'})
    })

    describe('when told to log', function () {
        const data = {}

        it('should do so on the "fatal" level', function () {
            logger.fatal('test', data)
            expect(pino_stub.fatal).to.have.been.calledOnceWithExactly(data, 'test')
        })

        it('should do so on the "error" level', function () {
            logger.error('test', data)
            expect(pino_stub.error).to.have.been.calledOnceWithExactly(data, 'test')
        })

        it('should do so on the "warn" level', function () {
            logger.warn('test', data)
            expect(pino_stub.warn).to.have.been.calledOnceWithExactly(data, 'test')
        })

        it('should do so on the "info" level', function () {
            logger.info('test', data)
            expect(pino_stub.info).to.have.been.calledOnceWithExactly(data, 'test')
        })

        it('should do so on the "debug" level', function () {
            logger.debug('test', data)
            expect(pino_stub.debug).to.have.been.calledOnceWithExactly(data, 'test')
        })

        it('should do so on the "trace" level', function () {
            logger.trace('test', data)
            expect(pino_stub.trace).to.have.been.calledOnceWithExactly(data, 'test')
        })
    })
})
