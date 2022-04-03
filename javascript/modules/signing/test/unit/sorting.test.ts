import { JsonSignature } from "../../src";

describe("JSON normalized strings", () => {
  it("Should reorder JSON objects alphabetically", () => {
    let strA = JsonSignature.normalizedJsonString("abc");
    let strB = JsonSignature.normalizedJsonString("abc");
    expect(strA).toEqual(strB);

    strA = JsonSignature.normalizedJsonString(123);
    strB = JsonSignature.normalizedJsonString(123);
    expect(strA).toEqual(strB);

    strA = JsonSignature.normalizedJsonString({});
    strB = JsonSignature.normalizedJsonString({});
    expect(strA).toEqual(strB);

    strA = JsonSignature.normalizedJsonString({ a: 1, b: 2 });
    strB = JsonSignature.normalizedJsonString({ b: 2, a: 1 });
    expect(strA).toEqual(strB);

    strA = JsonSignature.normalizedJsonString({ a: 1, b: { c: 3, d: 4 } });
    strB = JsonSignature.normalizedJsonString({ b: { d: 4, c: 3 }, a: 1 });
    expect(strA).toEqual(strB);

    strA = JsonSignature.normalizedJsonString({
      a: 1,
      b: [{ a: 10, m: 10, z: 10 }, { b: 11, n: 11, y: 11 }, 4, 5],
    });
    strB = JsonSignature.normalizedJsonString({
      b: [{ z: 10, m: 10, a: 10 }, { y: 11, n: 11, b: 11 }, 4, 5],
      a: 1,
    });
    expect(strA).toEqual(strB);

    strA = JsonSignature.normalizedJsonString({ a: 1, b: [5, 4, 3, 2, 1, 0] });
    strB = JsonSignature.normalizedJsonString({ b: [5, 4, 3, 2, 1, 0], a: 1 });
    expect(strA).toEqual(strB);
  });
});

describe("JSON sorting", () => {
  it("Should reorder JSON objects alphabetically", () => {
    let strA = JSON.stringify(JsonSignature.sort("abc"));
    let strB = JSON.stringify(JsonSignature.sort("abc"));
    expect(strA).toEqual(strB);

    strA = JSON.stringify(JsonSignature.sort(123));
    strB = JSON.stringify(JsonSignature.sort(123));
    expect(strA).toEqual(strB);

    strA = JSON.stringify(JsonSignature.sort({}));
    strB = JSON.stringify(JsonSignature.sort({}));
    expect(strA).toEqual(strB);

    strA = JSON.stringify(JsonSignature.sort({ a: 1, b: 2 }));
    strB = JSON.stringify(JsonSignature.sort({ b: 2, a: 1 }));
    expect(strA).toEqual(strB);

    strA = JSON.stringify(JsonSignature.sort({ a: 1, b: { c: 3, d: 4 } }));
    strB = JSON.stringify(JsonSignature.sort({ b: { d: 4, c: 3 }, a: 1 }));
    expect(strA).toEqual(strB);

    strA = JSON.stringify(
      JsonSignature.sort({
        a: 1,
        b: [{ a: 10, m: 10, z: 10 }, { b: 11, n: 11, y: 11 }, 4, 5],
      })
    );
    strB = JSON.stringify(
      JsonSignature.sort({
        b: [{ z: 10, m: 10, a: 10 }, { y: 11, n: 11, b: 11 }, 4, 5],
        a: 1,
      })
    );
    expect(strA).toEqual(strB);

    strA = JSON.stringify(JsonSignature.sort({ a: 1, b: [5, 4, 3, 2, 1, 0] }));
    strB = JSON.stringify(JsonSignature.sort({ b: [5, 4, 3, 2, 1, 0], a: 1 }));
    expect(strA).toEqual(strB);
  });
});
