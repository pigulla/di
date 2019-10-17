import {EOL} from 'os'

import {SinonStubbedInstance} from 'sinon'
import {Test} from '@nestjs/testing'
import {expect} from 'chai'

import {IConfigProvider, VlcControl} from '../../../src/service'
import {create_child_process_facade_stub, create_logger_stub, create_config_provider_stub} from '../../util'
import {ChildProcessFacade} from '../../../src/service/vlc'

describe('VlcControl service', function () {
    let config_provider: IConfigProvider
    let child_process_facade_stub: SinonStubbedInstance<ChildProcessFacade>
    let vlc_control: VlcControl

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

    describe('when started', function () {
        beforeEach(async function () {
            child_process_facade_stub.start.callsFake(function (prompt: string, welcome_message: string) {
                return Promise.resolve([
                    'VLC media player 3.0.8 Vetinari',
                    welcome_message,
                    prompt,
                ].join(EOL))
            })

            await expect(vlc_control.start_instance())
            expect(child_process_facade_stub.start).to.have.been.calledOnce
        })

        it('should report the version', async function () {
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
