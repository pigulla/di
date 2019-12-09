import 'mocha'
import nock from 'nock'
import {expect} from 'chai'

before(function () {
    nock.disableNetConnect()
})

afterEach(function () {
    const active = nock.activeMocks()
    const pending = nock.pendingMocks()

    nock.cleanAll()

    expect(active, 'No active mocked HTTP requests').to.have.length(0)
    expect(pending, 'No pending mocked HTTP requests').to.have.length(0)
})

after(function () {
    nock.enableNetConnect()
})
