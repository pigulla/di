import {NotFoundException} from '@nestjs/common'
import {Test} from '@nestjs/testing'
import {expect} from 'chai'
import {SinonStubbedInstance} from 'sinon'

import {OnAirController} from '~src/application/controller'
import {IOnAirProvider} from '~src/domain'

import {stub_on_air_provider, prebuilt_channel, NowPlayingBuilder} from '~test/util'

describe('NowPlaying controller', function () {
    let controller: OnAirController
    let on_air_provider_stub: SinonStubbedInstance<IOnAirProvider>

    beforeEach(async function () {
        on_air_provider_stub = stub_on_air_provider()

        const module = await Test.createTestingModule({
            providers: [
                {
                    provide: 'IOnAirProvider',
                    useValue: on_air_provider_stub,
                },
                OnAirController,
            ],
        }).compile()

        controller = module.get(OnAirController)
    })

    it('should return all currently playing songs', function () {
        const now_playing = [
            new NowPlayingBuilder().for_channel(prebuilt_channel.progressive).build(),
            new NowPlayingBuilder().for_channel(prebuilt_channel.vocaltrance).build(),
        ]
        on_air_provider_stub.get_all.returns(now_playing)

        const result = controller.on_air()
        expect(result).to.deep.equal(now_playing.map(item => item.to_dto()))
    })

    it('should return the currently playing song for a channel', async function () {
        const channel = prebuilt_channel.progressive
        const now_playing = new NowPlayingBuilder().for_channel(channel).build()

        on_air_provider_stub.get_by_channel_key.withArgs(channel.key).returns(now_playing)

        const result = await controller.on_air_on_channel(channel.key)
        expect(result).to.deep.equal(now_playing.to_dto())
    })

    it('should throw if the channel does not exist', async function () {
        const error = new Error()

        on_air_provider_stub.get_by_channel_key.withArgs('invalid').throws(error)

        expect(() => controller.on_air_on_channel('invalid')).to.throw(NotFoundException)
    })
})
