import sinon, {SinonStubbedInstance} from 'sinon'

import {ILogger} from '~src/domain'

const {stub} = sinon

export function stub_logger(): SinonStubbedInstance<ILogger> {
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
