import {Test} from '@nestjs/testing'
import {expect} from 'chai'
import {SinonStubbedInstance} from 'sinon'

import {
    Configuration,
    IDigitallyImported,
    IChannelsProvider,
    FavoritesProvider,
    CredentialsUnavailableError,
} from '~src/domain'

import {
    stub_logger,
    stub_channels_provider,
    stub_config,
    stub_digitally_imported,
    prebuilt_channel,
} from '~test/util'

const {progressive, classictechno} = prebuilt_channel

describe('FavoritesProvider', function () {
    let favorites_provider: FavoritesProvider
    let config_stub: SinonStubbedInstance<Configuration>
    let channels_provider_stub: SinonStubbedInstance<IChannelsProvider>
    let di_stub: SinonStubbedInstance<IDigitallyImported>

    beforeEach(async function () {
        const logger_stub = stub_logger()
        config_stub = stub_config()
        channels_provider_stub = stub_channels_provider()
        di_stub = stub_digitally_imported()

        logger_stub.child_for_service.returns(stub_logger())

        const module = await Test.createTestingModule({
            providers: [
                {
                    provide: 'ILogger',
                    useValue: logger_stub,
                },
                {
                    provide: 'IChannelsProvider',
                    useValue: channels_provider_stub,
                },
                {
                    provide: 'configuration',
                    useValue: config_stub,
                },
                {
                    provide: 'IDigitallyImported',
                    useValue: di_stub,
                },
                FavoritesProvider,
            ],
        }).compile()

        favorites_provider = module.get(FavoritesProvider)
    })

    it('should return all favorites if credentials are given', async function () {
        channels_provider_stub.get.withArgs(progressive.key).returns(progressive)
        channels_provider_stub.get.withArgs(classictechno.key).returns(classictechno)

        di_stub.load_favorite_channel_keys
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            .withArgs(config_stub.di_credentials!)
            .resolves([progressive.key, classictechno.key])

        const favorites = await favorites_provider.get_all()

        expect(favorites).to.deep.equal([progressive, classictechno])
    })

    it('should throw if no credentials are given', async function () {
        config_stub.di_credentials = null

        await expect(favorites_provider.get_all()).to.be.rejectedWith(CredentialsUnavailableError)
    })
})
