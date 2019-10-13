import sinon, {SinonStubbedInstance} from 'sinon'

import {ILogger} from '../../../src/service'

export function create_logger_stub (): SinonStubbedInstance<ILogger> {
    return {
        debug: sinon.stub(),
        error: sinon.stub(),
        log: sinon.stub(),
        verbose: sinon.stub(),
        warn: sinon.stub(),
        get_request_logger: sinon.stub(),
        for_controller: sinon.stub<any>().returnsThis(),
        for_service: sinon.stub<any>().returnsThis(),
    }
}
