import {LoggerService} from '@nestjs/common'
import {expect} from 'chai'
import {SinonStubbedInstance} from 'sinon'

import {ILogger} from '~src/domain'
import {adapt_for_nest} from '~src/infrastructure/logger'

import {stub_logger} from '~test/util/stub'

describe('adapt_for_nest', function () {
    const message = 'Log message'
    const context = 'context'

    let logger_stub: SinonStubbedInstance<ILogger>
    let adapter: Required<LoggerService>

    beforeEach(async function () {
        logger_stub = stub_logger()
        adapter = adapt_for_nest(logger_stub)
    })

    it('should proxy error to error', function () {
        const trace = 'trace'

        adapter.error(message, trace, context)
        expect(logger_stub.error).to.have.been.calledOnceWithExactly(message, {trace, context})
    })

    it('should proxy warn to warn', function () {
        adapter.warn(message, context)
        expect(logger_stub.warn).to.have.been.calledOnceWithExactly(message, {context})
    })

    it('should proxy log to info', function () {
        adapter.log(message, context)
        expect(logger_stub.info).to.have.been.calledOnceWithExactly(message, {context})
    })

    it('should proxy debug to debug', function () {
        adapter.debug(message, context)
        expect(logger_stub.debug).to.have.been.calledOnceWithExactly(message, {context})
    })

    it('should proxy verbose to trace', function () {
        adapter.verbose(message, context)
        expect(logger_stub.trace).to.have.been.calledOnceWithExactly(message, {context})
    })
})
