import {expect} from 'chai'
import nock from 'nock'
import {spy, stub} from 'sinon'
import {NO_CONTENT, INTERNAL_SERVER_ERROR, OK, NOT_FOUND, FORBIDDEN} from 'http-status-codes'
import {NowPlayingDTO, PlayDTO, ChannelDTO} from '@digitally-imported/dto/lib'

import {Client} from '@src'
import {ChannelNotFoundError, ClientError, ServerNotRunningError} from '@src/error'

describe('Client', function () {
    const URL = 'http://server.local'
    let client: Client

    beforeEach(function () {
        client = new Client({endpoint: URL})
    })

    describe('has a response interceptor which', function () {
        let interceptor: (error: any) => any

        beforeEach(function () {
            const response_interceptor_use = spy()
            const axios_mock = stub()
            const axios_factory = stub().returns(axios_mock)

            // @ts-ignore
            axios_mock.interceptors = {
                response: {
                    use: response_interceptor_use,
                },
            }

            // eslint-disable-next-line no-new
            new Client({endpoint: URL, axios_factory})
            expect(response_interceptor_use).to.have.been.calledOnce

            interceptor = response_interceptor_use.firstCall.args[1]
        })

        it('should detect when the server is not running', function () {
            const error = {isAxiosError: true, code: 'ECONNREFUSED'}
            expect(() => interceptor(error)).to.throw(ServerNotRunningError)
        })

        it('should turn Axios errors into ClientErrors', function () {
            const error = Object.assign(new Error(), {
                isAxiosError: true,
                code: 'BOOM',
            })

            expect(() => interceptor(error)).to.throw(ClientError)
        })

        it('should pass through other errors', function () {
            const error = new Error()
            expect(() => interceptor(error)).to.throw(error)
        })
    })

    describe('when checking if the server is alive', function () {
        it('should return true if it is', async function () {
            nock(URL).head('/server').reply(NO_CONTENT)

            await expect(client.is_alive()).to.eventually.be.true
        })

        it('should return false if it is not', async function () {
            nock(URL).head('/server').replyWithError({
                isAxiosError: true,
                code: 'ECONNREFUSED',
            })

            await expect(client.is_alive()).to.eventually.be.false
        })

        it('should let other errors bubble up', async function () {
            const error = Object.assign(new Error(), {
                isAxiosError: true,
                code: 'BOOM',
            })
            nock(URL).head('/server').replyWithError(error)

            try {
                await client.is_alive()
                expect.fail('Previous function should have thrown')
            } catch (thrown_error) {
                expect(thrown_error).to.be.instanceOf(ClientError)
                expect(thrown_error.cause).to.equal(error)
            }
        })
    })

    it('should shut down the server', async function () {
        nock(URL).delete('/server').reply(NO_CONTENT)

        await expect(client.shutdown()).to.eventually.be.undefined
    })

    it('should return the server status', async function () {
        const data = {
            foo: 42,
            bar: ['baz'],
        }
        nock(URL).get('/server').reply(OK, data)

        await expect(client.get_server_status()).to.eventually.deep.equal(data)
    })

    it('should trigger a server update', async function () {
        nock(URL).put('/server/update').reply(NO_CONTENT)

        await expect(client.update()).to.eventually.be.undefined
    })

    it('should set the volume', async function () {
        nock(URL)
            .put('/volume', {volume: 42})
            .reply(NO_CONTENT)

        await expect(client.set_volume(42)).to.eventually.be.undefined
    })

    it('should get the volume', async function () {
        nock(URL)
            .get('/volume')
            .reply(OK, {volume: 42})

        await expect(client.get_volume()).to.eventually.equal(42)
    })

    describe('when checking if something is playing', function () {
        it('should return true if there is', async function () {
            nock(URL)
                .head('/playback')
                .reply(NO_CONTENT)

            await expect(client.is_playing()).to.eventually.be.true
        })

        it('should return false if there is not', async function () {
            nock(URL)
                .head('/playback')
                .reply(NOT_FOUND)

            await expect(client.is_playing()).to.eventually.be.false
        })
    })

    describe('when playback is started', function () {
        it('should do so', async function () {
            const channel: ChannelDTO = {
                director: 'Hairy Potter',
                description: 'The most awesomest music',
                id: 42,
                key: 'most-awesome',
                name: 'Most Awesome',
                updated_at: null,
                created_at: '2019-12-08T19:46:47.994Z',
                images: {
                    default: 'http://images.local/most-awesome.jpg',
                    compact: 'http://images.local/most-awesome-comapct.jpg',
                    banner: null,
                },
            }

            nock(URL)
                .put('/playback', {channel: 'most-awesome'})
                .reply(OK, channel)

            await expect(client.start_playback('most-awesome')).to.eventually.deep.equal(channel)
        })

        it('should fail if the channel does not exist', async function () {
            const body: PlayDTO = {channel: 'progressive'}
            nock(URL)
                .put('/playback', body as {[key: string]: any})
                .reply(NOT_FOUND)

            await expect(client.start_playback('progressive'))
                .to.eventually.be.rejectedWith(ChannelNotFoundError)
        })

        it('should let other errors bubble up', async function () {
            nock(URL)
                .put('/playback', {channel: 'progressive'})
                .reply(INTERNAL_SERVER_ERROR)

            await expect(client.start_playback('progressive'))
                .to.eventually.be.rejectedWith(ClientError)
        })
    })

    it('should stop the playback', async function () {
        nock(URL).delete('/playback').reply(NO_CONTENT)

        await expect(client.stop_playback()).to.eventually.be.undefined
    })

    describe('when the playback state is checked', async function () {
        it('should return the state', async function () {
            const data = {
                foo: 42,
                bar: ['baz'],
            }

            nock(URL)
                .get('/playback')
                .reply(OK, data)

            await expect(client.get_playback_state()).to.eventually.deep.equal(data)
        })

        it('should return null if nothing is playing', async function () {
            nock(URL)
                .get('/playback')
                .reply(NOT_FOUND)

            await expect(client.get_playback_state()).to.eventually.be.null
        })
    })

    describe('when the favorites are requested', function () {
        it('should return null if unavailable', async function () {
            nock(URL)
                .get('/favorites')
                .reply(FORBIDDEN)

            await expect(client.get_favorites()).to.eventually.be.null
        })

        it('should return them', async function () {
            const data = ['foo', 'bar']

            nock(URL)
                .get('/favorites')
                .reply(OK, data)

            await expect(client.get_favorites()).to.eventually.deep.equal(data)
        })
    })

    it('should return the channels', async function () {
        const data = ['foo', 'bar']

        nock(URL)
            .get('/channels')
            .reply(OK, data)

        await expect(client.get_channels()).to.eventually.deep.equal(data)
    })

    describe('when a channel is requested', function () {
        it('should return it', async function () {
            const data = {
                foo: 42,
                bar: ['baz'],
            }

            nock(URL)
                .get('/channel/progressive')
                .reply(OK, data)

            await expect(client.get_channel('progressive')).to.eventually.deep.equal(data)
        })

        it('should throw if does not exist', async function () {
            nock(URL)
                .get('/channel/progressive')
                .reply(NOT_FOUND)

            await expect(client.get_channel('progressive')).to.eventually.be.rejectedWith(ChannelNotFoundError)
        })

        it('should let other errors bubble up', async function () {
            nock(URL)
                .get('/channel/progressive')
                .reply(INTERNAL_SERVER_ERROR)

            await expect(client.get_channel('progressive'))
                .to.eventually.be.rejectedWith(ClientError)
        })
    })

    it('should return the channel filters', async function () {
        const data = ['foo', 'bar']

        nock(URL)
            .get('/channelfilters')
            .reply(OK, data)

        await expect(client.get_channel_filters()).to.eventually.deep.equal(data)
    })

    it('should return all playing songs', async function () {
        const data: NowPlayingDTO[] = [
            {
                channel_id: 42,
                channel_key: 'progressive',
                display_artist: 'Hairy Potter',
                display_title: 'Foobar Bambaz',
            },
            {
                channel_id: 13,
                channel_key: 'rave',
                display_artist: 'The Future Sequencer',
                display_title: 'Fade 2 Reality',
            },
        ]

        nock(URL)
            .get('/channels/now_playing')
            .reply(OK, data)

        const result = await client.get_now_playing()
        expect([...result.entries()]).to.deep.equal([
            [data[0].channel_key, data[0]],
            [data[1].channel_key, data[1]],
        ])
    })

    describe('when the currently playing song on a channel is requested', function () {
        it('should return it', async function () {
            const data: NowPlayingDTO = {
                channel_id: 13,
                channel_key: 'rave',
                display_artist: 'The Future Sequencer',
                display_title: 'Fade 2 Reality',
            }

            nock(URL)
                .get('/channel/rave/now_playing')
                .reply(OK, data)

            await expect(client.get_now_playing('rave'))
                .to.eventually.deep.equal(data)
        })

        it('should throw if the channel does not exist', async function () {
            nock(URL)
                .get('/channel/rave/now_playing')
                .reply(NOT_FOUND)

            await expect(client.get_now_playing('rave'))
                .to.eventually.be.rejectedWith(ChannelNotFoundError)
        })

        it('should let other errors bubble up', async function () {
            nock(URL)
                .get('/channel/rave/now_playing')
                .reply(INTERNAL_SERVER_ERROR)

            await expect(client.get_now_playing('rave'))
                .to.eventually.be.rejectedWith(ClientError)
        })
    })
})
