import {stub, SinonStubbedInstance} from 'sinon'

import {IPlaybackStateProvider} from '@src/domain'

export function create_playback_state_provider_stub (): SinonStubbedInstance<IPlaybackStateProvider> {
    return {
        trigger_check: stub(),
        get_state: stub(),
        subscribe: stub(),
    }
}
