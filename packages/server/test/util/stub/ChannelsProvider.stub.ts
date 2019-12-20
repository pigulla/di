import sinon, {SinonStubbedInstance} from 'sinon'

import {IChannelsProvider} from '@src/domain'

export function create_channels_provider_stub (): SinonStubbedInstance<IChannelsProvider> {
    return {
        channel_exists: sinon.stub(),
        get: sinon.stub(),
        get_all: sinon.stub(),
        get_filters: sinon.stub(),
    }
}
