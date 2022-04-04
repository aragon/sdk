/**
 * This function emulates the Promise.allSettled()
 *
 * @param proms
 */
export function allSettled(
  proms: Array<Promise<any>>
): Promise<
  Array<{ value: any; status: string } | { reason: Error; status: string }>
> {
  return Promise.all(proms.map(reflect));
}

function reflect<T>(prom: Promise<T>) {
  return prom
    .then((value: T) => ({ value, status: "fulfilled" }))
    .catch((reason: T) => ({ reason, status: "rejected" }));
}

/**
 * A new instance of deferred is constructed by calling `new DeferredPromse<T>()`.
 * The purpose of the deferred object is to expose the associated Promise
 * instance APIs that can be used for signaling the successful
 * or unsuccessful completion, as well as the state of the task.
 * @export
 * @class DeferredPromise
 * @implements {Promise<T>}
 * @template T
 * @example
 * const deferred = new DeferredPromse<string>();
 * console.log(deferred.state); // 'pending'
 *
 * deferred
 * .then(str => console.log(str))
 * .catch(err => console.error(err));
 *
 * deferred.resolve('Foo');
 * console.log(deferred.state); // 'fulfilled'
 * // deferred.reject('Bar');
 */
export class DeferredPromise<T> {
  [Symbol.toStringTag]: 'Promise';

  private _promise: Promise<T>;
  private _resolve: (value: T | PromiseLike<T>) => void;
  private _reject: (reason?: any) => void
  private _state: 'pending' | 'fulfilled' | 'rejected' = 'pending';

  public get state(): 'pending' | 'fulfilled' | 'rejected' {
    return this._state;
  }

  constructor() {
    this._resolve = () => {}
    this._reject = () => {}
    this._promise = new Promise<T>((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
  }

  public then<TResult1, TResult2>(
      onfulfilled?: (value: T) => TResult1 | PromiseLike<TResult1>,
      onrejected?: (reason: any) => TResult2 | PromiseLike<TResult2>)
      : Promise<TResult1 | TResult2> {
    return this._promise.then(onfulfilled, onrejected);
  }

  public catch<TResult>(onrejected?: (reason: any) => TResult | PromiseLike<TResult>): Promise<T | TResult> {
    return this._promise.catch(onrejected);
  }

  public resolve(value: T | PromiseLike<T>): void {
    this._resolve(value);
    this._state = 'fulfilled';
  }

  public reject(reason?: any): void {
    this._reject(reason);
    this._state = 'rejected';
  }
}
