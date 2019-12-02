import {SinonStubbedInstance} from 'sinon'
import {Test} from '@nestjs/testing'
import {expect} from 'chai'

import {ILogger} from '@server/service/logger'
import {VlcHttpConnection, VlcHttpClient, PlaybackState} from '@server/service/playback/vlc'

import {create_logger_stub} from '../../../../util'
import {load_nock_recording, RecordingName} from '../../../../util/load_nock_recording'

describe('VlcHttpClient service', function () {
    const vlc_http_connection: VlcHttpConnection = {
        hostname: 'vlc.local',
        port: 80,
        password: '53cr37',
    }

    let vlc_http_client: VlcHttpClient
    let child_logger: SinonStubbedInstance<ILogger>

    beforeEach(async function () {
        const logger = create_logger_stub()
        child_logger = create_logger_stub()
        logger.child_for_service.returns(child_logger)

        const module = await Test.createTestingModule({
            providers: [
                {
                    provide: 'ILogger',
                    useValue: logger,
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

    it('should return things', async function () {
        load_nock_recording(RecordingName.VLC_STATUS)

        await expect(vlc_http_client.get_status()).to.eventually.deep.equal({
            volume: 166,
            apiversion: 3,
            state: PlaybackState.PLAYING,
            version: '3.0.8 Vetinari',
            meta: {
                filename: 'progressive?d34db33fd34db33f',
                genre: 'Progressive',
                title: 'Progressive - DI.FM Premium',
                now_playing: 'JFR - Where Is My God (Original Mix)',
            },
            stream: {
                bits_per_sample: 32,
                codec: 'MPEG AAC Audio (mp4a)',
                sample_rate: '44100 Hz',
                channels: 'Stereo',
            },
        })
    })
})
