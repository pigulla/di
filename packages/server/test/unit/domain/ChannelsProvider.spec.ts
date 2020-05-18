import {Test} from '@nestjs/testing'
import {expect} from 'chai'
import sinon, {SinonStubbedInstance} from 'sinon'

import {ChannelsProvider, IAppDataProvider} from '~src/domain'
import {AppData} from '~src/domain/di'

import {
    stub_logger,
    stub_app_data_provider,
    AppDataBuilder,
    ChannelBuilder,
    prebuilt_channel,
    prebuilt_channel_filter,
} from '../../util'

const {match} = sinon
const {progressive, classictechno, vocaltrance} = prebuilt_channel
const {ambient, bass, deep} = prebuilt_channel_filter

describe('ChannelsProvider', function () {
    const invalid_channel = new ChannelBuilder().with_id(0).with_key('invalid_key').build()
    const app_data = new AppDataBuilder()
        .with_channels([progressive, classictechno, vocaltrance])
        .with_channel_filters([ambient, bass, deep])
        .build()

    let app_data_provider_stub: SinonStubbedInstance<IAppDataProvider>
    let channels_provider: ChannelsProvider

    function trigger_update(new_app_data: AppData): void {
        expect(app_data_provider_stub.subscribe).to.have.been.calledOnceWithExactly(match.func)

        const callback = app_data_provider_stub.subscribe.firstCall.lastArg
        callback(new_app_data)
    }

    beforeEach(async function () {
        const logger_stub = stub_logger()
        app_data_provider_stub = stub_app_data_provider()
        app_data_provider_stub.get_app_data.returns(app_data)
        logger_stub.child_for_service.returns(stub_logger())

        const module = await Test.createTestingModule({
            providers: [
                {
                    provide: 'ILogger',
                    useValue: logger_stub,
                },
                {
                    provide: 'IAppDataProvider',
                    useValue: app_data_provider_stub,
                },
                ChannelsProvider,
            ],
        }).compile()

        channels_provider = module.get(ChannelsProvider)
        trigger_update(app_data)
    })

    it('should update itself', function () {
        const new_app_data = {
            ...app_data,
            channels: [],
            channel_filters: [],
        }
        app_data_provider_stub.get_app_data.returns(new_app_data)

        trigger_update(new_app_data)

        expect(channels_provider.get_all()).to.have.length(0)
        expect(channels_provider.get_filters()).to.have.length(0)
    })

    it('should return channel filters', function () {
        expect(channels_provider.get_filters()).to.have.members(app_data.channel_filters)
    })

    it('should return channels', function () {
        expect(channels_provider.get_all()).to.have.members(app_data.channels)
    })

    describe('should check if a channel exists', function () {
        it('by id', function () {
            expect(channels_provider.channel_exists(invalid_channel.id)).to.be.false
            expect(channels_provider.channel_exists(progressive.id)).to.be.true
        })

        it('by key', function () {
            expect(channels_provider.channel_exists(invalid_channel.key)).to.be.false
            expect(channels_provider.channel_exists(progressive.key)).to.be.true
        })
    })

    describe('should return a channel', function () {
        it('by its id', function () {
            expect(() => channels_provider.get(invalid_channel.id)).to.throw()
            expect(channels_provider.get(progressive.id)).to.equal(progressive)
        })

        it('by its key', function () {
            expect(() => channels_provider.get(invalid_channel.key)).to.throw()
            expect(channels_provider.get(progressive.key)).to.equal(progressive)
        })
    })
})
