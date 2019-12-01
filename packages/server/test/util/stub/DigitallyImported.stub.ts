import sinon, {SinonStubbedInstance} from 'sinon'

import {IDigitallyImported} from '@server/service'

export function create_digitally_imported_stub (): SinonStubbedInstance<IDigitallyImported> {
    return {
        load_app_data: sinon.stub(),
        load_now_playing: sinon.stub(),
        load_favorite_channel_keys: sinon.stub(),
    }
}
