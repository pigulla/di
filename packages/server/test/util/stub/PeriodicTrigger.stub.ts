import sinon, {SinonStubbedInstance} from 'sinon'

import {IPeriodicTrigger} from '@server/service'

export function create_periodic_trigger_stub (): SinonStubbedInstance<IPeriodicTrigger> {
    return {
        start: sinon.stub(),
        stop: sinon.stub(),
        is_running: sinon.stub(),
    }
}
