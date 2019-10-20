import sinon, {SinonStubbedInstance} from 'sinon'

import {IPlaybackControl} from '@server/service'

export function create_playback_control_stub (): SinonStubbedInstance<IPlaybackControl> {
    return {
        play: sinon.stub(),
        stop: sinon.stub(),
        get_channel_key: sinon.stub(),
        is_playing: sinon.stub(),
        get_meta_information: sinon.stub(),
    }
}
