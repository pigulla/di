import {SinonStub, stub} from 'sinon'

export type PinoStub = {
    trace: SinonStub
    debug: SinonStub
    warn: SinonStub
    error: SinonStub
    info: SinonStub
    child: SinonStub
}

export function create_pino_stub (): PinoStub {
    return {
        trace: stub(),
        debug: stub(),
        warn: stub(),
        error: stub(),
        info: stub(),
        child: stub(),
    }
}
