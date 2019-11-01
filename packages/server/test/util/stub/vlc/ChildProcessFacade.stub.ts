import sinon, {SinonStubbedInstance} from 'sinon'

import {IChildProcessFacade} from '@server/service/playback/vlc'

export function create_child_process_facade_stub (): SinonStubbedInstance<IChildProcessFacade> {
    return {
        is_running: sinon.stub(),
        get_pid: sinon.stub(),
        start: sinon.stub(),
        stop: sinon.stub(),
        send: sinon.stub(),
    }
}
