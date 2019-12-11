import {INotifier} from './Notifier.interface'

export class StderrNotifier implements INotifier {
    public send (title: string, message: string): void {
        process.stderr.write(`[${title}] ${message}`)
    }
}
