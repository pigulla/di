import {Test} from '@nestjs/testing'
import {expect} from 'chai'
import {SinonStubbedInstance} from 'sinon'

import {
    Configuration,
    IDigitallyImported,
    IChannelsProvider,
    FavoritesProvider,
    CredentialsUnavailableError,
} from '@src/domain'
import {
    create_logger_stub,
    create_channels_provider_stub,
    create_config_stub,
    create_digitally_imported_stub,
    prebuilt_channel,
} from '@test/util'

const {progressive, classictechno} = prebuilt_channel

describe('FavoritesProvider', function () {
    let favorites_provider: FavoritesProvider
    let config_stub: SinonStubbedInstance<Configuration>
    let channels_provider_stub: SinonStubbedInstance<IChannelsProvider>
    let di_stub: SinonStubbedInstance<IDigitallyImported>

    beforeEach(async function () {
        const logger_stub = create_logger_stub()
        config_stub = create_config_stub()
        channels_provider_stub = create_channels_provider_stub()
        di_stub = create_digitally_imported_stub()

        logger_stub.child_for_service.returns(create_logger_stub())

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
