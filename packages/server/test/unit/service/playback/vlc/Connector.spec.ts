import {EOL} from 'os'

import {SinonStubbedInstance} from 'sinon'
import {expect} from 'chai'

import {ChildProcessFacade, Connector} from '@server/service/playback/vlc'

import {create_child_process_facade_stub} from '../../../../util'
import {State} from '@server/service/playback/vlc/commands/Status'

describe('VLC Connector', function () {
    let child_process_facade_stub: SinonStubbedInstance<ChildProcessFacade>
    let vlc_connector: Connector

    function child_process_respond_on_start_with_lines (lines: string[]): void {
        child_process_facade_stub.start.callsFake(function (_prompt: string, _welcome_message: string) {
            return Promise.resolve(lines.join(EOL))
        })
    }

    function child_process_respond_on_start (
        overrides: {version?: string, prompt?: string, welcome_message?: string} = {},
    ): void {
        child_process_facade_stub.start.callsFake(function (prompt: string, welcome_message: string) {
            return Promise.resolve([
                `VLC media player ${overrides.version || '3.0.8'} Vetinari`,
                overrides.welcome_message || welcome_message,
                overrides.prompt || prompt,
            ].join(EOL))
        })
    }

    function child_process_respond_on_send (
        command: string,
        args: string = '',
        response: string|string[] = [],
    ): void {
        const reply = (Array.isArray(response) ? response : [response]).concat(Connector.prompt)

        child_process_facade_stub.send.withArgs(command, args).resolves(reply.join(EOL))
    }

    beforeEach(async function () {
        child_process_facade_stub = create_child_process_facade_stub()
        vlc_connector = new Connector(child_process_facade_stub)
    })

    it('should proxy the running state', async function () {
        child_process_facade_stub.is_running.returns(true)
        expect(vlc_connector.is_running()).to.be.true

        child_process_facade_stub.is_running.returns(false)
        expect(vlc_connector.is_running()).to.be.false
    })

    it('should not return the version before it is started', function () {
        expect(() => vlc_connector.get_vlc_version()).to.throw()
    })

    it('should not return the child process pid', function () {
        child_process_facade_stub.get_pid.returns(4711)

        expect(vlc_connector.get_vlc_pid()).to.equal(4711)
    })

    it('should not stop the child process if it is not running', async function () {
        child_process_facade_stub.is_running.returns(false)

        await vlc_connector.stop_instance()
        expect(child_process_facade_stub.stop).to.not.have.been.called
    })

    it('should stop the child process if it is running', async function () {
        child_process_facade_stub.is_running.returns(true)

        await vlc_connector.stop_instance()
        expect(child_process_facade_stub.stop).to.have.been.called.calledOnce
    })

    describe('when it receives a malformed response', function () {
        it('should fail if is too short', async function () {
            child_process_respond_on_start_with_lines(['VLC media player 3.0.8 Vetinari'])

            await expect(vlc_connector.start_instance(null)).to.be.rejectedWith('Unexpected response length')
        })

        it('should fail if the version string bad', async function () {
            child_process_respond_on_start({version: '3..8'})

            await expect(vlc_connector.start_instance(null)).to.be.rejectedWith('Unexpected version string')
        })

        it('should fail if the welcome message does not match', async function () {
            child_process_respond_on_start({welcome_message: 'unexpected'})

            await expect(vlc_connector.start_instance(null)).to.be.rejectedWith('Unexpected welcome message')
        })

        it('should fail if the prompt does not match', async function () {
            child_process_respond_on_start({prompt: 'unexpected'})

            await expect(vlc_connector.start_instance(null)).to.be.rejectedWith('Unexpected prompt')
        })
    })

    it('should not set the initial volume', async function () {
        child_process_respond_on_start()
        child_process_facade_stub.send.resolves([Connector.prompt].join(EOL))

        await vlc_connector.start_instance(1.0)
        expect(child_process_facade_stub.send).to.have.been.calledOnceWithExactly('volume', '256')
    })

    describe('when started', function () {
        beforeEach(async function () {
            child_process_respond_on_start()

            await vlc_connector.start_instance(null)
        })

        it('should set the initial volume', function () {
            expect(child_process_facade_stub.send).not.to.have.been.called
        })

        it('should report the version', function () {
            expect(child_process_facade_stub.start).to.have.been.calledOnce
            expect(vlc_connector.get_vlc_version()).to.equal('3.0.8')
        })

        it('should return the pid', function () {
            child_process_facade_stub.get_pid.returns(42)
            expect(vlc_connector.get_vlc_pid()).to.equal(42)
        })

        it('should shut down the child process when stopped', async function () {
            child_process_facade_stub.is_running.returns(true)
            await vlc_connector.stop_instance()

            expect(child_process_facade_stub.stop).to.have.been.calledOnce
        })
    })

    describe('when an command response is malformed', function () {
        beforeEach(function () {
            child_process_respond_on_start()
        })

        it('should handle an incomplete response', async function () {
            child_process_facade_stub.send
                .withArgs('is_playing', '')
                .resolves('')

            await expect(vlc_connector.is_playing()).to.eventually.be.rejectedWith('Response too short')
        })

        it('should handle an unexpected prompt', async function () {
            child_process_facade_stub.send
                .withArgs('is_playing', '')
                .resolves('$$$')

            await expect(vlc_connector.is_playing()).to.eventually.be.rejectedWith('Unexpected prompt')
        })

        it('should handle a reported error', async function () {
            child_process_facade_stub.send
                .withArgs('is_playing', '')
                .resolves(['Error', 'Unknown command', Connector.prompt].join(EOL))

            await expect(vlc_connector.is_playing()).to.eventually.be.rejectedWith('Unknown command')
        })
    })

    describe('should work when executing command', function () {
        beforeEach(function () {
            child_process_respond_on_start()
        })

        it('shutdown()', async function () {
            child_process_respond_on_send('shutdown')
            const result = await vlc_connector.shutdown()
            expect(result).to.be.undefined
        })

        it('add()', async function () {
            child_process_respond_on_send('add', 'http://www.di.fm.local/foo.mp3')
            const result = await vlc_connector.add('http://www.di.fm.local/foo.mp3')
            expect(result).to.be.undefined
        })

        it('is_playing()', async function () {
            child_process_respond_on_send('is_playing', '', '1')
            const result = await vlc_connector.is_playing()
            expect(result).to.be.true
        })

        it('get_title()', async function () {
            child_process_respond_on_send('status', '', [
                '( new input: http://prem2.di.fm:80/progressive?abcd1234efab5678 )',
                '( audio volume: 90 )',
                '( state playing )',
            ])
            const result = await vlc_connector.get_status()
            expect(result).to.deep.equal({
                new_input: 'http://prem2.di.fm:80/progressive?abcd1234efab5678',
                audio_volume: 90,
                state: State.PLAYING,
            })
        })

        it('play()', async function () {
            child_process_respond_on_send('play')
            const result = await vlc_connector.play()
            expect(result).to.be.undefined
        })

        it('get_volume()', async function () {
            child_process_respond_on_send('volume', '', '192')
            const result = await vlc_connector.get_volume()
            expect(result).to.be.closeTo(0.75, 0.01)
        })

        it('set_volume()', async function () {
            child_process_respond_on_send('volume', '192')
            const result = await vlc_connector.set_volume(0.75)
            expect(result).to.be.undefined
        })

        it('stop()', async function () {
            child_process_respond_on_send('stop')
            const result = await vlc_connector.stop()
            expect(result).to.be.undefined
        })
    })
})
