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

        it('should be constructible via its factory method', function () {
            const data = {
                channels: [42, 17],
                id: 13,
                key: 'the-key',
                meta: false,
                name: 'The name',
            }
            expect(ChannelFilterDTO.create(data)).to.deep.equal(data)
        })
    })

    describe('for a channel', function () {
        it('should be constructible', function () {
            const dto = new ChannelDTO()
            expect(dto).to.be.instanceOf(ChannelDTO)
        })

        it('should be constructible via its factory method', function () {
            const data = {
                director: 'The director',
                description: 'The description',
                id: 42,
                key: 'the-key',
                name: 'The name',
                updated_at: null,
                created_at: '2019-12-09T11:06:58.037Z',
                images: {
                    default: 'http://di.fm.local/default.jpg',
                    compact: 'http://di.fm.local/compact.jpg',
                    banner: null,
                },
            }
            expect(ChannelDTO.create(data)).to.deep.equal(data)
        })
    })

    describe('for now playing state', function () {
        it('should be constructible', function () {
            const dto = new NowPlayingDTO()
            expect(dto).to.be.instanceOf(NowPlayingDTO)
        })

        it('should be constructible via its factory method', function () {
            const data = {
                channel_id: 42,
                channel_key: 'the-key',
                display_artist: 'The Artist',
                display_title: 'The Title',
            }
            expect(NowPlayingDTO.create(data)).to.deep.equal(data)
        })
    })

    describe('for the play command', function () {
        it('should be constructible', function () {
            const dto = new PlayDTO()
            expect(dto).to.be.instanceOf(PlayDTO)
        })

        it('should be constructible via its factory method', function () {
            const data = {
                channel: 'The Channel',
            }
            expect(PlayDTO.create(data)).to.deep.equal(data)
        })
    })

    describe('for the playback state', function () {
        it('should be constructible', function () {
            const dto = new PlaybackStateDTO()
            expect(dto).to.be.instanceOf(PlaybackStateDTO)
        })

        it('should be constructible via its factory method', function () {
            const data = {
                channel: {
                    director: 'The director',
                    description: 'The description',
                    id: 42,
                    key: 'the-key',
                    name: 'The name',
                    updated_at: null,
                    created_at: '2019-12-09T11:06:58.037Z',
                    images: {
                        default: 'http://di.fm.local/default.jpg',
                        compact: 'http://di.fm.local/compact.jpg',
                        banner: null,
                    },
                },
                now_playing: {
                    artist: 'The Artist',
                    title: 'The Title',
                },
            }
            expect(PlaybackStateDTO.create(data)).to.deep.equal(data)
        })
    })

    describe('for the server status', function () {
        it('should be constructible', function () {
            const dto = new ServerStatusDTO()
            expect(dto).to.be.instanceOf(ServerStatusDTO)
        })

        it('should be constructible via its factory method', function () {
            const data = {
                playback_control: {
                    pid: 42,
                },
                digitally_imported: {
                    app_version: 'app-version-0.42',
                    deploy_time: '2019-12-07T14:11:13.001Z',
                },
                server: {
                    last_updated: '2019-12-09T11:06:58.037Z',
                    version: '0.42.17',
                },
            }
            expect(ServerStatusDTO.create(data)).to.deep.equal(data)
        })
    })

    describe('for the volume command', function () {
        it('should be constructible', function () {
            const dto = new VolumeDTO()
            expect(dto).to.be.instanceOf(VolumeDTO)
        })

        it('should be constructible via its factory method', function () {
            const data = {
                volume: 42,
            }
            expect(VolumeDTO.create(data)).to.deep.equal(data)
        })
    })
})
