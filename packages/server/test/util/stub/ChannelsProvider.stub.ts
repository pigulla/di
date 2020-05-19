import sinon, {SinonStubbedInstance} from 'sinon'

import {IChannelsProvider} from '~src/domain'

const {stub} = sinon

export function stub_channels_provider(): SinonStubbedInstance<IChannelsProvider> {
    return {
        channel_exists: stub(),
        get: stub(),
        get_all: stub(),
        get_filters: stub(),
    }
}
