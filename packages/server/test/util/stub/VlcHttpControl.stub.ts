import sinon, {SinonStubbedInstance} from 'sinon'

import {VlcHttpControl} from '~src/infrastructure/playback/'

const {stub} = sinon

export function stub_vlc_http_control(): SinonStubbedInstance<VlcHttpControl> {
    return {
        onModuleInit: stub(),
        onApplicationShutdown: stub(),
        get_pid: stub(),
        get_playback_backend_information: stub(),
        get_current_channel_key: stub(),
        play: stub(),
        stop: stub(),
        is_playing: stub(),
        set_volume: stub(),
        get_volume: stub(),
    }
}
