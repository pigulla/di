import chai, {expect} from 'chai'
import chai_as_promised from 'chai-as-promised'
import nock from 'nock'
import sinon_chai from 'sinon-chai'

chai.use(chai_as_promised)
chai.use(sinon_chai)

beforeAll(function () {
    nock.disableNetConnect()
})

afterEach(function () {
    const active = nock.activeMocks()
    const pending = nock.pendingMocks()

    nock.cleanAll()

    expect(active, 'No active mocked HTTP requests').to.have.length(0)
    expect(pending, 'No pending mocked HTTP requests').to.have.length(0)
})

afterAll(function () {
    nock.enableNetConnect()
})
