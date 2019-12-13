import {INotificationProvider} from '../../domain'

export class StderrNotificationProvider implements INotificationProvider {
    public send (title: string, message: string): void {
        process.stderr.write(`[${title}] ${message}`)
    }
}
