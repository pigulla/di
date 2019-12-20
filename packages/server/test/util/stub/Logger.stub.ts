import {stub, SinonStubbedInstance} from 'sinon'

import {ILogger} from '@src/domain'

export function create_logger_stub (): SinonStubbedInstance<ILogger> {
    return {
        fatal: stub(),
        error: stub(),
        warn: stub(),
        info: stub(),
        debug: stub(),
        trace: stub(),
        set_level: stub(),
        child: stub(),
        child_for_controller: stub(),
        child_for_service: stub(),
    }
}
