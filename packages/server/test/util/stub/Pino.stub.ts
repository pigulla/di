import sinon, {SinonStub} from 'sinon'

const {stub} = sinon

export type PinoStub = {
    trace: SinonStub
    debug: SinonStub
    info: SinonStub
    warn: SinonStub
    error: SinonStub
    fatal: SinonStub
    child: SinonStub
}

export function stub_pino(): PinoStub {
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
