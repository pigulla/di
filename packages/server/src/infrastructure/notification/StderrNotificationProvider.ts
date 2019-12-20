import {Injectable} from '@nestjs/common'

import {INotificationProvider} from '../../domain'

@Injectable()
export class StderrNotificationProvider implements INotificationProvider {
    public send (title: string, message: string): void {
        process.stderr.write(`[${title}] ${message}`)
    }
}
