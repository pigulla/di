import {INotificationProvider} from '../../domain'

export class NullNotificationProvider implements INotificationProvider {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public send (_title: string, _message: string): void {
    }
}
