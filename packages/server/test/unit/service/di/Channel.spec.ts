import {expect} from 'chai'

import {Channel} from '@server/service/di'

describe('A DigitallyImported Channel', function () {
    describe('should parse the channel key', function () {
        [
            'http://prem2.di.fm:80/bassnjackinhouse?abcd1234dcba4321',
            'http://prem2.di.fm:80/bassnjackinhouse_hi?abcd1234dcba4321',
            'http://prem2.di.fm:80/bassnjackinhouse_aac?abcd1234dcba4321',
            'http://listen.di.fm/premium/bassnjackinhouse.pls?listen_key=abcd1234dcba4321',
            'http://listen.di.fm/premium_high/bassnjackinhouse.pls?listen_key=abcd1234dcba4321',
            'http://listen.di.fm/premium_medium/bassnjackinhouse.pls?listen_key=abcd1234dcba4321',
        ].forEach(function (url) {
            it(`from url "${url}"`, function () {
                expect(Channel.get_key_from_url(url)).to.equal('bassnjackinhouse')
            })
        })

        it('but fail if it is malformed', function () {
            const malformed_url = 'http://listen.di.fm/info/bassnjackinhouse.pls?listen_key=abcd1234abcd1234'
            expect(() => Channel.get_key_from_url(malformed_url)).to.throw(/failed to parse/i)
        })
    })
})
