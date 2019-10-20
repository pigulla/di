import sinon, {SinonStubbedInstance} from 'sinon'

import {IChannelProvider} from '@server/service'

export function create_channel_provider_stub (): SinonStubbedInstance<IChannelProvider> {
    return {
        channel_exists: sinon.stub(),
        get: sinon.stub(),
        get_by_id: sinon.stub(),
        get_by_key: sinon.stub(),
        get_all: sinon.stub(),
        get_filters: sinon.stub(),
    }
}
