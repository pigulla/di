import sinon, {SinonStubbedInstance} from 'sinon'

import {IDigitallyImported} from '~src/domain'

const {stub} = sinon

export function stub_digitally_imported(): SinonStubbedInstance<IDigitallyImported> {
    return {
        load_app_data: stub(),
        load_on_air: stub(),
        load_favorite_channel_keys: stub(),
    }
}
