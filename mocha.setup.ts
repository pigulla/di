import chai from 'chai'
import chai_as_promised from 'chai-as-promised'
import sinon_chai from 'sinon-chai'
import nock from 'nock'

chai.use(chai_as_promised)
chai.use(sinon_chai)

nock.disableNetConnect()
