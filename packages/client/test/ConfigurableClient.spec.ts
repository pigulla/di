import {OnAirDTO, PlayDTO, ChannelDTO} from '@digitally-imported/dto'
import {expect} from 'chai'
import nock from 'nock'
import Axios from 'axios'
import {SinonStub, SinonStubbedInstance, match, spy, stub} from 'sinon'
import {NO_CONTENT, INTERNAL_SERVER_ERROR, OK, NOT_FOUND, FORBIDDEN} from 'http-status-codes'

import {ConfigurableClient} from '@src/ConfigurableClient'
import {Client} from '@src/Client'
import {ChannelNotFoundError, ClientError, ServerNotRunningError} from '@src/error'

describe('Client', function () {
    it('should extend ConfigurableClient', function () {
        const client = new Client()

        expect(client).to.be.instanceOf(ConfigurableClient)
    })
})

describe('ConfigurableClient', function () {
    const client_version = '2.4.3'
    const endpoint = 'http://server.local'
    const user_agent = 'my-agent/42'
    let client: ConfigurableClient
    let process_stub: Pick<SinonStubbedInstance<NodeJS.Process>, 'emitWarning'>

    beforeEach(function () {
        process_stub = {
            emitWarning: stub(),
        }
    })

    it('should throw if the client version is invalid', function () {
        expect(() => new ConfigurableClient({
            axios_factory: Axios.create,
            process: process_stub as any as NodeJS.Process,
            check_version: false,
            client_version: 'foo',
            user_agent,
            endpoint,
        })).to.throw(/invalid version/i)
    })

    describe('has a response interceptor which', function () {
        let error_interceptor: (error: any) => any
        let success_interceptor: (response: any) => any
        let axios_factory_stub: SinonStub
        let axios_stub: SinonStub

        beforeEach(function () {
            const response_interceptor_use = spy()

            axios_factory_stub = stub()
            axios_stub = stub()
            axios_factory_stub.returns(axios_stub)

            // @ts-ignore
            axios_stub.interceptors = {
                response: {
                    use: response_interceptor_use,
                },
            }

            client = new ConfigurableClient({
                endpoint,
                client_version,
                user_agent,
                axios_factory: axios_factory_stub,
                check_version: true,
                process: process_stub as any as NodeJS.Process,
            })
            expect(response_interceptor_use).to.have.been.calledOnce

            success_interceptor = response_interceptor_use.firstCall.args[0]
            error_interceptor = response_interceptor_use.firstCall.args[1]
        })

        it('should detect when the server is not running', function () {
            const error = {isAxiosError: true, code: 'ECONNREFUSED'}
            expect(() => error_interceptor(error)).to.throw(ServerNotRunningError)
        })

        it('should turn Axios errors into ClientErrors', function () {
            const error = Object.assign(new Error(), {
                isAxiosError: true,
                code: 'BOOM',
            })

            expect(() => error_interceptor(error)).to.throw(ClientError)
        })

        it('should pass through other errors', function () {
            const error = new Error()
            expect(() => error_interceptor(error)).to.throw(error)
        })

        it('should warn if the version header is missing', function () {
            const response = {
                headers: {},
            }

            expect(success_interceptor(response)).to.equal(response)
            expect(process_stub.emitWarning).to.have.been.calledOnceWithExactly(match(/did not send/))
        })

        it('should warn if the version header is invalid', function () {
            const response = {
                headers: {
                    'x-di-version': 'foo',
                },
            }

            expect(success_interceptor(response)).to.equal(response)
            expect(process_stub.emitWarning).to.have.been.calledOnceWithExactly(match(/invalid/))
        })

        it('should warn if the versions do not match', function () {
            const response = {
                headers: {
                    'x-di-version': '1.4.4',
                },
            }

            expect(success_interceptor(response)).to.equal(response)
            expect(process_stub.emitWarning).to.have.been.calledOnceWithExactly(match(/mismatch/))
        })

        it('should not warn if the versions match', function () {
            const response = {
                headers: {
                    'x-di-version': '2.9.3',
                },
            }

            expect(success_interceptor(response)).to.equal(response)
            expect(process_stub.emitWarning).to.not.have.been.called
        })
    })

    describe('when actual requests are made', function () {
        beforeEach(function () {
            client = new ConfigurableClient({
                endpoint,
                client_version,
                user_agent,
                check_version: false,
                axios_factory: Axios.create,
                process: process_stub as any as NodeJS.Process,
            })
        })

        describe('when checking if the server is alive', function () {
            it('should send the user agent header', async function () {
                nock(endpoint, {
                    reqheaders: {
                        'user-agent': user_agent,
                    },
                }).head('/server').reply(NO_CONTENT)

                await client.is_alive()
            })

            it('should return true if it is', async function () {
                nock(endpoint).head('/server').reply(NO_CONTENT)

                await expect(client.is_alive()).to.eventually.be.true
            })

            it('should return false if it is not', async function () {
                nock(endpoint).head('/server').replyWithError({
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
                nock(endpoint).head('/server').replyWithError(error)

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
            nock(endpoint).delete('/server').reply(NO_CONTENT)

            await expect(client.shutdown()).to.eventually.be.undefined
        })

        it('should return the server status', async function () {
            const data = {
                foo: 42,
                bar: ['baz'],
            }
            nock(endpoint).get('/server').reply(OK, data)

            await expect(client.get_server_status()).to.eventually.deep.equal(data)
        })

        it('should trigger a server update', async function () {
            nock(endpoint).put('/server/update').reply(NO_CONTENT)

            await expect(client.update()).to.eventually.be.undefined
        })

        it('should set the volume', async function () {
            nock(endpoint)
                .put('/volume', {volume: 42})
                .reply(NO_CONTENT)

            await expect(client.set_volume(42)).to.eventually.be.undefined
        })

        it('should get the volume', async function () {
            nock(endpoint)
                .get('/volume')
                .reply(OK, {volume: 42})

            await expect(client.get_volume()).to.eventually.equal(42)
        })

        describe('when checking if something is playing', function () {
            it('should return true if there is', async function () {
                nock(endpoint)
                    .head('/playback')
                    .reply(NO_CONTENT)

                await expect(client.is_playing()).to.eventually.be.true
            })

            it('should return false if there is not', async function () {
                nock(endpoint)
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

                nock(endpoint)
                    .put('/playback', {channel: 'most-awesome'})
                    .reply(OK, channel)

                await expect(client.start_playback('most-awesome')).to.eventually.deep.equal(channel)
            })

            it('should fail if the channel does not exist', async function () {
                const body: PlayDTO = {channel: 'progressive'}
                nock(endpoint)
                    .put('/playback', body as {[key: string]: any})
                    .reply(NOT_FOUND)

                await expect(client.start_playback('progressive'))
                    .to.eventually.be.rejectedWith(ChannelNotFoundError)
            })

            it('should let other errors bubble up', async function () {
                nock(endpoint)
                    .put('/playback', {channel: 'progressive'})
                    .reply(INTERNAL_SERVER_ERROR)

                await expect(client.start_playback('progressive'))
                    .to.eventually.be.rejectedWith(ClientError)
            })
        })

        it('should stop the playback', async function () {
            nock(endpoint).delete('/playback').reply(NO_CONTENT)

            await expect(client.stop_playback()).to.eventually.be.undefined
        })

        describe('when the playback state is checked', async function () {
            it('should return the state', async function () {
                const data = {
                    foo: 42,
                    bar: ['baz'],
                }

                nock(endpoint)
                    .get('/playback')
                    .reply(OK, data)

                await expect(client.get_playback_state()).to.eventually.deep.equal(data)
            })

            it('should return null if nothing is playing', async function () {
                nock(endpoint)
                    .get('/playback')
                    .reply(NOT_FOUND)

                await expect(client.get_playback_state()).to.eventually.be.null
            })
        })

        describe('when the favorites are requested', function () {
            it('should return null if unavailable', async function () {
                nock(endpoint)
                    .get('/favorites')
                    .reply(FORBIDDEN)

                await expect(client.get_favorites()).to.eventually.be.null
            })

            it('should return them', async function () {
                const data = ['foo', 'bar']

                nock(endpoint)
                    .get('/favorites')
                    .reply(OK, data)

                await expect(client.get_favorites()).to.eventually.deep.equal(data)
            })
        })

        it('should return the channels', async function () {
            const data = ['foo', 'bar']

            nock(endpoint)
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

                nock(endpoint)
                    .get('/channel/progressive')
                    .reply(OK, data)

                await expect(client.get_channel('progressive')).to.eventually.deep.equal(data)
            })

            it('should throw if does not exist', async function () {
                nock(endpoint)
                    .get('/channel/progressive')
                    .reply(NOT_FOUND)

                await expect(client.get_channel('progressive')).to.eventually.be.rejectedWith(ChannelNotFoundError)
            })

            it('should let other errors bubble up', async function () {
                nock(endpoint)
                    .get('/channel/progressive')
                    .reply(INTERNAL_SERVER_ERROR)

                await expect(client.get_channel('progressive'))
                    .to.eventually.be.rejectedWith(ClientError)
            })
        })

        it('should return the channel filters', async function () {
            const data = ['foo', 'bar']

            nock(endpoint)
                .get('/channelfilters')
                .reply(OK, data)

            await expect(client.get_channel_filters()).to.eventually.deep.equal(data)
        })

        it('should return all playing songs', async function () {
            const data: OnAirDTO[] = [
                {
                    channel_id: 42,
                    channel_key: 'progressive',
                    artist: 'Hairy Potter',
                    title: 'Foobar Bambaz',
                },
                {
                    channel_id: 13,
                    channel_key: 'rave',
                    artist: 'The Future Sequencer',
                    title: 'Fade 2 Reality',
                },
            ]

            nock(endpoint)
                .get('/channels/on_air')
                .reply(OK, data)

            const result = await client.get_on_air()
            expect([...result.entries()]).to.deep.equal([
                [data[0].channel_key, data[0]],
                [data[1].channel_key, data[1]],
            ])
        })

        describe('when the currently playing song on a channel is requested', function () {
            it('should return it', async function () {
                const data: OnAirDTO = {
                    channel_id: 13,
                    channel_key: 'rave',
                    artist: 'The Future Sequencer',
                    title: 'Fade 2 Reality',
                }

                nock(endpoint)
                    .get('/channel/rave/on_air')
                    .reply(OK, data)

                await expect(client.get_on_air('rave'))
                    .to.eventually.deep.equal(data)
            })

            it('should throw if the channel does not exist', async function () {
                nock(endpoint)
                    .get('/channel/rave/on_air')
                    .reply(NOT_FOUND)

                await expect(client.get_on_air('rave'))
                    .to.eventually.be.rejectedWith(ChannelNotFoundError)
            })

            it('should let other errors bubble up', async function () {
                nock(endpoint)
                    .get('/channel/rave/on_air')
                    .reply(INTERNAL_SERVER_ERROR)

                await expect(client.get_on_air('rave'))
                    .to.eventually.be.rejectedWith(ClientError)
            })
        })
    })
})
