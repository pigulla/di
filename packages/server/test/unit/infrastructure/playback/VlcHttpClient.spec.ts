import 'chai-as-promised'
import {Test} from '@nestjs/testing'
import {expect} from 'chai'
import {SinonStubbedInstance} from 'sinon'

import {ILogger} from '~src/domain'
import {
    PlaybackState,
    Status,
    VlcHttpClient,
    VlcHttpConnection,
} from '~src/infrastructure/playback/'

import {stub_logger, prebuilt_channel} from '~test/util'
import {load_nock_recording, RecordingName} from '~test/util/load_nock_recording'

const {progressive} = prebuilt_channel

describe('VlcHttpClient', function () {
    const vlc_http_connection: VlcHttpConnection = {
        hostname: 'vlc.local',
        port: 80,
        password: '53cr37',
    }

    let vlc_http_client: VlcHttpClient
    let child_logger_stub: SinonStubbedInstance<ILogger>

    beforeEach(async function () {
        const logger_stub = stub_logger()
        child_logger_stub = stub_logger()
        logger_stub.child_for_service.returns(child_logger_stub)

        const module = await Test.createTestingModule({
            providers: [
                {
                    provide: 'ILogger',
                    useValue: logger_stub,
                },
                {
                    provide: 'vlc_http_connection',
                    useValue: vlc_http_connection,
                },
                VlcHttpClient,
            ],
        }).compile()

        vlc_http_client = module.get(VlcHttpClient)
    })

    describe('when a channel is playing', function () {
        it('should return the status', async function () {
            load_nock_recording(RecordingName.VLC_STATUS)

            const expected_status: Status = {
                volume: 166,
                apiversion: 3,
                state: PlaybackState.PLAYING,
                version: '3.0.8 Vetinari',
                meta: {
                    filename: 'progressive?d34db33fd34db33f',
                    genre: 'Progressive',
                    title: 'Progressive - DI.FM Premium',
                },
            }

            await expect(vlc_http_client.get_status()).to.eventually.deep.equal(expected_status)
        })

        it('should return the volume', async function () {
            load_nock_recording(RecordingName.VLC_STATUS)

            await expect(vlc_http_client.get_volume()).to.eventually.be.closeTo(0.65, 0.01)
        })

        it('should return the playback state', async function () {
            load_nock_recording(RecordingName.VLC_STATUS)

            await expect(vlc_http_client.is_playing()).to.eventually.be.true
        })

        it('should return the current channel key', async function () {
            load_nock_recording(RecordingName.VLC_PLAYLIST)

            await expect(vlc_http_client.get_current_channel_key()).to.eventually.equal(
                progressive.key
            )
        })
    })

    describe('when nothing is playing', function () {
        it('should return the status', async function () {
            load_nock_recording(RecordingName.VLC_STATUS_NOT_PLAYING)

            const expected_status: Status = {
                volume: 0,
                apiversion: 3,
                state: PlaybackState.STOPPED,
                version: '3.0.8 Vetinari',
                meta: null,
            }

            await expect(vlc_http_client.get_status()).to.eventually.deep.equal(expected_status)
        })

        it('should return the volume', async function () {
            load_nock_recording(RecordingName.VLC_STATUS_NOT_PLAYING)

            await expect(vlc_http_client.get_volume()).to.eventually.be.closeTo(0, 0.01)
        })

        it('should return the playback state', async function () {
            load_nock_recording(RecordingName.VLC_STATUS_NOT_PLAYING)

            await expect(vlc_http_client.is_playing()).to.eventually.be.false
        })

        it('should return the current channel key', async function () {
            load_nock_recording(RecordingName.VLC_PLAYLIST_NOT_PLAYING)

            await expect(vlc_http_client.get_current_channel_key()).to.eventually.be.null
        })
    })
})
