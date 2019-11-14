import dayjs from 'dayjs'
import {SinonStubbedInstance} from 'sinon'
import {Test} from '@nestjs/testing'
import {expect} from 'chai'

import {DigitallyImported, IConfigProvider, DigitallyImportedError} from '@server/service'
import {Channel, ChannelFilter, NowPlaying} from '@server/service/di'

import {create_config_provider_stub, create_logger_stub} from '../../util'
import {load_nock_recording, RecordingName} from '../../util/load_nock_recording'

describe('DigitallyImported service', function () {
    let config_provider: SinonStubbedInstance<IConfigProvider>
    let digitally_imported: DigitallyImported

    beforeEach(async function () {
        const logger = create_logger_stub()
        logger.child_for_service.returns(create_logger_stub())

        config_provider = create_config_provider_stub({
            di_url: 'https://www.di.fm',
        })

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
                DigitallyImported,
            ],
        }).compile()

        digitally_imported = module.get(DigitallyImported)
    })

    it('should parse the "now playing" data', async function () {
        load_nock_recording(RecordingName.CURRENTLY_PLAYING)
        const data = await digitally_imported.load_now_playing()

        for (const now_playing of data) {
            expect(now_playing).to.be.an.instanceOf(NowPlaying)
        }
    })

    it('should parse the app data', async function () {
        load_nock_recording(RecordingName.HOMEPAGE)
        const app_data = await digitally_imported.load_app_data()

        expect(app_data.app_version).to.be.a('string')
        expect(app_data.app_deploy_time).to.be.an.instanceOf(dayjs)

        for (const channel of app_data.channels) {
            expect(channel).to.be.an.instanceOf(Channel)
        }

        for (const channel_filter of app_data.channel_filters) {
            expect(channel_filter).to.be.an.instanceOf(ChannelFilter)
        }
    })

    it('should fail if there is no script tag', async function () {
        load_nock_recording(RecordingName.NO_SCRIPT_TAG)

        await expect(digitally_imported.load_app_data())
            .to.eventually.be.rejectedWith(DigitallyImportedError, 'Script tag not found')
    })

    it('should fail if the script tag does not call the interceptor', async function () {
        load_nock_recording(RecordingName.NO_INTERCEPTOR_CALL)

        await expect(digitally_imported.load_app_data())
            .to.eventually.be.rejectedWith(DigitallyImportedError, 'Interceptor not called')
    })

    it('should fail if the interceptor does not return data', async function () {
        load_nock_recording(RecordingName.EMPTY_INTERCEPTOR_CALL)

        await expect(digitally_imported.load_app_data())
            .to.eventually.be.rejectedWith(DigitallyImportedError, /Could not extract appdata/)
    })
})
