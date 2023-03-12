type Unsubscriber = () => void;
type Subscriber<T> = (data: T) => any;
type Setter<T> = (prev: T) => any;
type ComputeMethod<T> = () => T;

type Store<T> = {
    (): T;
    (value: T): void;
    (setter: Setter<T>): void;

    sub: (subscriber: Subscriber<T>, run: any) => Unsubscriber;
    end: () => void;
};

export interface store {
    (init: T): Store<T>;
};

export function computed<T>(compute: ComputeMethod<unknown>): Store<T>;