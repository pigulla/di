import sinon, {SinonStubbedInstance} from 'sinon'

import {IVlcControl} from '../../../src/service'

export function create_vlc_control_stub (): SinonStubbedInstance<IVlcControl> {
    return {
        get_vlc_version: sinon.stub(),
        get_vlc_pid: sinon.stub(),
        is_running: sinon.stub(),
        start_instance: sinon.stub(),
        stop_instance: sinon.stub(),
        get_time: sinon.stub(),
        get_title: sinon.stub(),
        status: sinon.stub(),
        is_playing: sinon.stub(),
        help: sinon.stub(),
        shutdown: sinon.stub(),
        add: sinon.stub(),
        play: sinon.stub(),
        info: sinon.stub(),
        get_volume: sinon.stub(),
        set_volume: sinon.stub(),
        get_vars: sinon.stub(),
        stop: sinon.stub(),
    }
}
