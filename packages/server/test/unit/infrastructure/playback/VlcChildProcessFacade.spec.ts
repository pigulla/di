import {EventEmitter} from 'events'

import {expect} from 'chai'
import sinon, {SinonStub} from 'sinon'

import {
    VlcChildProcessFacade,
    ChildProcessFacadeError,
    VlcHttpConnection,
} from '~src/infrastructure/playback'

import {stub_logger} from '~test/util'

interface StreamMock extends EventEmitter {
    read: SinonStub
    write: SinonStub
}

interface ChildProcessMock extends EventEmitter {
    kill: SinonStub
    stdin: StreamMock
    stdout: StreamMock
    stderr: StreamMock
}

const {stub} = sinon

function create_stream_mock(): StreamMock {
    const mock = {
        read: stub(),
        write: stub(),
    }

    return Object.assign(new EventEmitter(), mock)
}

function create_child_process_mock(): ChildProcessMock {
    const mock = {
        kill: stub(),
        stdin: create_stream_mock(),
        stdout: create_stream_mock(),
        stderr: create_stream_mock(),
    }

    return Object.assign(new EventEmitter(), mock)
}

describe('The VlcChildProcessFacade', function () {
    const path = '/usr/local/bin/foobar'
    const timeout_ms = 2_500
    const vlc_http_connection: VlcHttpConnection = {
        hostname: 'test.local',
        port: 4242,
        password: '53cr37',
    }

    let spawn_fn: SinonStub
    let wait_for_http_port_stub: SinonStub
    let child_process_facade: VlcChildProcessFacade

    beforeEach(function () {
        const logger_stub = stub_logger()
        logger_stub.child_for_service.returns(stub_logger())

        spawn_fn = stub()
        wait_for_http_port_stub = stub()
        child_process_facade = new VlcChildProcessFacade(
            path,
            timeout_ms,
            spawn_fn,
            vlc_http_connection,
            wait_for_http_port_stub,
            logger_stub
        )
    })

    describe('when it has not been started yet', function () {
        it('should not be running', function () {
            expect(child_process_facade.is_running()).to.be.false
        })

        it('should not have a pid', function () {
            expect(() => child_process_facade.get_pid()).to.throw(ChildProcessFacadeError)
        })

        it('should not be stoppable', async function () {
            await expect(child_process_facade.stop()).to.be.rejectedWith(ChildProcessFacadeError)
        })
    })

    describe('when started', function () {
        let child_process: ChildProcessMock

        beforeEach(function () {
            child_process = create_child_process_mock()
            spawn_fn.returns(child_process)
            wait_for_http_port_stub.resolves(true)
        })

        it('should spawn the child process', async function () {
            const start_promise = child_process_facade.start()
            expect(spawn_fn).to.have.been.calledOnceWith(path)

            child_process.stdout.emit('data', 'Foobar')
            await start_promise

            expect(spawn_fn).to.have.been.calledOnce
            expect(child_process_facade.is_running()).to.be.true
        })

        it('should not start again', async function () {
            const start_promise = child_process_facade.start()

            child_process.stdout.emit('data', 'Foobar')
            child_process.kill.callsFake(() => child_process.emit('close'))

            await start_promise
            await expect(child_process_facade.start()).to.be.rejectedWith(ChildProcessFacadeError)
        })

        it('should fail if the http server is not started', async function () {
            wait_for_http_port_stub.resolves(false)

            const start_promise = child_process_facade.start()
            expect(spawn_fn).to.have.been.calledOnceWith(path)

            child_process.stdout.emit('data', 'Foobar')
            await expect(start_promise).to.be.rejectedWith(
                ChildProcessFacadeError,
                'Timeout while waiting for http server'
            )
        })

        it('should fail if an error occurred', async function () {
            const start_promise = child_process_facade.start()

            child_process.kill.callsFake(() => child_process.emit('exit'))
            child_process.stdout.emit('error', 'b0rked')

            await expect(start_promise).to.be.rejectedWith(ChildProcessFacadeError)
        })

        it('should be stoppable', async function () {
            const start_promise = child_process_facade.start()

            child_process.stdout.emit('data', 'Foobar')
            child_process.kill.callsFake(() => child_process.emit('close'))

            await start_promise
            await child_process_facade.stop()

            expect(child_process.stdin)
            expect(child_process_facade.is_running()).to.be.false
        })
    })
})
