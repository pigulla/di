import {expect} from 'chai'

import {new_promise} from '@server/new_promise'

describe('The new_promise function', function () {
    it('should return the resolver', async function () {
        const {promise, resolve} = new_promise<number>()

        resolve(42)
        await expect(promise).to.eventually.equal(42)
    })

    it('should return the rejector', async function () {
        const {promise, reject} = new_promise<number>()
        const error = new Error()

        reject(error)
        await expect(promise).to.be.rejectedWith(error)
    })
})
