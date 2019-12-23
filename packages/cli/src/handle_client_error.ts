import {CLIError} from '@oclif/errors'
import {ClientError, ServerNotRunningError, ChannelNotFoundError} from '@digitally-imported/client'

export default function handle_client_error (error: Error): never {
    if (error instanceof ServerNotRunningError) {
        throw new CLIError('Server not running', {exit: 2})
    } else if (error instanceof ChannelNotFoundError) {
        throw new CLIError(`Channel "${error.channel_key}" not found`, {exit: 3})
    } else if (error instanceof ClientError) {
        throw new CLIError('An error occurred', {exit: 99})
    } else {
        throw error
    }
}
