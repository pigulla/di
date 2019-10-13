import sinon, {SinonStubbedInstance} from 'sinon'

import {IChannelProvider} from '../../../src/service'

export function create_channel_provider_stub (): SinonStubbedInstance<IChannelProvider> {
    return {
        channel_exists: sinon.stub(),
        get_channel: sinon.stub(),
        get_channel_by_id: sinon.stub(),
        get_channel_by_key: sinon.stub(),
        get_channels: sinon.stub(),
        get_filters: sinon.stub(),
    }
}
