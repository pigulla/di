import {SinonStubbedInstance} from 'sinon'
import {Test} from '@nestjs/testing'
import {expect} from 'chai'

import {ChannelFiltersController} from '@server/controller'
import {IChannelProvider} from '@server/service'

import {create_channel_provider_stub, prebuilt_channel_filter} from '../../util'

const {ambient, bass, deep} = prebuilt_channel_filter

describe('ChannelFilters controller', function () {
    let controller: ChannelFiltersController
    let channel_provider_stub: SinonStubbedInstance<IChannelProvider>

    beforeEach(async function () {
        channel_provider_stub = create_channel_provider_stub()

        const module = await Test.createTestingModule({
            providers: [
                {
                    provide: 'IChannelProvider',
                    useValue: channel_provider_stub,
                },
                ChannelFiltersController,
            ],
        }).compile()

        controller = module.get(ChannelFiltersController)
    })

    it('should return the available channel filters', function () {
        const filters = [ambient, bass, deep]
        channel_provider_stub.get_filters.returns(filters)

        const result = controller.list_channel_filters()
        expect(result).to.deep.equal(filters.map(filter => filter.to_dto()))
    })
})
