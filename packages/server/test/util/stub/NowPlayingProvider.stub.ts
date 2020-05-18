import sinon, {SinonStubbedInstance} from 'sinon'

import {IOnAirProvider} from '~src/domain'

const {stub} = sinon

export function stub_on_air_provider(): SinonStubbedInstance<IOnAirProvider> {
    return {
        subscribe: stub(),
        get: stub(),
        get_all: stub(),
        get_by_channel_key: stub(),
        get_by_channel_id: stub(),
    }
}
