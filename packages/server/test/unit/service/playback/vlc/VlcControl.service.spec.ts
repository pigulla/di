import {spawn} from 'child_process'

import {SinonStub, SinonStubbedInstance, stub} from 'sinon'
import {Test} from '@nestjs/testing'
import {expect} from 'chai'

import {IConfigProvider, ILogger} from '@server/service'
import {IChildProcessFacade, IConnector, VlcControl} from '@server/service/playback/vlc'
import {State} from '@server/service/playback/vlc/commands/Status'

import {
    create_logger_stub,
    create_config_provider_stub,
    create_child_process_facade_stub,
    create_connector_stub,
} from '../../../../util'

describe('VlcControl service', function () {
    let vlc_control: VlcControl
    let child_logger: SinonStubbedInstance<ILogger>
    let config_provider: SinonStubbedInstance<IConfigProvider>
    let child_process_facade_stub: SinonStubbedInstance<IChildProcessFacade>
    let connector_stub: SinonStubbedInstance<IConnector>
    let child_process_facade_ctor: SinonStub
    let connector_ctor: SinonStub

    beforeEach(async function () {
        const logger = create_logger_stub()
        child_logger = create_logger_stub()
        logger.child_for_service.returns(child_logger)

        child_process_facade_ctor = stub()
        connector_ctor = stub()

        config_provider = create_config_provider_stub({
            vlc_initial_volume: 0.75,
            vlc_path: '/usr/bin/vlc',
            vlc_timeout: 5000,
        })

        child_process_facade_stub = create_child_process_facade_stub()
        connector_stub = create_connector_stub()
        child_process_facade_ctor.onFirstCall().returns(child_process_facade_stub)
        connector_ctor.onFirstCall().returns(connector_stub)

        const module = await Test.createTestingModule({
            providers: [
                {
                    provide: 'ILogger',
                    useValue: logger,
                },
                {
                    provide: 'IConfigProvider',
                    useValue: config_provider,
                },
                {
                    provide: 'ChildProcessFacadeCtor',
                    useValue: child_process_facade_ctor,
                },
                {
                    provide: 'ConnectorCtor',
                    useValue: connector_ctor,
                },
                VlcControl,
            ],
        }).compile()

        vlc_control = module.get(VlcControl)
    })

    it('should use the injected constructors', function () {
        expect(child_process_facade_ctor).to.have.been.calledOnceWithExactly('/usr/bin/vlc', 5000, spawn)
        expect(child_process_facade_ctor).to.have.been.calledWithNew
        expect(connector_ctor).to.have.been.calledOnceWithExactly(child_process_facade_stub, child_logger)
        expect(connector_ctor).to.have.been.calledWithNew
    })

    it('should start the connector on module init', async function () {
        await vlc_control.onModuleInit()

        expect(connector_stub.start_instance).to.have.been.calledOnceWithExactly(0.75)
    })

    it('should stop the connector on application shutdown', async function () {
        await vlc_control.onApplicationShutdown('SIGINT')

        expect(connector_stub.stop_instance).to.have.been.calledOnceWithExactly()
    })

    it('should return the meta information', async function () {
        connector_stub.get_vlc_pid.returns(1234)
        connector_stub.get_vlc_version.returns('47.11')

        await expect(vlc_control.get_meta_information()).to.eventually.deep.equal({
            pid: 1234,
            version: '47.11',
        })
    })

    it('should return the status', async function () {
        connector_stub.get_status.resolves({
            state: State.PLAYING,
            new_input: 'http://prem2.di.fm:80/progressive?abcd1234efab5678',
            audio_volume: 44,
        })

        await expect(vlc_control.get_current_channel_key()).to.eventually.equal('progressive')
    })

    it('should play an url', async function () {
        await vlc_control.play('test.local')

        expect(connector_stub.add).to.have.been.calledOnceWithExactly('test.local')
    })

    it('should stop the instance', async function () {
        await vlc_control.stop()

        expect(connector_stub.stop).to.have.been.calledOnceWithExactly()
    })

    it('should return whether it is currently playing', async function () {
        connector_stub.is_playing.resolves(true)

        await expect(vlc_control.is_playing()).to.eventually.equal(true)
    })

    it('should get the volume', async function () {
        connector_stub.get_volume.resolves(42)

        await expect(vlc_control.get_volume()).to.eventually.equal(42)
    })

    it('should set the volume', async function () {
        connector_stub.set_volume.resolves(undefined)

        await expect(vlc_control.set_volume(42)).to.eventually.be.undefined
        expect(connector_stub.set_volume).to.have.been.called.calledOnceWithExactly(42)
    })
})
