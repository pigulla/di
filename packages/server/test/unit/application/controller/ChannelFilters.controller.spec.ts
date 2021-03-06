import {Test} from '@nestjs/testing'
import {expect} from 'chai'
import {SinonStubbedInstance} from 'sinon'

import {ChannelFiltersController} from '~src/application/controller'
import {IChannelsProvider} from '~src/domain'

import {stub_channels_provider, prebuilt_channel_filter} from '~test/util'

const {ambient, bass, deep} = prebuilt_channel_filter

describe('ChannelFilters controller', function () {
    let controller: ChannelFiltersController
    let channels_provider_stub: SinonStubbedInstance<IChannelsProvider>

    beforeEach(async function () {
        channels_provider_stub = stub_channels_provider()

        const module = await Test.createTestingModule({
            providers: [
                {
                    provide: 'IChannelsProvider',
                    useValue: channels_provider_stub,
                },
                ChannelFiltersController,
            ],
        }).compile()

        controller = module.get(ChannelFiltersController)
    })

    it('should return the available channel filters', function () {
        const filters = [ambient, bass, deep]
        channels_provider_stub.get_filters.returns(filters)

        const result = controller.list_channel_filters()
        expect(result).to.deep.equal(filters.map(filter => filter.to_dto()))
    })
})
