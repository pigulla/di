import {SinonStub, stub} from 'sinon'

export type PinoStub = {
    trace: SinonStub
    debug: SinonStub
    info: SinonStub
    warn: SinonStub
    error: SinonStub
    fatal: SinonStub
    child: SinonStub
}

export function create_pino_stub (): PinoStub {
    return {
        trace: stub(),
        debug: stub(),
        info: stub(),
        warn: stub(),
        error: stub(),
        fatal: stub(),
        child: stub(),
    }
}
