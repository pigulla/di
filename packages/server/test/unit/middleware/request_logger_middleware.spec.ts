import {EventEmitter} from 'events'

import http_mocks from 'node-mocks-http'
import {Logger as Pino} from 'pino'
import {expect} from 'chai'
import {match, spy} from 'sinon'

import {create_request_logger} from '@server/middleware'

import {create_pino_stub, PinoStub} from '../../util/stub'

describe('The request logger middleware', function () {
    let pino_stub: PinoStub

    beforeEach(function () {
        pino_stub = create_pino_stub()
    })

    it('should log the request and call next', function () {
        const child_logger = create_pino_stub()
        const req_res_logger = create_pino_stub()
        const next = spy()
        const {req, res} = http_mocks.createMocks({}, {eventEmitter: EventEmitter})

        pino_stub.child.onFirstCall().returns(child_logger)
        child_logger.child.onFirstCall().returns(req_res_logger)

        const request_logger = create_request_logger(pino_stub as any as Pino)
        request_logger(req, res, next)

        expect(next).to.have.been.calledOnceWithExactly()
        expect(req_res_logger.trace).not.to.have.been.called

        res.emit('finish')
        expect(req_res_logger.trace).to.have.been.calledOnceWithExactly({
            res,
            responseTime: match.number,
        }, 'request completed')
    })
})
