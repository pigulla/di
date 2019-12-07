import {expect} from 'chai'

import {
    ChannelFilterDTO,
    ChannelDTO,
    NowPlayingDTO,
    PlayDTO,
    PlaybackStateDTO,
    ServerStatusDTO,
    VolumeDTO,
} from '@src'

describe('The DTO', function () {
    describe('for a channel filter', function () {
        it('should be constructible', function () {
            const dto = new ChannelFilterDTO()
            expect(dto).to.be.instanceOf(ChannelFilterDTO)
        })
    })

    describe('for a channel', function () {
        it('should be constructible', function () {
            const dto = new ChannelDTO()
            expect(dto).to.be.instanceOf(ChannelDTO)
        })
    })

    describe('for now playing state', function () {
        it('should be constructible', function () {
            const dto = new NowPlayingDTO()
            expect(dto).to.be.instanceOf(NowPlayingDTO)
        })
    })

    describe('for the play command', function () {
        it('should be constructible', function () {
            const dto = new PlayDTO()
            expect(dto).to.be.instanceOf(PlayDTO)
        })
    })

    describe('for the playback state', function () {
        it('should be constructible', function () {
            const dto = new PlaybackStateDTO()
            expect(dto).to.be.instanceOf(PlaybackStateDTO)
        })
    })

    describe('for the server status', function () {
        it('should be constructible', function () {
            const dto = new ServerStatusDTO()
            expect(dto).to.be.instanceOf(ServerStatusDTO)
        })
    })

    describe('for the volume command', function () {
        it('should be constructible', function () {
            const dto = new VolumeDTO()
            expect(dto).to.be.instanceOf(VolumeDTO)
        })
    })
})
