import {ClientError} from './ClientError'

export class ServerNotRunningError extends ClientError {
    public constructor() {
        super('Server not running or connection refused')
    }
}
