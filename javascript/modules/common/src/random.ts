import { bytesToHex } from "./encoding";

export namespace Random {
  /**
   * Generates a random buffer of the given length
   */
  export function getBytes(count: number): Uint8Array {
    if (typeof window?.crypto?.getRandomValues == "function") {
      // Browser
      const buff = new Uint8Array(count);
      window.crypto.getRandomValues(buff);
      return buff;
    } else if (
      // NodeJS
      typeof process !== "undefined" &&
      typeof require !== "undefined" &&
      typeof require("crypto")?.randomBytes !== "undefined"
    ) {
      return new Uint8Array(require("crypto").randomBytes(count));
    }

    // other environments (fallback)
    const result: number[] = [];
    for (let i = 0; i < count; i++) {
      const val = (Math.random() * 256) | 0;
      result.push(val);
    }
    return new Uint8Array(result);
  }

  /**
   * Generates a 32 byte random buffer and returns it as a hex string
   */
  export function getHex(): string {
    const bytes = getBytes(32);
    return bytesToHex(bytes);
  }

  /**
   * Generates a random big integer, ranging from `0n` to `maxValue - 1`
   */
  export function getBigInt(maxValue: bigint): bigint {
    const step = BigInt("256");
    let result = BigInt("0");
    let nextByte: number;
    let nextValue: bigint;

    while (true) {
      nextByte = getBytes(1)[0];
      nextValue = result * step + BigInt(nextByte);

      if (nextValue > maxValue) {
        // already reached maxValue
        return nextValue % maxValue;
      }
      // accumulate bytes
      result = nextValue;
    }
  }

  /**
   * Generates a random decimal number, ranging from `0` to `1`
   */
  export function getFloat(): number {
    const MAX_BI = "100000000000000000000";
    const digits = Random.getBigInt(BigInt(MAX_BI));

    return Number("0." + digits);
  }

  /**
   * Shuffles the given array and returns it
   */
  export function shuffle<T>(array: T[]): T[] {
    let temporaryValue: T, idx: number;
    let currentIndex = array.length;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
      // Pick a remaining element...
      idx = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[idx];
      array[idx] = temporaryValue;
    }

    return array;
  }
}
