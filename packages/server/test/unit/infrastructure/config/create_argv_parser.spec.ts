import {expect} from 'chai'

import {Quality} from '~src/domain/di'
import {create_argv_parser, IArgvParser} from '~src/infrastructure/config'

import {with_console_silenced} from '~test/util'

function expect_yargs_error(cb: (...args: any[]) => any, message: RegExp): void {
    try {
        with_console_silenced(cb)
        expect(false, 'Function should have thrown').to.be.true
    } catch (error) {
        expect(error.name).to.equal('YError')
        expect(error.message).to.match(message)
    }
}

describe('create_argv_parser', function () {
    describe('with the VLC binary check enabled', function () {
        it('should use the default value', function () {
            const argv_parser = create_argv_parser({
                skip_vlc_validation: false,
                auto_exit: false,
                default_vlc_binary: null,
            })

            expect_yargs_error(
                () => argv_parser(['--listenkey', '1234567890123456']),
                /executable could not be auto detected/i
            )
        })

        it('should ensure it exists', function () {
            const argv_parser = create_argv_parser({
                skip_vlc_validation: false,
                auto_exit: false,
                default_vlc_binary: __filename,
            })

            expect(() => argv_parser(['--listenkey', '1234567890123456'])).to.not.throw()
        })

        it('should fail if it does not exist', function () {
            const argv_parser = create_argv_parser({
                skip_vlc_validation: false,
                auto_exit: false,
                default_vlc_binary: `${__filename}.invalid`,
            })

            expect_yargs_error(
                () => argv_parser(['--listenkey', '1234567890123456']),
                /executable not found/i
            )
        })
    })

    describe('with the VLC binary check disabled', function () {
        let argv_parser: IArgvParser

        beforeEach(function () {
            argv_parser = create_argv_parser({
                ignore_env: true,
                skip_vlc_validation: true,
                auto_exit: false,
                default_vlc_binary: null,
            })
        })

        it('should work with minimal options', function () {
            const result = argv_parser(['--listenkey', '1234567890123456'])
            expect(result.di_listenkey).to.equal('1234567890123456')
        })

        it('should parse all options', function () {
            const result = argv_parser([
                '--listenkey',
                '1234567890123456',
                '-f',
                '42',
                '--url',
                'http://www.di.fm.local/streams',
                '-q',
                Quality.AAC_64,
                '--vlc-path',
                '/usr/local/bin/vlc',
                '-t',
                '1234',
                '-i',
                '0.77',
            ])

            expect(result).to.include({
                di_listenkey: '1234567890123456',
                di_frequency_ms: 42,
                di_url: 'http://www.di.fm.local/streams',
                di_quality: Quality.AAC_64,
                vlc_path: '/usr/local/bin/vlc',
                vlc_timeout: 1234,
                vlc_initial_volume: 0.77,
            })
        })

        it('should require a listenkey', function () {
            expect_yargs_error(() => argv_parser(['--quality', Quality.AAC_128]), /listenkey/i)
        })

        it('should not reject unknown options', function () {
            expect(() => argv_parser(['--listenkey', '1234567890123456', '--foo'])).not.to.throw()
        })

        it('should reject invalid values for DI listenkey', function () {
            expect_yargs_error(() => argv_parser(['--listenkey', 'zz34567890123456']), /listenkey/i)
        })

        it('should reject invalid values for the server port', function () {
            expect_yargs_error(
                () => argv_parser(['--listenkey', 'zz34567890123456', '--port', 'x']),
                /must be an integer/i
            )
        })

        it('should reject out-of-bound values for the server port', function () {
            expect_yargs_error(
                () => argv_parser(['--listenkey', 'zz34567890123456', '--port', '100000']),
                /must be below/i
            )
        })

        it('should reject invalid values for VLC initial volume', function () {
            expect_yargs_error(
                () =>
                    argv_parser([
                        '--listenkey',
                        '1234567890123456',
                        '--vlc-initial-volume',
                        '1.1.5',
                    ]),
                /floating point number/i
            )
        })

        it('should reject out-of-bound values for VLC initial volume', function () {
            expect_yargs_error(
                () =>
                    argv_parser(['--listenkey', '1234567890123456', '--vlc-initial-volume', '1.5']),
                /must be between/i
            )
        })

        it('should reject invalid values for refresh frequency', function () {
            expect_yargs_error(
                () => argv_parser(['--listenkey', '1234567890123456', '-f', '10x']),
                /must be an integer/
            )
        })

        it('should reject invalid values for the VLC timeout', function () {
            expect_yargs_error(
                () => argv_parser(['--listenkey', '1234567890123456', '-t', '10x']),
                /must be an integer/
            )
        })

        it('should reject if a username is given but a password is not', function () {
            expect_yargs_error(
                () =>
                    argv_parser([
                        '--listenkey',
                        '1234567890123456',
                        '--username',
                        'test@example.local',
                    ]),
                /Missing dependent arguments/
            )
        })

        it('should reject if a password is given but a username is not', function () {
            expect_yargs_error(
                () => argv_parser(['--listenkey', '1234567890123456', '--password', '53cr37']),
                /Missing dependent arguments/
            )
        })

        it('should provide credentials if both username and password is set', function () {
            const result = argv_parser([
                '--listenkey',
                '1234567890123456',
                '-u',
                'test@example.local',
                '-w',
                '53cr37',
            ])

            expect(result).to.deep.include({
                di_listenkey: '1234567890123456',
                di_credentials: {
                    password: '53cr37',
                    username: 'test@example.local',
                },
            })

            expect(result).not.to.have.property('username')
            expect(result).not.to.have.property('password')
        })
    })
})
