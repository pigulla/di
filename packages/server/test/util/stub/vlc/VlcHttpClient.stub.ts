import sinon, {SinonStubbedInstance} from 'sinon'

import {IVlcHttpClient} from '~src/infrastructure/playback/'

const {stub} = sinon

export function stub_vlc_http_client(): SinonStubbedInstance<IVlcHttpClient> {
    return {
        get_current_channel_key: stub(),
        get_status: stub(),
        play: stub(),
        stop: stub(),
        adjust_volume_by: stub(),
        set_volume: stub(),
        get_volume: stub(),
        is_playing: stub(),
    }
}
