import {CLIError} from '@oclif/errors'

import {ClientError, ServerNotRunningError, ChannelNotFoundError} from '@digitally-imported/client'

import BaseCommand from './base'

// eslint-disable-next-line @typescript-eslint/naming-convention
export function HandleClientError(): MethodDecorator {
    return function handle_client_error_decorator(
        this: BaseCommand,
        _target: unknown,
        _property_key: string | symbol,
        descriptor: PropertyDescriptor
    ): void {
        const method: (...args: any[]) => any = descriptor.value

        descriptor.value = async function wrapper(...args: any[]) {
            try {
                return await method.apply(this, args)
            } catch (error) {
                if (error instanceof ServerNotRunningError) {
                    throw new CLIError('Server not running', {exit: 2})
                } else if (error instanceof ChannelNotFoundError) {
                    throw new CLIError(`Channel "${error.channel_key}" not found`, {exit: 3})
                } else if (error instanceof ClientError) {
                    throw new CLIError(`An error occurred (${error.message})`, {exit: 99})
                } else {
                    throw error
                }
            }
        }
    }
}
