import {SinonStubbedInstance} from 'sinon'
import {Test} from '@nestjs/testing'
import {expect} from 'chai'

import {ChannelsController} from '@server/controller'
import {IChannelProvider} from '@server/service'

import {create_channel_provider_stub, prebuilt_channel} from '../../util'
import {NotFoundException} from '@nestjs/common'

const {progressive, vocaltrance, classictechno} = prebuilt_channel

describe('Channels controller', function () {
    let controller: ChannelsController
    let channel_provider_stub: SinonStubbedInstance<IChannelProvider>

    beforeEach(async function () {
        channel_provider_stub = create_channel_provider_stub()

        const module = await Test.createTestingModule({
            providers: [
                {
                    provide: 'IChannelProvider',
                    useValue: channel_provider_stub,
                },
                ChannelsController,
            ],
        }).compile()

        controller = module.get(ChannelsController)
    })

    it('should return the available channels', function () {
        const channels = [progressive, vocaltrance, classictechno]
        channel_provider_stub.get_all.returns(channels)

        const result = controller.list_channels()
        expect(result).to.deep.equal(channels.map(channel => channel.to_dto()))
    })

    it('should return a specific channel', function () {
        channel_provider_stub.channel_exists.withArgs(progressive.key).returns(true)
        channel_provider_stub.get_by_key.withArgs(progressive.key).returns(progressive)

        const result = controller.get_channel(progressive.key)
        expect(result).to.deep.equal(progressive.to_dto())
    })

    it('should throw if a specific channel does not exist', function () {
        channel_provider_stub.channel_exists.withArgs(progressive.key).returns(false)

        expect(() => controller.get_channel(progressive.key)).to.throw(NotFoundException)
    })
})
