type Unsubscriber = () => void;
type Subscriber<T> = (data: T) => any;
type Setter<T> = (prev: T) => any;
type ComputeMethod<T> = () => T;

type Store<T> = {
    (): T;
    (value: T): void;
    (setter: Setter): void;

    sub: (subscriber: Subscriber<T>, run: any) => Unsubscriber;
    end: () => void;
};

export function store<T>(init: T): Store<T>;
export function setClone(clone: (value: T) => T): void;
export function computed<T>(compute: ComputeMethod<any>): Store<T>;