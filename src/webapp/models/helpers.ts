type Dispatch<A> = (val: A) => void;
export type SetMethod<T> = Dispatch<T | ((prevState: T) => T)>;
