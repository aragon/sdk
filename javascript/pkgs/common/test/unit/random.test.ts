import { Random } from "../../src";

describe("Random generation", () => {
  it("Should generate a random buffer from given length", () => {
    const bytes = Random.getBytes(8);

    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(bytes.length).toEqual(8);
  });
  it("Should generate a random hex", () => {
    const hex = Random.getHex();

    expect(typeof hex).toEqual("string");
    expect(hex.substring(0, 2)).not.toEqual("0x");
    expect(hex.length).toEqual(64);
  });
  it("Should generate a random bigint", () => {
    const bigint = Random.getBigInt(BigInt(256));

    expect(typeof bigint).toEqual("bigint");
  });
  it("Should shuffle an array in random order", () => {
    const nums = [1, 2, 3, 4];
    const shuffled = Random.shuffle(nums);

    expect(Array.isArray(shuffled)).toBeTruthy();
    expect(shuffled.length).toEqual(nums.length);
    expect(shuffled).toEqual(nums);
  });
});
