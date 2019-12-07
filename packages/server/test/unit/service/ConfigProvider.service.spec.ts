import {Test} from '@nestjs/testing'
import {expect} from 'chai'
import {SinonStub, stub} from 'sinon'

import {ConfigProvider} from '@src/service'
import {ApplicationOptions} from '@src/service/config'
import {Quality} from '@src/service/di'
import {LogLevel} from '@src/service/logger'

describe('ConfigProvider service', function () {
    let argv_parser_stub: SinonStub

    async function create_config_provider (argv: string[] = []): Promise<ConfigProvider> {
        const module = await Test.createTestingModule({
            providers: [
                {
                    provide: 'IArgvParser',
                    useValue: argv_parser_stub,
                },
                {
                    provide: 'argv',
                    useValue: argv,
                },
                ConfigProvider,
            ],
        }).compile()

        return module.get(ConfigProvider)
    }

    beforeEach(async function () {
        argv_parser_stub = stub()
    })

    it('should invoke the argv parser correctly', async function () {
        const argv = ['foo', 'bar', 'baz']
        const config_provider = await create_config_provider(argv)

        expect(argv_parser_stub).to.have.been.calledOnceWithExactly(argv)
        expect(config_provider).to.be.an.instanceOf(ConfigProvider)
    })

    describe('when all options are set', function () {
        const options: ApplicationOptions = {
            hostname: 'example.local',
            port: 1337,
            logLevel: LogLevel.WARN,
            vlcPath: '/usr/bin/vlc',
            vlcInitialVolume: 0.666,
            vlcTimeout: 1500,
            url: 'http://www.di.fm.local',
            listenkey: 'my-listenkey',
            frequency: 7500,
            quality: Quality.AAC_128,
            credentials: {
                username: 'my-username',
                password: 'my-password',
            },
        }
        let config_provider: ConfigProvider

        beforeEach(async function () {
            argv_parser_stub.returns(options)
            config_provider = await create_config_provider()
        })

        it("should return the server's hostname", function () {
            expect(config_provider.server_hostname).to.equal(options.hostname)
        })

        it("should return the server's port", function () {
            expect(config_provider.server_port).to.equal(options.port)
        })

        it('should return the log level', function () {
            expect(config_provider.log_level).to.equal(options.logLevel)
        })

        it("should return vlc's path", function () {
            expect(config_provider.vlc_path).to.equal(options.vlcPath)
        })

        it("should return vlc's timeout", function () {
            expect(config_provider.vlc_timeout).to.equal(options.vlcTimeout)
        })

        it("should return vlc's initial volume", function () {
            expect(config_provider.vlc_initial_volume).to.equal(options.vlcInitialVolume)
        })

        it("should return di's url", function () {
            expect(config_provider.di_url).to.equal(options.url)
        })

        it("should return di's listenkey", function () {
            expect(config_provider.di_listenkey).to.equal(options.listenkey)
        })

        it("should return di's quality", function () {
            expect(config_provider.di_quality).to.equal(options.quality)
        })

        it("should return di's frequency", function () {
            expect(config_provider.di_frequency_ms).to.equal(options.frequency)
        })

        it("should return di's credentials", function () {
            expect(config_provider.di_credentials).to.equal(options.credentials)
        })
    })
})
