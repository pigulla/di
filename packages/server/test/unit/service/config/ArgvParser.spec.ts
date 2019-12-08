import {expect} from 'chai'
import hook_std, {HookPromise} from 'hook-std'

import {create_argv_parser, IArgvParser} from '@src/service/config'
import {Quality} from '@src/service/di'

function expect_yargs_error (cb: Function, message: RegExp): void {
    try {
        cb()
        expect(false, 'Function should have thrown').to.be.true
    } catch (error) {
        expect(error.name).to.equal('YError')
        expect(error.message).to.match(message)
    }
}

describe('The ArgvParser', function () {
    let unhook_promise: HookPromise

    beforeEach(function () {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        unhook_promise = hook_std.stderr(_output => {})
    })

    afterEach(async function () {
        unhook_promise.unhook()
        await unhook_promise
    })

    describe('with the VLC binary check enabled', function () {
        it('should use the default value', function () {
            const argv_parser = create_argv_parser({
                skip_vlc_validation: false,
                auto_exit: false,
                default_vlc_binary: null,
            })

            expect_yargs_error(
                () => argv_parser(['--listenkey', '1234567890123456']),
                /executable could not be auto detected/i,
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
                /executable not found/i,
            )
        })
    })

    describe('with the VLC binary check disabled', function () {
        let argv_parser: IArgvParser

        beforeEach(function () {
            argv_parser = create_argv_parser({
                skip_vlc_validation: true,
                auto_exit: false,
                default_vlc_binary: null,
            })
        })

        it('should work with minimal options', function () {
            const result = argv_parser(['--listenkey', '1234567890123456'])
            expect(result.listenkey).to.equal('1234567890123456')
        })

        it('should parse all options', function () {
            const result = argv_parser([
                '--listenkey', '1234567890123456',
                '-f', '42',
                '--url', 'http://www.di.fm.local/streams',
                '-q', Quality.AAC_64,
                '--vlc-path', '/usr/local/bin/vlc',
                '-t', '1234',
                '-i', '0.77',
            ])

            expect(result).to.include({
                listenkey: '1234567890123456',
                frequency: 42,
                url: 'http://www.di.fm.local/streams',
                quality: Quality.AAC_64,
                vlcPath: '/usr/local/bin/vlc',
                vlcTimeout: 1234,
                vlcInitialVolume: 0.77,
            })
        })

        it('should require a listenkey', function () {
            expect_yargs_error(
                () => argv_parser(['--quality', Quality.AAC_128]),
                /listenkey/i,
            )
        })

        it('should reject unknown options', function () {
            expect_yargs_error(
                () => argv_parser(['--listenkey', '1234567890123456', '--foo']),
                /Unknown argument/i,
            )
        })

        it('should reject invalid values for DI listenkey', function () {
            expect_yargs_error(
                () => argv_parser(['--listenkey', 'zz34567890123456']),
                /listenkey/i,
            )
        })

        it('should reject invalid values for the server port', function () {
            expect_yargs_error(
                () => argv_parser(['--listenkey', 'zz34567890123456', '--port', 'x']),
                /must be an integer/i,
            )
        })

        it('should reject out-of-bound values for the server port', function () {
            expect_yargs_error(
                () => argv_parser(['--listenkey', 'zz34567890123456', '--port', '100000']),
                /must be below/i,
            )
        })

        it('should reject invalid values for VLC initial volume', function () {
            expect_yargs_error(
                () => argv_parser(['--listenkey', '1234567890123456', '--vlc-initial-volume', '1.1.5']),
                /floating point number/i,
            )
        })

        it('should reject out-of-bound values for VLC initial volume', function () {
            expect_yargs_error(
                () => argv_parser(['--listenkey', '1234567890123456', '--vlc-initial-volume', '1.5']),
                /must be between/i,
            )
        })

        it('should reject invalid values for refresh frequency', function () {
            expect_yargs_error(
                () => argv_parser(['--listenkey', '1234567890123456', '-f', '10x']),
                /must be an integer/,
            )
        })

        it('should reject invalid values for the VLC timeout', function () {
            expect_yargs_error(
                () => argv_parser(['--listenkey', '1234567890123456', '-t', '10x']),
                /must be an integer/,
            )
        })

        it('should reject if a username is given but a password is not', function () {
            expect_yargs_error(
                () => argv_parser(['--listenkey', '1234567890123456', '--username', 'test@example.local']),
                /Missing dependent arguments/,
            )
        })

        it('should reject if a password is given but a username is not', function () {
            expect_yargs_error(
                () => argv_parser(['--listenkey', '1234567890123456', '--password', '53cr37']),
                /Missing dependent arguments/,
            )
        })

        it('should provide credentials if both username and password is set', function () {
            const result = argv_parser([
                '--listenkey', '1234567890123456',
                '-u', 'test@example.local',
                '-w', '53cr37',
            ])

            expect(result).to.deep.include({
                listenkey: '1234567890123456',
                credentials: {
                    password: '53cr37',
                    username: 'test@example.local',
                },
            })

            expect(result).not.to.have.property('username')
            expect(result).not.to.have.property('password')
        })
    })
})
