import {Test} from '@nestjs/testing'
import {expect} from 'chai'
import dayjs from 'dayjs'
import {SinonStubbedInstance} from 'sinon'

import {Configuration} from '@src/domain'
import {Channel, ChannelFilter, NowPlaying, DigitallyImported, DigitallyImportedError} from '@src/infrastructure/di'

import {create_config_stub, create_logger_stub} from '@test/util'
import {load_nock_recording, RecordingName} from '@test/util/load_nock_recording'

describe('DigitallyImported', function () {
    let config_stub: SinonStubbedInstance<Configuration>
    let digitally_imported: DigitallyImported

    beforeEach(async function () {
        const logger_stub = create_logger_stub()
        logger_stub.child_for_service.returns(create_logger_stub())

        config_stub = create_config_stub({
            di_url: 'https://www.di.fm',
        })

        const module = await Test.createTestingModule({
            providers: [
                {
                    provide: 'ILogger',
                    useValue: logger_stub,
                },
                {
                    provide: 'configuration',
                    useValue: config_stub,
                },
                DigitallyImported,
            ],
        }).compile()

        digitally_imported = module.get(DigitallyImported)
    })

    it('should parse the "now playing" data', async function () {
        load_nock_recording(RecordingName.DI_CURRENTLY_PLAYING)
        const data = await digitally_imported.load_on_air()

        for (const now_playing of data) {
            expect(now_playing).to.be.an.instanceOf(NowPlaying)
        }
    })

    it('should parse the app data', async function () {
        load_nock_recording(RecordingName.DI_HOMEPAGE)
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
        load_nock_recording(RecordingName.DI_NO_SCRIPT_TAG)

        await expect(digitally_imported.load_app_data())
            .to.be.rejectedWith(DigitallyImportedError, 'Script tag not found')
    })

    it('should fail if the script tag does not call the interceptor', async function () {
        load_nock_recording(RecordingName.DI_NO_INTERCEPTOR_CALL)

        await expect(digitally_imported.load_app_data())
            .to.be.rejectedWith(DigitallyImportedError, 'Interceptor not called')
    })

    it('should fail if the interceptor does not return data', async function () {
        load_nock_recording(RecordingName.DI_EMPTY_INTERCEPTOR_CALL)

        await expect(digitally_imported.load_app_data())
            .to.be.rejectedWith(DigitallyImportedError, /Could not extract appdata/)
    })
})
