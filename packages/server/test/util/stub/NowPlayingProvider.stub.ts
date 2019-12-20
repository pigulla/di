import sinon, {SinonStubbedInstance} from 'sinon'

import {IOnAirProvider} from '@src/domain'

export function create_now_playing_provider_stub (): SinonStubbedInstance<IOnAirProvider> {
    return {
        subscribe: sinon.stub(),
        get: sinon.stub(),
        get_all: sinon.stub(),
        get_by_channel_key: sinon.stub(),
        get_by_channel_id: sinon.stub(),
    }
}
