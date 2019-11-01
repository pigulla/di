import {expect} from 'chai'

import {new_promise} from '@server/promise_helper'

describe('The promise helper', function () {
    it('should return the resolver', async function () {
        const {promise, resolve} = new_promise<number>()

        resolve(42)
        await expect(promise).to.eventually.equal(42)
    })

    it('should return the rejector', async function () {
        const {promise, reject} = new_promise<number>()
        const error = new Error()

        reject(error)
        await expect(promise).to.eventually.be.rejectedWith(error)
    })
})
