import {expect} from 'chai'

import {Command, ParseError} from '@server/service/playback/vlc'

class ConcreteCommand extends Command<[any, any], any> {
    protected pre_parse_validation (response: string[]): void {
        if (response.includes('INVALID')) {
            throw new ParseError('invalid')
        }
    }

    protected do_parse (response: string[]): any {
        return response.reverse().join('|')
    }
}

describe('The Command base class', function () {
    it('should infer the correct command name', function () {
        const command = new ConcreteCommand()
        expect(command.command).to.equal('concrete_command')
    })

    it('should be able to override the command name', function () {
        const command = new ConcreteCommand({command: 'my-command'})
        expect(command.command).to.equal('my-command')
    })

    it('should build the argument string', function () {
        const command = new ConcreteCommand()
        expect(command.build_arg_string([42, true])).to.equal('42 true')
    })

    it('should throw if the response has the incorrect length', function () {
        const command = new ConcreteCommand({expected_result_length: 2})
        expect(() => command.parse(['foo'])).to.throw(ParseError)
    })

    it('should throw if the pre-parse-validation fails', function () {
        const command = new ConcreteCommand()
        expect(() => command.parse(['foo', 'INVALID'])).to.throw(ParseError)
    })

    it('should parse the response', function () {
        const command = new ConcreteCommand()
        const result = command.parse(['foo', 'bar', 'baz'])

        expect(result).to.equal('baz|bar|foo')
    })
})
