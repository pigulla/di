import dayjs from 'dayjs'
import {SinonStubbedInstance} from 'sinon'
import {Test} from '@nestjs/testing'
import {expect} from 'chai'

import {IConfigProvider, DigitallyImported} from '@server/service'
import {Channel, ChannelFilter, NowPlaying} from '@server/service/di'

import {
    create_logger_stub,
    create_config_provider_stub,
} from '../../util'
import {load_nock_recording} from '../../util/load_nock_recording'

describe('DigitallyImported service', function () {
    let config_provider: SinonStubbedInstance<IConfigProvider>
    let digitally_imported: DigitallyImported

    beforeEach(async function () {
        config_provider = create_config_provider_stub({
            di_url: 'https://www.di.fm',
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
                DigitallyImported,
            ],
        }).compile()

        digitally_imported = module.get(DigitallyImported)
    })

    it('should parse the "now playing" data', async function () {
        load_nock_recording('currently-playing')
        const data = await digitally_imported.load_now_playing()

        for (const now_playing of data) {
            expect(now_playing).to.be.an.instanceOf(NowPlaying)
        }
    })

    it('should parse the "app" data', async function () {
        load_nock_recording('homepage')
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
})
