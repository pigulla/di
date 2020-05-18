import sinon, {SinonStubbedInstance} from 'sinon'

import {IPeriodicTrigger} from '~src/domain'

const {stub} = sinon

export function stub_periodic_trigger(): SinonStubbedInstance<IPeriodicTrigger> {
    return {
        start: stub(),
        stop: stub(),
        is_running: stub(),
    }
}
