import sinon, {SinonStubbedInstance} from 'sinon'

import {IVlcChildProcessFacade} from '~src/infrastructure/playback/'

const {stub} = sinon

export function stub_vlc_child_process_facade(): SinonStubbedInstance<IVlcChildProcessFacade> {
    return {
        hostname: 'test.local',
        port: 42,
        is_running: stub(),
        get_pid: stub(),
        start: stub(),
        stop: stub(),
    }
}
