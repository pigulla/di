import {EOL} from 'os'

import {SinonStubbedInstance} from 'sinon'
import {Test} from '@nestjs/testing'
import {expect} from 'chai'

import {IConfigProvider, VlcControl} from '@server/service'
import {ChildProcessFacade} from '@server/service/vlc'

import {
    create_child_process_facade_stub,
    create_logger_stub,
    create_config_provider_stub,
} from '../../util'

describe('VlcControl service', function () {
    let config_provider: IConfigProvider
    let child_process_facade_stub: SinonStubbedInstance<ChildProcessFacade>
    let vlc_control: VlcControl

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
        config_provider = create_config_provider_stub({
            vlc_initial_volume: null,
        })

        const module = await Test.createTestingModule({
            providers: [
                {
                    provide: 'ILogger',
                    useValue: create_logger_stub(),
                },
                {
                    provide: 'IConfigProvider',
                    useValue: config_provider,
                },
                {
                    provide: 'IChildProcessFacade',
                    useValue: child_process_facade_stub,
                },
                {
                    provide: 'VlcControl',
                    useClass: VlcControl,
                },
            ],
        }).compile()

        vlc_control = module.get(VlcControl)
    })

    it('should proxy the running state', async function () {
        child_process_facade_stub.is_running.returns(true)
        expect(vlc_control.is_running()).to.be.true

        child_process_facade_stub.is_running.returns(false)
        expect(vlc_control.is_running()).to.be.false
    })

    describe('when it receives a malformed response', function () {
        it('should fail if is too short', async function () {
            child_process_respond_with_lines(['VLC media player 3.0.8 Vetinari'])

            await expect(vlc_control.start_instance()).to.be.rejectedWith('Unexpected response length')
        })

        it('should fail if the version string bad', async function () {
            child_process_respond({version: '3..8'})

            await expect(vlc_control.start_instance()).to.be.rejectedWith('Unexpected version string')
        })

        it('should fail if the welcome message does not match', async function () {
            child_process_respond({welcome_message: 'unexpected'})

            await expect(vlc_control.start_instance()).to.be.rejectedWith('Unexpected welcome message')
        })

        it('should fail if the prompt does not match', async function () {
            child_process_respond({prompt: 'unexpected'})

            await expect(vlc_control.start_instance()).to.be.rejectedWith('Unexpected prompt')
        })
    })

    describe('when started', function () {
        beforeEach(async function () {
            child_process_respond()

            await vlc_control.start_instance()
        })

        it('should report the version', function () {
            expect(child_process_facade_stub.start).to.have.been.calledOnce
            expect(vlc_control.get_vlc_version()).to.equal('3.0.8')
        })

        it('should return the pid', function () {
            child_process_facade_stub.get_pid.returns(42)
            expect(vlc_control.get_vlc_pid()).to.equal(42)
        })

        it('should shut down the child process when stopped', async function () {
            await vlc_control.stop_instance()

            expect(child_process_facade_stub.stop).to.have.been.calledOnce
        })
    })
})
