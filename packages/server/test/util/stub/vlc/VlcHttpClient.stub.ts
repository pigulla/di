import {stub, SinonStubbedInstance} from 'sinon'

import {IVlcHttpClient} from '@server/service/playback/vlc'

export function create_vlc_http_client_stub (): SinonStubbedInstance<IVlcHttpClient> {
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
