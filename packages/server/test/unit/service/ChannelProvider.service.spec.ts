import {SinonStubbedInstance} from 'sinon'
import {Test} from '@nestjs/testing'
import {expect} from 'chai'

import {ChannelProvider, IAppDataProvider} from '../../../src/service'
import {create_logger_stub, create_app_data_provider_stub, AppDataBuilder, UserBuilder, ChannelBuilder} from '../../util'
import {progressive, classictechno, vocaltrance} from '../../util/builder/Channel.builder'
import {ambient, bass, deep} from '../../util/builder/ChannelFilter.builder'
import {AppData} from '../../../src/service/di'

describe('ChannelProvider service', function () {
    const user = new UserBuilder().build_premium()
    const invalid_channel = new ChannelBuilder()
        .with_id(0)
        .with_key('invalid_key')
        .build()
    const app_data = new AppDataBuilder()
        .with_user(user)
        .with_channels([progressive, classictechno, vocaltrance])
        .with_channel_filters([ambient, bass, deep])
        .build()

    let app_data_provider: SinonStubbedInstance<IAppDataProvider>
    let channel_provider: ChannelProvider

    function trigger_update (new_app_data: AppData): void {
        const [fn, ctx] = app_data_provider.on_update.firstCall.args
        fn.call(ctx, new_app_data)
    }

    beforeEach(async function () {
        app_data_provider = create_app_data_provider_stub()
        app_data_provider.get_app_data.returns(app_data)

        const module = await Test.createTestingModule({
            providers: [
                {
                    provide: 'ILogger',
                    useValue: create_logger_stub(),
                },
                {
                    provide: 'IAppDataProvider',
                    useValue: app_data_provider,
                },
                ChannelProvider,
            ],
        }).compile()

        channel_provider = module.get(ChannelProvider)
        trigger_update(app_data)
    })

    it('should update itself', function () {
        const new_app_data = {
            ...app_data,
            channels: [],
            channel_filters: [],
        }
        app_data_provider.get_app_data.returns(new_app_data)

        trigger_update(new_app_data)

        expect(channel_provider.get_channels()).to.have.length(0)
        expect(channel_provider.get_filters()).to.have.length(0)
    })

    it('should return channel filters', function () {
        expect(channel_provider.get_filters()).to.have.members(app_data.channel_filters)
    })

    it('should return channels', function () {
        expect(channel_provider.get_channels()).to.have.members(app_data.channels)
    })

    describe('should check if a channel exists', function () {
        it('by id', function () {
            expect(channel_provider.channel_exists(invalid_channel.id)).to.be.false
            expect(channel_provider.channel_exists(progressive.id)).to.be.true
        })

        it('by key', function () {
            expect(channel_provider.channel_exists(invalid_channel.key)).to.be.false
            expect(channel_provider.channel_exists(progressive.key)).to.be.true
        })

        it('by itself', function () {
            expect(channel_provider.channel_exists(invalid_channel)).to.be.false
            expect(channel_provider.channel_exists(progressive)).to.be.true
        })
    })

    describe('should return a channel', function () {
        it('by its id', function () {
            expect(() => channel_provider.get_channel_by_id(invalid_channel.id)).to.throw()
            expect(channel_provider.get_channel_by_id(progressive.id)).to.equal(progressive)
        })

        it('by its key', function () {
            expect(() => channel_provider.get_channel_by_key(invalid_channel.key)).to.throw()
            expect(channel_provider.get_channel_by_key(progressive.key)).to.equal(progressive)
        })

        it('by itself', function () {
            expect(() => channel_provider.get_channel(invalid_channel)).to.throw()
            expect(channel_provider.get_channel(progressive)).to.equal(progressive)
        })
    })
})
