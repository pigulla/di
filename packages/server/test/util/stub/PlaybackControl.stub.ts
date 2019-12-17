import {stub, SinonStubbedInstance} from 'sinon'

import {IPlaybackControl} from '@src/domain'

export function create_playback_control_stub (): SinonStubbedInstance<IPlaybackControl> {
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
