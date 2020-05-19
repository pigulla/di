import sinon, {SinonStubbedInstance} from 'sinon'

import {IPlaybackStateProvider} from '~src/domain'

const {stub} = sinon

export function stub_playback_state_provider(): SinonStubbedInstance<IPlaybackStateProvider> {
    return {
        trigger_check: stub(),
        get_state: stub(),
        subscribe: stub(),
    }
}
