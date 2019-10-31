import sinon, {SinonStubbedInstance} from 'sinon'

import {IConnector} from '@server/service/playback/vlc'

export function create_connector_stub (): SinonStubbedInstance<IConnector> {
    return {
        add: sinon.stub(),
        get_title: sinon.stub(),
        get_vlc_pid: sinon.stub(),
        get_vlc_version: sinon.stub(),
        get_volume: sinon.stub(),
        is_playing: sinon.stub(),
        is_running: sinon.stub(),
        play: sinon.stub(),
        set_volume: sinon.stub(),
        shutdown: sinon.stub(),
        start_instance: sinon.stub(),
        stop: sinon.stub(),
        stop_instance: sinon.stub(),
    }
}
