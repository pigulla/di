import {Injectable} from '@nestjs/common'

import {INotificationProvider} from '../../domain'

@Injectable()
export class NullNotificationProvider implements INotificationProvider {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public send (_title: string, _message: string): void {
    }
}
