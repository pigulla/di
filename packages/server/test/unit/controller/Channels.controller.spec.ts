import {Test} from '@nestjs/testing'
import {NotFoundException} from '@nestjs/common'
import {expect} from 'chai'
import {SinonStubbedInstance} from 'sinon'

import {ChannelsController} from '@server/controller'
import {IChannelsProvider} from '@server/service'

import {create_channels_provider_stub, prebuilt_channel} from '@test/util'

const {progressive, vocaltrance, classictechno} = prebuilt_channel

describe('Channels controller', function () {
    let controller: ChannelsController
    let channels_provider_stub: SinonStubbedInstance<IChannelsProvider>

    beforeEach(async function () {
        channels_provider_stub = create_channels_provider_stub()

        const module = await Test.createTestingModule({
            providers: [
                {
                    provide: 'IChannelsProvider',
                    useValue: channels_provider_stub,
                },
                ChannelsController,
            ],
        }).compile()

        controller = module.get(ChannelsController)
    })

    it('should return the available channels', function () {
        const channels = [progressive, vocaltrance, classictechno]
        channels_provider_stub.get_all.returns(channels)

        const result = controller.list_channels()
        expect(result).to.deep.equal(channels.map(channel => channel.to_dto()))
    })

    it('should return a specific channel', function () {
        channels_provider_stub.channel_exists.withArgs(progressive.key).returns(true)
        channels_provider_stub.get.withArgs(progressive.key).returns(progressive)

        const result = controller.get_channel(progressive.key)
        expect(result).to.deep.equal(progressive.to_dto())
    })

    it('should throw if a specific channel does not exist', function () {
        channels_provider_stub.channel_exists.withArgs(progressive.key).returns(false)

        expect(() => controller.get_channel(progressive.key)).to.throw(NotFoundException)
    })
})
