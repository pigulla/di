import sinon, {SinonStubbedInstance} from 'sinon'

import {IChannelsProvider} from '@server/service'

export function create_channels_provider_stub (): SinonStubbedInstance<IChannelsProvider> {
    return {
        channel_exists: sinon.stub(),
        get: sinon.stub(),
        get_by_id: sinon.stub(),
        get_by_key: sinon.stub(),
        get_all: sinon.stub(),
        get_filters: sinon.stub(),
    }
}
