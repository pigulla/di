import {EventEmitter} from 'events'

import {expect} from 'chai'
import {SinonStub, stub} from 'sinon'

import {ChildProcessFacade, ChildProcessFacadeError} from '@server/service/playback/vlc'

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

function create_stream_mock (): StreamMock {
    const mock = {
        read: stub(),
        write: stub(),
    }

    return Object.assign(new EventEmitter(), mock)
}

function create_child_process_mock (): ChildProcessMock {
    const mock = {
        kill: stub(),
        stdin: create_stream_mock(),
        stdout: create_stream_mock(),
        stderr: create_stream_mock(),
    }

    return Object.assign(new EventEmitter(), mock)
}

describe('The ChildProcessFacade', function () {
    const path = '/usr/local/bin/foobar'
    const timeout_ms = 2_500

    let spawn_fn: SinonStub
    let child_process_facade: ChildProcessFacade

    beforeEach(function () {
        spawn_fn = stub()
        child_process_facade = new ChildProcessFacade(path, timeout_ms, spawn_fn)
    })

    describe('when it has not been started yet', function () {
        it('should not be running', function () {
            expect(child_process_facade.is_running()).to.be.false
        })

        it('should not have a pid', function () {
            expect(() => child_process_facade.get_pid()).to.throw(ChildProcessFacadeError)
        })

        it('should not be stoppable', async function () {
            await expect(child_process_facade.stop()).to.eventually.be.rejectedWith(ChildProcessFacadeError)
        })

        it('should not accept commands', async function () {
            await expect(child_process_facade.send('foo')).to.eventually.be.rejectedWith(ChildProcessFacadeError)
        })
    })

    describe('when started', function () {
        const prompt = '$$$'
        const welcome_message = 'Howdy, Partner!'
        let child_process: ChildProcessMock

        beforeEach(function () {
            child_process = create_child_process_mock()
            spawn_fn.returns(child_process)
        })

        it('should return the output', async function () {
            const start_promise = child_process_facade.start(prompt, welcome_message)

            child_process.stdout.emit('data', 'Foobar')

            const result = await start_promise

            expect(spawn_fn).to.have.been.calledOnce
            expect(result).to.equal('Foobar')
            expect(child_process_facade.is_running()).to.be.true
        })

        it('should not start again', async function () {
            const start_promise = child_process_facade.start(prompt, welcome_message)

            child_process.stdout.emit('data', 'Foobar')
            child_process.kill.callsFake(() => child_process.emit('close'))

            await start_promise
            await expect(child_process_facade.start(prompt, welcome_message))
                .to.eventually.be.rejectedWith(ChildProcessFacadeError)
        })

        it('should process commands', async function () {
            const start_promise = child_process_facade.start(prompt, welcome_message)

            child_process.stdout.emit('data', 'Foobar')
            await start_promise

            child_process.stdin.write.callsFake(() => child_process.stdout.emit('data', 'Pong!'))
            await expect(child_process_facade.send('Ping', '?'))
                .to.eventually.equal('Pong!')
        })

        it('should fail if an error occurred', async function () {
            const start_promise = child_process_facade.start(prompt, welcome_message)

            child_process.kill.callsFake(() => child_process.emit('exit'))
            child_process.stdout.emit('error', 'b0rked')

            await expect(start_promise).to.eventually.be.rejectedWith(ChildProcessFacadeError)
        })

        it('should be stoppable', async function () {
            const start_promise = child_process_facade.start(prompt, welcome_message)

            child_process.stdout.emit('data', 'Foobar')
            child_process.kill.callsFake(() => child_process.emit('close'))

            await start_promise
            await child_process_facade.stop()

            expect(child_process.stdin)
            expect(child_process_facade.is_running()).to.be.false
        })
    })
})
