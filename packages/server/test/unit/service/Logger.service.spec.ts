import {Logger as Pino} from 'pino'
import {spy, SinonSpy} from 'sinon'
import {expect} from 'chai'

import {Logger} from '@server/service'

type PinoStub = {
    trace: SinonSpy
    debug: SinonSpy
    warn: SinonSpy
    error: SinonSpy
    info: SinonSpy
    child: SinonSpy
}

function create_pino_stub (): PinoStub {
    return {
        trace: spy(),
        debug: spy(),
        warn: spy(),
        error: spy(),
        info: spy(),
        child: spy(),
    }
}

describe('Logger service', function () {
    let request_logger: SinonSpy
    let pino_stub: PinoStub
    let logger: Logger

    beforeEach(async function () {
        request_logger = spy()
        pino_stub = create_pino_stub()

        logger = new Logger('warn', pino_stub as any as Pino, request_logger)
    })

    it('should create a new logger for controllers', function () {
        const result = logger.for_controller('my-controller')

        expect(result).to.be.instanceOf(Logger)
        expect(pino_stub.child).to.have.been.calledOnceWith({controller: 'my-controller'})
    })

    it('should create a new logger for services', function () {
        const result = logger.for_service('my-service')

        expect(result).to.be.instanceOf(Logger)
        expect(pino_stub.child).to.have.been.calledOnceWith({service: 'my-service'})
    })

    describe('when told to log', function () {
        it('should do so on the "log" level', function () {
            logger.debug('test')
            expect(pino_stub.debug).to.have.been.calledOnceWithExactly('test')
        })

        it('should do so on the "error" level', function () {
            logger.error('test', 'trace')
            expect(pino_stub.error).to.have.been.calledOnceWithExactly('test', 'trace')
        })

        it('should do so on the "warn" level', function () {
            logger.warn('test')
            expect(pino_stub.warn).to.have.been.calledOnceWithExactly('test')
        })

        it('should do so on the "debug" level', function () {
            logger.debug('test')
            expect(pino_stub.debug).to.have.been.calledOnceWithExactly('test')
        })

        it('should do so on the "verbose" level', function () {
            logger.verbose('test')
            expect(pino_stub.trace).to.have.been.calledOnceWithExactly('test')
        })
    })
})
