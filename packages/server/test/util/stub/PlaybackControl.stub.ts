import sinon, {SinonStubbedInstance} from 'sinon'

import {IPlaybackControl} from '~src/domain'

const {stub} = sinon

export function stub_playback_control(): SinonStubbedInstance<IPlaybackControl> {
    return {
        get_current_channel_key: stub(),
        get_pid: stub(),
        get_playback_backend_information: stub(),
        get_volume: stub(),
        is_playing: stub(),
        play: stub(),
        set_volume: stub(),
        stop: stub(),
    }
}
