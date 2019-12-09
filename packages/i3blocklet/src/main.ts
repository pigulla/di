/* eslint-disable no-console */
import {Client} from '@digitally-imported/client'

import {blocket} from './blocklet'

;(async function () {
    const client = new Client({
        endpoint: 'http://localhost:4979',
    })
    const data = await blocket(client)
    console.log(JSON.stringify(data, null, 4))
})().catch(function (error) {
    console.error(error)
    process.exitCode = 1
})
