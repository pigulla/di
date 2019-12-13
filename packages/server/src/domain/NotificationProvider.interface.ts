export interface INotificationProvider {
    send (title: string, message: string): void
}
