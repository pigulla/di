import sinon, {SinonStubbedInstance} from 'sinon'

import {VlcControl} from '@server/service/playback/vlc'

export function create_vlc_control_stub (): SinonStubbedInstance<VlcControl> {
    return {
        onModuleInit: sinon.stub(),
        onApplicationShutdown: sinon.stub(),
        get_meta_information: sinon.stub(),
        get_channel_key: sinon.stub(),
        play: sinon.stub(),
        stop: sinon.stub(),
        is_playing: sinon.stub(),
    }
}
