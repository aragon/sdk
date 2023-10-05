/**
 * This function emulates the Promise.allSettled()
 *
 * @param proms
 */
export function allSettled(
  proms: Array<Promise<any>>,
): Promise<
  Array<{ value: any; status: string } | { reason: Error; status: string }>
> {
  return Promise.all(proms.map(reflect));
}

/**
 * 
 *
 * @template T
 * @param {Promise<T>} prom
 * @return {*}
 * @deprecated 
 */
function reflect<T>(prom: Promise<T>) {
  return prom
    .then((value: T) => ({ value, status: "fulfilled" }))
    .catch((reason: T) => ({ reason, status: "rejected" }));
}

export async function runAndRetry<T>({ func, onFail, shouldRetry }: {
  func: () => Promise<T>;
  onFail?: (e: Error) => void;
  shouldRetry: () => boolean;
}) {
  let lastErr: Error;
  do {
    try {
      const result = await func();
      // it worked
      return result;
    } catch (err) {
      lastErr = err as Error;
      if (typeof onFail === "function") {
        onFail(err as Error);
      }
    }
  } while (shouldRetry());

  // all the iterations failed
  throw lastErr;
}
