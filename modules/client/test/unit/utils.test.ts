// @ts-ignore
declare const describe, it, expect;

import { bitmapToBoolArray, boolArrayToBitmap } from "../../src";

function getEmpty256Array() {
  return new Array(256).fill(false);
}

describe("Utilities", () => {
  it("boolArrayToBitmap should transform a boolean array into a bigint bitmap", () => {
    const tests = [
      { input: undefined, output: BigInt(0) },
      { input: [], output: BigInt(0) },
      { input: [false], output: BigInt(0) },
      { input: [true], output: BigInt(1) },
      { input: [true, false], output: BigInt(2) },
      { input: [false, true, false, true], output: BigInt(10) },
      { input: getEmpty256Array(), output: BigInt(0) },
    ];
    let input = getEmpty256Array();
    input[100] = true;
    tests.push({ input, output: BigInt(1) << BigInt(100) });

    input = getEmpty256Array();
    input[150] = true;
    tests.push({ input, output: BigInt(1) << BigInt(150) });

    for (const entry of tests) {
      expect(boolArrayToBitmap(entry.input)).toEqual(entry.output);
    }
  });

  it("boolArrayToBitmap should fail when the array is too large", () => {
    expect(() => {
      let tmp = getEmpty256Array();
      tmp.push(false);
      boolArrayToBitmap(tmp);
    }).toThrow();
  });

  it("bitmapToBoolArray should transform a bigint bitmap into a boolean array", () => {
    const tests = [
      { input: BigInt(0), output: getEmpty256Array() },
    ];
    let output = getEmpty256Array();
    output[0] = true;
    tests.push({ input: BigInt(1) << BigInt(0), output });

    output = getEmpty256Array();
    output[1] = true;
    tests.push({ input: BigInt(1) << BigInt(1), output });

    output = getEmpty256Array();
    output[2] = true;
    tests.push({ input: BigInt(1) << BigInt(2), output });

    output = getEmpty256Array();
    output[5] = true;
    tests.push({ input: BigInt(1) << BigInt(5), output });

    output = getEmpty256Array();
    output[100] = true;
    tests.push({ input: BigInt(1) << BigInt(100), output });

    output = getEmpty256Array();
    output[150] = true;
    tests.push({ input: BigInt(1) << BigInt(150), output });

    for (const entry of tests) {
      expect(bitmapToBoolArray(entry.input)).toDeepEqual(entry.output);
    }
  });

  it("bitmapToBoolArray should fail when the bigint is too large", () => {
    expect(() => {
      bitmapToBoolArray(BigInt(1) << BigInt(256));
    }).toThrow();
  });
});
