import {EOL} from 'os'

import {SinonStubbedInstance} from 'sinon'
import {expect} from 'chai'

import {ChildProcessFacade, Connector} from '@server/service/playback/vlc'

import {create_child_process_facade_stub} from '../../../../util'

describe('VLC Connector', function () {
    let child_process_facade_stub: SinonStubbedInstance<ChildProcessFacade>
    let vlc_connector: Connector

    function child_process_respond_with_lines (lines: string[]): void {
        child_process_facade_stub.start.callsFake(function (_prompt: string, _welcome_message: string) {
            return Promise.resolve(lines.join(EOL))
        })
    }

    function child_process_respond (
        overrides: { version?: string, prompt?: string, welcome_message?: string } = {}
    ): void {
        child_process_facade_stub.start.callsFake(function (prompt: string, welcome_message: string) {
            return Promise.resolve([
                `VLC media player ${overrides.version || '3.0.8'} Vetinari`,
                overrides.welcome_message || welcome_message,
                overrides.prompt || prompt,
            ].join(EOL))
        })
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

    describe('when it receives a malformed response', function () {
        it('should fail if is too short', async function () {
            child_process_respond_with_lines(['VLC media player 3.0.8 Vetinari'])

            await expect(vlc_connector.start_instance(null)).to.be.rejectedWith('Unexpected response length')
        })

        it('should fail if the version string bad', async function () {
            child_process_respond({version: '3..8'})

            await expect(vlc_connector.start_instance(null)).to.be.rejectedWith('Unexpected version string')
        })

        it('should fail if the welcome message does not match', async function () {
            child_process_respond({welcome_message: 'unexpected'})

            await expect(vlc_connector.start_instance(null)).to.be.rejectedWith('Unexpected welcome message')
        })

        it('should fail if the prompt does not match', async function () {
            child_process_respond({prompt: 'unexpected'})

            await expect(vlc_connector.start_instance(null)).to.be.rejectedWith('Unexpected prompt')
        })
    })

    it('should not set the initial volume', async function () {
        child_process_respond()
        child_process_facade_stub.send.resolves([Connector.prompt].join(EOL))

        await vlc_connector.start_instance(1.0)
        expect(child_process_facade_stub.send).to.have.been.calledOnceWithExactly('volume', '256')
    })

    describe('when started', function () {
        beforeEach(async function () {
            child_process_respond()

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
})
