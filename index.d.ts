type Unsubscriber = () => void;
type Subscriber<T> = (data: T) => any;
type Setter<T> = (prev: T) => any;
type ComputeMethod<T> = (values: T[]) => any;

type Store<T> = {
    (): T;
    (value: T): void;
    (setter: Setter): void;

    sub: (subscriber: Subscriber<T>, initialCall: any) => Unsubscriber;
    end: () => void;
};

export function store<T>(init: T, clone: (value: T) => T): Store<T>;
export function computed<T>(stores: Store<any>[], compute: ComputeMethod<any>): Store<T>;