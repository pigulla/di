import sinon, {SinonStubbedInstance} from 'sinon'

import {IDigitallyImported} from '@src/domain'

export function create_digitally_imported_stub (): SinonStubbedInstance<IDigitallyImported> {
    return {
        load_app_data: sinon.stub(),
        load_on_air: sinon.stub(),
        load_favorite_channel_keys: sinon.stub(),
    }
}
