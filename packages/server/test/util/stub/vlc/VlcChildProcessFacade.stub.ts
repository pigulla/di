import {stub, SinonStubbedInstance} from 'sinon'

import {IVlcChildProcessFacade} from '@src/service/playback/'

export function create_vlc_child_process_facade_stub (): SinonStubbedInstance<IVlcChildProcessFacade> {
    return {
        hostname: 'test.local',
        port: 42,
        is_running: stub(),
        get_pid: stub(),
        start: stub(),
        stop: stub(),
    }
}
