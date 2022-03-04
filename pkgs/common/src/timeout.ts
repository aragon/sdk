import { TimeoutError } from "./errors";

/**
 * @param func The promise-returning function to invoke
 * @param timeout Timeout (in seconds) to wait before failing
 * @param timeoutMessage (optional) Message to use when throwing a timeout error
 */
export function promiseFuncWithTimeout<T>(
  func: () => Promise<T>,
  timeout: number,
  timeoutMessage?: string
): Promise<T> {
  if (typeof func !== "function") throw new Error("Invalid function");
  else if (isNaN(timeout) || timeout < 0) throw new Error("Invalid timeout");

  return new Promise((resolve, reject) => {
    setTimeout(
      () => reject(new TimeoutError(timeoutMessage || "Time out")),
      timeout
    );

    return func()
      .then(result => resolve(result))
      .catch(err => reject(err));
  });
}

/**
 * @param prom The promise to track
 * @param timeout Timeout (in milliseconds) to wait before failing
 * @param timeoutMessage (optional) Message to use when throwing a timeout error. By default: `"Time out"`
 */
export function promiseWithTimeout<T>(
  prom: Promise<T>,
  timeout: number,
  timeoutMessage?: string
): Promise<T> {
  if (
    !prom ||
    typeof prom.then !== "function" ||
    typeof prom.catch !== "function"
  ) {
    throw new Error("Invalid promise");
  } else if (isNaN(timeout) || timeout < 0) throw new Error("Invalid timeout");

  return new Promise((resolve, reject) => {
    setTimeout(
      () => reject(new TimeoutError(timeoutMessage || "Time out")),
      timeout
    );

    return prom.then(result => resolve(result)).catch(err => reject(err));
  });
}
