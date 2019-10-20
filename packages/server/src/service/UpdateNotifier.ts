export type UpdateCallback<T> = (value: T) => void;

export interface UpdateNotifier<T> {
    on_update (callback: UpdateCallback<T>, context?: any): void
}
