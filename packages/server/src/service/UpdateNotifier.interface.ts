export type UpdateCallback<T> = (value: T) => void;

export interface IUpdateNotifier<T> {
    on_update (callback: UpdateCallback<T>, context?: any): void
}
