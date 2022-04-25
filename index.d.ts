type Unsubscriber = () => void;
type Subscriber<T> = (data: T) => any;
type Setter<T> = (prev: T) => T;
type ComputeMethod<T> = (values: T[]) => T

type Store<T> = {
    get: () => T;
    listen: (subscriber: Subscriber<T>) => Unsubscriber;
    sub: (subscriber: Subscriber<T>) => Unsubscriber;
    set: (value: T | Setter<T>) => void;
    end: () => void;
};

export function store<T>(init: T): Store<T>;
export function computed<T>(stores: Store<T>[], compute: ComputeMethod<T>): Store<T>;