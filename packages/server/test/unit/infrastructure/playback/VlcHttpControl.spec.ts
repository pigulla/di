import {Test} from '@nestjs/testing'
import {expect} from 'chai'
import {SinonStubbedInstance} from 'sinon'

import {ILogger} from '~src/domain'
import {
    IVlcChildProcessFacade,
    IVlcHttpClient,
    PlaybackState,
    VlcHttpControl,
} from '~src/infrastructure/playback/'

import {stub_logger, stub_vlc_child_process_facade, stub_vlc_http_client} from '../../../util'

describe('VlcHttpControl', function () {
    let vlc_http_control: VlcHttpControl
    let child_logger_stub: SinonStubbedInstance<ILogger>
    let vlc_child_process_facade_stub: SinonStubbedInstance<IVlcChildProcessFacade>
    let vlc_http_client_stub: SinonStubbedInstance<IVlcHttpClient>

    beforeEach(async function () {
        const logger_stub = stub_logger()
        child_logger_stub = stub_logger()
        logger_stub.child_for_service.returns(child_logger_stub)

        vlc_child_process_facade_stub = stub_vlc_child_process_facade()
        vlc_http_client_stub = stub_vlc_http_client()

        const module = await Test.createTestingModule({
            providers: [
                {
                    provide: 'ILogger',
                    useValue: logger_stub,
                },
                {
                    provide: 'IVlcHttpClient',
                    useValue: vlc_http_client_stub,
                },
                {
                    provide: 'vlc_child_process',
                    useValue: vlc_child_process_facade_stub,
                },
                VlcHttpControl,
            ],
        }).compile()

        vlc_http_control = module.get(VlcHttpControl)
    })

    it('should start the child process on module init', async function () {
        await vlc_http_control.onModuleInit()

        expect(vlc_child_process_facade_stub.start).to.have.been.calledOnce
    })

    it('should stop the child process on application shutdown', async function () {
        await vlc_http_control.onApplicationShutdown('SIGINT')

        expect(vlc_child_process_facade_stub.stop).to.have.been.calledOnce
    })

    it('should return the child process pid', async function () {
        vlc_child_process_facade_stub.get_pid.returns(1234)

        expect(vlc_http_control.get_pid()).to.equal(1234)
    })

    it('should return the playback backend information', async function () {
        vlc_http_client_stub.get_status.resolves({
            volume: 42,
            apiversion: 3,
            state: PlaybackState.PLAYING,
            version: 'foo',
            meta: null,
        })

        await expect(vlc_http_control.get_playback_backend_information()).to.eventually.deep.equal({
            version: 'foo',
        })
    })

    it('should play an url', async function () {
        await vlc_http_control.play('test.local')

        expect(vlc_http_client_stub.play).to.have.been.calledOnceWithExactly('test.local')
    })

    it('should stop the instance', async function () {
        await vlc_http_control.stop()

        expect(vlc_http_client_stub.stop).to.have.been.calledOnceWithExactly()
    })

    it('should return whether it is currently playing', async function () {
        vlc_http_client_stub.is_playing.resolves(true)

        await expect(vlc_http_control.is_playing()).to.eventually.equal(true)
    })

    it('should get the volume', async function () {
        vlc_http_client_stub.get_volume.resolves(42)

        await expect(vlc_http_control.get_volume()).to.eventually.equal(42)
    })

    it('should set the volume', async function () {
        vlc_http_client_stub.set_volume.resolves(undefined)

        await expect(vlc_http_control.set_volume(42)).to.eventually.be.undefined
        expect(vlc_http_client_stub.set_volume).to.have.been.called.calledOnceWithExactly(42)
    })
})
