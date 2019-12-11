import {INotifier} from './Notifier.interface'

export class NullNotifier implements INotifier {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public send (_title: string, _message: string): void {
    }
}
