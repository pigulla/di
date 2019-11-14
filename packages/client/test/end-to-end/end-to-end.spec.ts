import {promisify} from 'util'

import {expect} from 'chai'

import {Client} from '../../src/Client'

const sleep = promisify(setTimeout)

describe('End-to-end test', function () {
    const client = new Client({
        endpoint: 'http://localhost:4979',
    })

    async function get_last_updated (): Promise<number> {
        const status = await client.get_server_status()
        return new Date(status.server.last_updated).getTime()
    }

    it('is_alive()', async function () {
await sleep(1)
        await expect(client.is_alive()).to.eventually.be.true
    })

    // it('shutdown()', async function () {
    //     this.slow(5_000)
    //
    //     await client.shutdown()
    //     await sleep(1_500)
    //
    //     await expect(client.is_alive()).to.eventually.be.false
    // })

    it('get_server_status() ', async function () {
        const result = await client.get_server_status()

        expect(result.playback_control).to.have.all.keys('pid', 'version')
        expect(result.digitally_imported).to.have.all.keys('app_version', 'deploy_time')
        expect(result.server).to.have.all.keys('last_updated', 'version')
    })

    it('update()', async function () {
        const before = await get_last_updated()
        await client.update()
        const after = await get_last_updated()

        expect(after).to.be.greaterThan(before)
    })

    it('get_volume() and set_volume()', async function () {
        await client.set_volume(30)
        await expect(client.get_volume()).to.eventually.be.closeTo(30, 1)

        await client.set_volume(10)
        await expect(client.get_volume()).to.eventually.be.closeTo(10, 1)

        await client.set_volume(25)
        await expect(client.get_volume()).to.eventually.be.closeTo(25, 1)
    })

    it('is_playing(), start_playback() and set_playback()', async function () {
        await client.stop_playback()
        await sleep(500)
        await expect(client.is_playing()).to.eventually.be.false

        await client.start_playback('progressive')
        await sleep(500)
        await expect(client.is_playing()).to.eventually.be.true

        await client.stop_playback()
        await sleep(500)
        await expect(client.is_playing()).to.eventually.be.false
    })
})
