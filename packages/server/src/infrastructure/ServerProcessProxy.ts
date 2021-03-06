import {Injectable} from '@nestjs/common'

import {IServerProcessProxy} from '../domain'

@Injectable()
export class ServerProcessProxy implements IServerProcessProxy {
    private readonly process: NodeJS.Process

    public constructor(process: NodeJS.Process) {
        process.argv = []
        this.process = process
    }

    public terminate(): void {
        this.process.kill(this.process.pid, 'SIGTERM')
    }
}
