import dayjs from 'dayjs'
import {SinonStubbedInstance} from 'sinon'
import {Test} from '@nestjs/testing'
import {expect} from 'chai'

import {IConfigProvider, DigitallyImported} from '@server/service'
import {Channel, ChannelFilter, NowPlaying} from '@server/service/di'

import {
    create_logger_stub,
    create_config_provider_stub,
    create_polly,
} from '../../util'
import {Polly} from '@pollyjs/core'

describe('DigitallyImported service', function () {
    let polly: Polly
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

    afterEach(async function () {
        if (polly) {
            await polly.stop()
        }
    })

    it('should parse the "now playing" data', async function () {
        polly = create_polly('di-homepage')

        polly.server.get('https://www.di.fm')

        const data = await digitally_imported.load_now_playing()

        for (const now_playing of data) {
            expect(now_playing).to.be.an.instanceOf(NowPlaying)
        }
    })

    it('should parse the "app" data', async function () {
        polly = create_polly('di-now-playing')

        polly.server.get('https://www.di.fm/_papi/v1/di/currently_playing')

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
