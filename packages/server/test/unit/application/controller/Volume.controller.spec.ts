import {Test} from '@nestjs/testing'
import {expect} from 'chai'
import {SinonStubbedInstance} from 'sinon'

import {VolumeController} from '~src/application/controller'
import {IPlaybackControl} from '~src/domain'

import {stub_playback_control} from '~test/util'

describe('Volume controller', function () {
    let controller: VolumeController
    let playback_control_stub: SinonStubbedInstance<IPlaybackControl>

    beforeEach(async function () {
        playback_control_stub = stub_playback_control()

        const module = await Test.createTestingModule({
            providers: [
                {
                    provide: 'IPlaybackControl',
                    useValue: playback_control_stub,
                },
                VolumeController,
            ],
        }).compile()

        controller = module.get(VolumeController)
    })

    it('should set the volume', async function () {
        playback_control_stub.set_volume.resolves(undefined)

        const result = await controller.set_volume({volume: 25})

        expect(result).to.be.undefined
    })

    it('should get the volume', async function () {
        playback_control_stub.get_volume.resolves(0.75)

        const result = await controller.get_volume()

        expect(result).to.deep.equal({
            volume: 75,
        })
    })
})
