import {
  bigIntToBuffer,
  bigIntToLeBuffer,
  bitmapToBoolArray,
  boolArrayToBitmap,
  bufferLeToBigInt,
  bufferToBigInt,
  bytesToHex,
  decodeProposalId,
  decodeRatio,
  encodeProposalId,
  encodeRatio,
  ensure0x,
  hexToBytes,
  strip0x,
} from "../../src";

describe("Value encoding", () => {
  it("Should convert hex strings to a buffer", () => {
    const inputs = [
      { hex: "0x00", serializedBuffer: "0" },
      { hex: "0x10", serializedBuffer: "16" },
      { hex: "0xff", serializedBuffer: "255" },
      { hex: "0xffffffff", serializedBuffer: "255,255,255,255" },
      {
        hex: "0xaaaaaaaaaaaaaaaa",
        serializedBuffer: "170,170,170,170,170,170,170,170",
      },
      { hex: "00", serializedBuffer: "0" },
      { hex: "10", serializedBuffer: "16" },
      { hex: "ff", serializedBuffer: "255" },
      { hex: "ffffffff", serializedBuffer: "255,255,255,255" },
      {
        hex: "aaaaaaaaaaaaaaaa",
        serializedBuffer: "170,170,170,170,170,170,170,170",
      },
    ];

    for (let input of inputs) {
      const result = hexToBytes(input.hex);
      expect(result.join(",")).toEqual(input.serializedBuffer);
    }
  });

  it("Should convert Uint8Array's into hex strings", () => {
    const items = [
      { buffer: new Uint8Array([]), skip0x: false, output: "0x" },
      { buffer: new Uint8Array([]), skip0x: true, output: "" },
      { buffer: new Uint8Array([0]), skip0x: false, output: "0x00" },
      { buffer: new Uint8Array([0]), skip0x: true, output: "00" },
      { buffer: new Uint8Array([1]), skip0x: false, output: "0x01" },
      { buffer: new Uint8Array([1]), skip0x: true, output: "01" },
      {
        buffer: new Uint8Array([
          10,
          20,
          30,
          40,
          50,
          60,
          70,
          80,
          90,
          100,
          200,
          250,
          255,
        ]),
        skip0x: false,
        output: "0x0a141e28323c46505a64c8faff",
      },
      {
        buffer: new Uint8Array([
          10,
          20,
          30,
          40,
          50,
          60,
          70,
          80,
          90,
          100,
          200,
          250,
          255,
        ]),
        skip0x: true,
        output: "0a141e28323c46505a64c8faff",
      },
      {
        buffer: new Uint8Array([100, 100, 100, 100, 100, 100]),
        skip0x: false,
        output: "0x646464646464",
      },
      {
        buffer: new Uint8Array([100, 100, 100, 100, 100, 100]),
        skip0x: true,
        output: "646464646464",
      },
      { buffer: new Uint8Array([0, 255]), skip0x: false, output: "0x00ff" },
      { buffer: new Uint8Array([0, 255]), skip0x: true, output: "00ff" },
    ];

    for (let item of items) {
      const hex = bytesToHex(item.buffer, item.skip0x);
      expect(hex).toEqual(item.output);
    }
  });

  it("Should convert big integers into a buffer", () => {
    const inputs = [
      {
        bigint: BigInt("0"),
        hexBuffer:
          "0000000000000000000000000000000000000000000000000000000000000000",
      },
      {
        bigint: BigInt("1"),
        hexBuffer:
          "0000000000000000000000000000000000000000000000000000000000000001",
      },
      {
        bigint: BigInt("10"),
        hexBuffer:
          "000000000000000000000000000000000000000000000000000000000000000a",
      },
      {
        bigint: BigInt("16"),
        hexBuffer:
          "0000000000000000000000000000000000000000000000000000000000000010",
      },
      {
        bigint: BigInt("100"),
        hexBuffer:
          "0000000000000000000000000000000000000000000000000000000000000064",
      },
      {
        bigint: BigInt("10000"),
        hexBuffer:
          "0000000000000000000000000000000000000000000000000000000000002710",
      },
      {
        bigint: BigInt("20000"),
        hexBuffer:
          "0000000000000000000000000000000000000000000000000000000000004e20",
      },
      {
        bigint: BigInt("5000000000000"),
        hexBuffer:
          "0000000000000000000000000000000000000000000000000000048c27395000",
      },
      {
        bigint: BigInt("999999999999999999999999999999999"),
        hexBuffer:
          "000000000000000000000000000000000000314dc6448d9338c15b09ffffffff",
      },
      {
        bigint: BigInt(
          "111122223333444455556666777788889999000011112222333344445555666677778888999900",
        ),
        hexBuffer:
          "f5acf316aa2c0d4e6a464693f94789be9b15ba0ece586181679a3215e03f43dc",
      },
    ];

    for (let input of inputs) {
      const result = bigIntToBuffer(input.bigint);
      expect(Buffer.from(result).toString("hex")).toEqual(input.hexBuffer);

      const leResult = bigIntToLeBuffer(input.bigint);
      expect(Buffer.from(leResult).reverse().toString("hex")).toEqual(
        input.hexBuffer,
      );
    }
  });

  it("Should convert buffers into big integers", () => {
    const inputs = [
      {
        bigint: BigInt("0"),
        hexBuffer:
          "0000000000000000000000000000000000000000000000000000000000000000",
      },
      {
        bigint: BigInt("1"),
        hexBuffer:
          "0000000000000000000000000000000000000000000000000000000000000001",
      },
      {
        bigint: BigInt("10"),
        hexBuffer:
          "000000000000000000000000000000000000000000000000000000000000000a",
      },
      {
        bigint: BigInt("16"),
        hexBuffer:
          "0000000000000000000000000000000000000000000000000000000000000010",
      },
      {
        bigint: BigInt("100"),
        hexBuffer:
          "0000000000000000000000000000000000000000000000000000000000000064",
      },
      {
        bigint: BigInt("10000"),
        hexBuffer:
          "0000000000000000000000000000000000000000000000000000000000002710",
      },
      {
        bigint: BigInt("20000"),
        hexBuffer:
          "0000000000000000000000000000000000000000000000000000000000004e20",
      },
      {
        bigint: BigInt("5000000000000"),
        hexBuffer:
          "0000000000000000000000000000000000000000000000000000048c27395000",
      },
      {
        bigint: BigInt("999999999999999999999999999999999"),
        hexBuffer:
          "000000000000000000000000000000000000314dc6448d9338c15b09ffffffff",
      },
      {
        bigint: BigInt(
          "111122223333444455556666777788889999000011112222333344445555666677778888999900",
        ),
        hexBuffer:
          "f5acf316aa2c0d4e6a464693f94789be9b15ba0ece586181679a3215e03f43dc",
      },
    ];

    for (let input of inputs) {
      const result = bufferToBigInt(Buffer.from(input.hexBuffer, "hex"));
      expect(result).toEqual(input.bigint);

      const result2 = bufferLeToBigInt(
        Buffer.from(input.hexBuffer, "hex").reverse(),
      );
      expect(result2).toEqual(input.bigint);
    }
  });

  it("Should strip 0x prefixes", () => {
    const inputs = [
      // strip
      { in: "0x0", out: "0" },
      { in: "0x00", out: "00" },
      { in: "0x1234", out: "1234" },
      { in: "0x55555555555555555555", out: "55555555555555555555" },
      // skip
      { in: "1234", out: "1234" },
      { in: "abcd", out: "abcd" },
      { in: "1234567890abcdef", out: "1234567890abcdef" },
    ];

    for (let input of inputs) {
      const result = strip0x(input.in);
      expect(result).toEqual(input.out);
    }
  });

  it("Should ensure 0x prefixes", () => {
    const inputs = [
      // strip
      { in: "0", out: "0x0" },
      { in: "00", out: "0x00" },
      { in: "1234", out: "0x1234" },
      { in: "55555555555555555555", out: "0x55555555555555555555" },
      // skip
      { in: "0x1234", out: "0x1234" },
      { in: "0xabcd", out: "0xabcd" },
      { in: "0x1234567890abcdef", out: "0x1234567890abcdef" },
    ];

    for (let input of inputs) {
      const result = ensure0x(input.in);
      expect(result).toEqual(input.out);
    }
  });

  it("Should return an integer encoded from a float between 1 and 0 and a positive integer number of digits", () => {
    expect(() => encodeRatio(-0.5, 4)).toThrow(
      "The ratio value should range between 0 and 1",
    );
    expect(() => encodeRatio(5, 4)).toThrow(
      "The ratio value should range between 0 and 1",
    );
    expect(() => encodeRatio(0.5, -1)).toThrow(
      "The number of digits should range between 1 and 15",
    );
    expect(() => encodeRatio(0.5, 18)).toThrow(
      "The number of digits should range between 1 and 15",
    );

    const inputs = [
      { in: [0.5, 1], out: 5 },
      { in: [0.5, 4], out: 5000 },
      { in: [0.5, 10], out: 5000000000 },
      { in: [0.25, 1], out: 3 },
      { in: [0.25, 2], out: 25 },
      { in: [0.251, 2], out: 25 },
      { in: [0.251, 3], out: 251 },
      { in: [0.25, 4], out: 2500 },
      { in: [0.25, 10], out: 2500000000 },
    ];

    for (let input of inputs) {
      const result = encodeRatio(input.in[0], input.in[1]);
      expect(result).toEqual(input.out);
    }
  });

  it("Should decode a float from a given bigint and a number of digits", () => {
    expect(() => encodeRatio(0.5, -1)).toThrow(
      "The number of digits should range between 1 and 15",
    );
    expect(() => encodeRatio(0.5, 18)).toThrow(
      "The number of digits should range between 1 and 15",
    );

    const inputs = [
      { bigint: BigInt(5), digits: 1, out: 0.5 },
      { bigint: BigInt(5456), digits: 4, out: 0.5456 },
      { bigint: 5, digits: 1, out: 0.5 },
      { bigint: 5456, digits: 4, out: 0.5456 },
      { bigint: BigInt("1"), digits: 9, out: 0.000000001 },
      { bigint: BigInt("367483947"), digits: 9, out: 0.367483947 },
      { bigint: 1, digits: 9, out: 0.000000001 },
      { bigint: 367483947, digits: 9, out: 0.367483947 },
    ];

    for (let input of inputs) {
      const result = decodeRatio(input.bigint, input.digits);
      expect(result).toEqual(input.out);
    }

    expect(() => decodeRatio(Number.MAX_SAFE_INTEGER + 1, 12)).toThrow(
      "The value is out of range",
    );
    expect(() => decodeRatio(BigInt("512345898367483947"), 12)).toThrow(
      "The value is out of range",
    );
    expect(() => decodeRatio(10 ** 2, 1)).toThrow("The value is out of range");
    expect(() => decodeRatio(10 ** 10, 9)).toThrow("The value is out of range");
  });

  it("Should encode a nonce-based proposalId", () => {
    const entries = [
      {
        addr: "0x0000000000000000000000000000000000000000",
        nonce: 0,
        output:
          "0x0000000000000000000000000000000000000000000000000000000000000000",
      },
      {
        addr: "0x0000000000000000000000000000000000000000",
        nonce: 1,
        output:
          "0x0000000000000000000000000000000000000000000000000000000000000001",
      },
      {
        addr: "0x1111111111111111111111111111111111111111",
        nonce: 1,
        output:
          "0x1111111111111111111111111111111111111111000000000000000000000001",
      },
      {
        addr: "0x1111111111111111111111111111111111111111",
        nonce: 10,
        output:
          "0x111111111111111111111111111111111111111100000000000000000000000a",
      },
      {
        addr: "0x1111111111111111111111111111111111111111",
        nonce: 15,
        output:
          "0x111111111111111111111111111111111111111100000000000000000000000f",
      },
      {
        addr: "0x1111111111111111111111111111111111111111",
        nonce: 16,
        output:
          "0x1111111111111111111111111111111111111111000000000000000000000010",
      },
      {
        addr: "0x1111111111111111111111111111111111111111",
        nonce: 1 << 24,
        output:
          "0x1111111111111111111111111111111111111111000000000000000001000000",
      },
    ];

    for (const entry of entries) {
      expect(encodeProposalId(entry.addr, entry.nonce)).toBe(entry.output);
    }
  });

  it("Should decode a nonce-based proposalId", () => {
    const entries = [
      {
        input:
          "0x0000000000000000000000000000000000000000000000000000000000000000",
        addr: "0x0000000000000000000000000000000000000000",
        nonce: 0,
      },
      {
        input:
          "0x0000000000000000000000000000000000000000000000000000000000000001",
        addr: "0x0000000000000000000000000000000000000000",
        nonce: 1,
      },
      {
        input:
          "0x1111111111111111111111111111111111111111000000000000000000000001",
        addr: "0x1111111111111111111111111111111111111111",
        nonce: 1,
      },
      {
        input:
          "0x111111111111111111111111111111111111111100000000000000000000000a",
        addr: "0x1111111111111111111111111111111111111111",
        nonce: 10,
      },
      {
        input:
          "0x111111111111111111111111111111111111111100000000000000000000000f",
        addr: "0x1111111111111111111111111111111111111111",
        nonce: 15,
      },
      {
        input:
          "0x1111111111111111111111111111111111111111000000000000000000000010",
        addr: "0x1111111111111111111111111111111111111111",
        nonce: 16,
      },
      {
        input:
          "0x1111111111111111111111111111111111111111000000000000000001000000",
        addr: "0x1111111111111111111111111111111111111111",
        nonce: 1 << 24,
      },
    ];

    for (const entry of entries) {
      const result = decodeProposalId(entry.input);
      expect(result.pluginAddress).toBe(entry.addr);
      expect(result.nonce).toBe(entry.nonce);
    }
  });

  it("boolArrayToBitmap should transform a boolean array into a bigint bitmap", () => {
    const tests = [
      { input: undefined, output: BigInt(0) },
      { input: [], output: BigInt(0) },
      { input: [false], output: BigInt(0) },
      { input: [true], output: BigInt(1) },
      { input: [true, false], output: BigInt(1) },
      { input: [true, false, false, false, false, false], output: BigInt(1) },
      { input: [false, true, false, true], output: BigInt(10) },
      { input: getEmpty256Array(), output: BigInt(0) },
    ];
    let input = getEmpty256Array();
    input[0] = true;
    tests.push({ input, output: BigInt(1) << BigInt(0) });

    input = getEmpty256Array();
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
      expect(bitmapToBoolArray(entry.input)).toMatchObject(entry.output);
    }
  });

  it("bitmapToBoolArray should fail when the bigint is too large", () => {
    expect(() => {
      bitmapToBoolArray(BigInt(1) << BigInt(256));
    }).toThrow();
  });
});

function getEmpty256Array() {
  return new Array(256).fill(false);
}
