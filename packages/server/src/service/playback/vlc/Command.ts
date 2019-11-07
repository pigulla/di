import snake_case from 'lodash.snakecase'
import {ControlError} from '@server/service/playback/vlc/ControlError'

export class ParseError extends ControlError {
    public constructor (message: string) {
        super(`Parse error: ${message}`)
    }
}

interface Options {
    // The name of the command to execute (as defined by VLC). If not set it is inferred by snake-casing the class name.
    command?: string

    // If set, fail the pre-parse check if the number of lines returned from VLC does not match.
    expected_result_length?: number
}

/**
 * The base class for VLC commands.
 */
export abstract class Command<Params extends any[], Result> {
    public readonly command: string
    public readonly options: Readonly<Omit<Options, 'command'>>

    public constructor (options: Partial<Options> = {}) {
        const {command, ...opts} = Object.assign({}, {
            command: snake_case(this.constructor.name),
            expected_result_length: undefined,
        }, options)

        this.command = command
        this.options = opts
    }

    /**
     * Parse the response returned from VLC.
     *
     * @param response
     */
    protected abstract do_parse (response: string[]): Result

    /**
     * Implement this function to perform basic sanity checks on the response before parse() is called.
     *
     * @param response
     */
    protected pre_parse_validation (_response: string[]): void {
        // empty default implementation
    }

    /**
     * Convert the parameter array to the string actually sent to VLC. Default implementation is to coerce each item
     * to string and join them by space.
     *
     * @param args
     */
    public build_arg_string (args: Params): string {
        return args.map(arg => String(arg)).join(' ')
    }

    /**
     * Perform the sanity checks on the response and then parse it.
     *
     * @param response
     */
    public parse (response: string[]): Result {
        const expected_length = this.options.expected_result_length
        if (expected_length !== undefined && response.length !== expected_length) {
            throw new ParseError('Unexpected response length')
        }

        this.pre_parse_validation(response)
        return this.do_parse(response)
    }
}

/**
 * Simplified class for commands that do not expect a response from VLC.
 */
export abstract class NoResultVlcCommand<Params extends any[]> extends Command<Params, void> {
    public constructor (options: Partial<Options> = {}) {
        const opts = Object.assign({}, {
            expected_result_length: 0,
        }, options)

        super(opts)
    }

    protected do_parse (_response: string[]): void {
        return undefined
    }
}
