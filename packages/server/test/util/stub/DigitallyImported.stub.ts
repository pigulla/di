import sinon, {SinonStubbedInstance} from 'sinon'

import {IDigitallyImported} from '../../../src/service'

export function create_digitally_imported_stub (): SinonStubbedInstance<IDigitallyImported> {
    return {
        load_app_data: sinon.stub(),
    }
}
