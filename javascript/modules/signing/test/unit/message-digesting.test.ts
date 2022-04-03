import {
  digestVocdoniMessage,
  digestVocdoniTransaction,
} from "../../src/common";
import { TextEncoder, TextDecoder } from "util";

describe("Digesting Vocdoni messages", () => {
  it("Should prefix strings and hash the payload", () => {
    const inputs = [
      {
        payload: "hello",
        output:
          "Vocdoni signed message:\n1c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac8",
        hexOutput:
          "566f63646f6e69207369676e6564206d6573736167653a0a31633861666639353036383563326564346263333137346633343732323837623536643935313762396339343831323733313961303961376133366465616338",
      },
      {
        payload: "",
        output:
          "Vocdoni signed message:\nc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
        hexOutput:
          "566f63646f6e69207369676e6564206d6573736167653a0a63356432343630313836663732333363393237653764623264636337303363306535303062363533636138323237336237626661643830343564383561343730",
      },
      {
        payload: "More text here",
        output:
          "Vocdoni signed message:\n85f4a8fca6cc7ed5ec4b9ec616aa7c2eecaf3460ecec19ff8c767fbf5f339c05",
        hexOutput:
          "566f63646f6e69207369676e6564206d6573736167653a0a38356634613866636136636337656435656334623965633631366161376332656563616633343630656365633139666638633736376662663566333339633035",
      },
      {
        payload: "hello",
        output:
          "Vocdoni signed message:\n1c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac8",
        hexOutput:
          "566f63646f6e69207369676e6564206d6573736167653a0a31633861666639353036383563326564346263333137346633343732323837623536643935313762396339343831323733313961303961376133366465616338",
      },
      {
        payload: "hello",
        output:
          "Vocdoni signed message:\n1c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac8",
        hexOutput:
          "566f63646f6e69207369676e6564206d6573736167653a0a31633861666639353036383563326564346263333137346633343732323837623536643935313762396339343831323733313961303961376133366465616338",
      },
      {
        payload: "Emojis ✅🟧👻",
        output:
          "Vocdoni signed message:\n33eb9d50222bb252f1ff3637f9cfa2b25848c7191209f08cbe875dcdf8245ee8",
        hexOutput:
          "566f63646f6e69207369676e6564206d6573736167653a0a33336562396435303232326262323532663166663336333766396366613262323538343863373139313230396630386362653837356463646638323435656538",
      },
    ];

    for (const item of inputs) {
      const result = digestVocdoniMessage(item.payload);
      const resultStr = new TextDecoder().decode(result);
      const hexResult = Buffer.from(result).toString("hex");
      expect(resultStr).toEqual(item.output);
      expect(hexResult).toEqual(item.hexOutput);
    }
  });

  it("Should prefix buffers and hash the payload", () => {
    const encoder = new TextEncoder();
    const inputs = [
      {
        payload: encoder.encode("hello"),
        hexOutput:
          "566f63646f6e69207369676e6564206d6573736167653a0a31633861666639353036383563326564346263333137346633343732323837623536643935313762396339343831323733313961303961376133366465616338",
      },
      {
        payload: new Uint8Array(),
        hexOutput:
          "566f63646f6e69207369676e6564206d6573736167653a0a63356432343630313836663732333363393237653764623264636337303363306535303062363533636138323237336237626661643830343564383561343730",
      },
      {
        payload: encoder.encode("More text here"),
        hexOutput:
          "566f63646f6e69207369676e6564206d6573736167653a0a38356634613866636136636337656435656334623965633631366161376332656563616633343630656365633139666638633736376662663566333339633035",
      },
      {
        payload: encoder.encode("hello"),
        hexOutput:
          "566f63646f6e69207369676e6564206d6573736167653a0a31633861666639353036383563326564346263333137346633343732323837623536643935313762396339343831323733313961303961376133366465616338",
      },
      {
        payload: encoder.encode("hello"),
        hexOutput:
          "566f63646f6e69207369676e6564206d6573736167653a0a31633861666639353036383563326564346263333137346633343732323837623536643935313762396339343831323733313961303961376133366465616338",
      },
      {
        payload: encoder.encode("Emojis ✅🟧👻"),
        hexOutput:
          "566f63646f6e69207369676e6564206d6573736167653a0a33336562396435303232326262323532663166663336333766396366613262323538343863373139313230396630386362653837356463646638323435656538",
      },
    ];

    for (const item of inputs) {
      const result = digestVocdoniMessage(item.payload);
      const hexResult = Buffer.from(result).toString("hex");
      expect(hexResult).toEqual(item.hexOutput);
    }
  });

  it("String and bytes payloads should match", () => {
    const encoder = new TextEncoder();
    const inputs = [
      { str: "hello", bytes: encoder.encode("hello"), chainId: "1" },
      { str: "", bytes: new Uint8Array(), chainId: "1" },
      {
        str: "More text here",
        bytes: encoder.encode("More text here"),
        chainId: "1",
      },
      { str: "hello", bytes: encoder.encode("hello"), chainId: "5" },
      { str: "hello", bytes: encoder.encode("hello"), chainId: "arigato" },
      {
        str: "Emojis ✅🟧👻",
        bytes: encoder.encode("Emojis ✅🟧👻"),
        chainId: "1",
      },
    ];

    for (const item of inputs) {
      const strResult = digestVocdoniMessage(item.str);
      const bytesResult = digestVocdoniMessage(item.bytes);
      const hexResult1 = Buffer.from(strResult).toString("hex");
      const hexResult2 = Buffer.from(bytesResult).toString("hex");
      expect(hexResult1).toEqual(hexResult2);
    }
  });
});

describe("Digesting Vocdoni transactions", () => {
  it("Should prefix strings and hash the payload", () => {
    const inputs = [
      {
        payload: "hello",
        chainId: "1",
        output:
          "Vocdoni signed transaction:\n1\n1c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac8",
        hexOutput:
          "566f63646f6e69207369676e6564207472616e73616374696f6e3a0a310a31633861666639353036383563326564346263333137346633343732323837623536643935313762396339343831323733313961303961376133366465616338",
      },
      {
        payload: "",
        chainId: "1",
        output:
          "Vocdoni signed transaction:\n1\nc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
        hexOutput:
          "566f63646f6e69207369676e6564207472616e73616374696f6e3a0a310a63356432343630313836663732333363393237653764623264636337303363306535303062363533636138323237336237626661643830343564383561343730",
      },
      {
        payload: "More text here",
        chainId: "1",
        output:
          "Vocdoni signed transaction:\n1\n85f4a8fca6cc7ed5ec4b9ec616aa7c2eecaf3460ecec19ff8c767fbf5f339c05",
        hexOutput:
          "566f63646f6e69207369676e6564207472616e73616374696f6e3a0a310a38356634613866636136636337656435656334623965633631366161376332656563616633343630656365633139666638633736376662663566333339633035",
      },
      {
        payload: "hello",
        chainId: "5",
        output:
          "Vocdoni signed transaction:\n5\n1c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac8",
        hexOutput:
          "566f63646f6e69207369676e6564207472616e73616374696f6e3a0a350a31633861666639353036383563326564346263333137346633343732323837623536643935313762396339343831323733313961303961376133366465616338",
      },
      {
        payload: "hello",
        chainId: "arigato",
        output:
          "Vocdoni signed transaction:\narigato\n1c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac8",
        hexOutput:
          "566f63646f6e69207369676e6564207472616e73616374696f6e3a0a6172696761746f0a31633861666639353036383563326564346263333137346633343732323837623536643935313762396339343831323733313961303961376133366465616338",
      },
      {
        payload: "Emojis ✅🟧👻",
        chainId: "1",
        output:
          "Vocdoni signed transaction:\n1\n33eb9d50222bb252f1ff3637f9cfa2b25848c7191209f08cbe875dcdf8245ee8",
        hexOutput:
          "566f63646f6e69207369676e6564207472616e73616374696f6e3a0a310a33336562396435303232326262323532663166663336333766396366613262323538343863373139313230396630386362653837356463646638323435656538",
      },
    ];

    for (const item of inputs) {
      const result = digestVocdoniTransaction(item.payload, item.chainId);
      const resultStr = new TextDecoder().decode(result);
      const hexResult = Buffer.from(result).toString("hex");
      expect(resultStr).toEqual(item.output);
      expect(hexResult).toEqual(item.hexOutput);
    }
  });

  it("Should prefix buffers and hash the payload", () => {
    const encoder = new TextEncoder();
    const inputs = [
      {
        payload: encoder.encode("hello"),
        chainId: "1",
        hexOutput:
          "566f63646f6e69207369676e6564207472616e73616374696f6e3a0a310a31633861666639353036383563326564346263333137346633343732323837623536643935313762396339343831323733313961303961376133366465616338",
      },
      {
        payload: new Uint8Array(),
        chainId: "1",
        hexOutput:
          "566f63646f6e69207369676e6564207472616e73616374696f6e3a0a310a63356432343630313836663732333363393237653764623264636337303363306535303062363533636138323237336237626661643830343564383561343730",
      },
      {
        payload: encoder.encode("More text here"),
        chainId: "1",
        hexOutput:
          "566f63646f6e69207369676e6564207472616e73616374696f6e3a0a310a38356634613866636136636337656435656334623965633631366161376332656563616633343630656365633139666638633736376662663566333339633035",
      },
      {
        payload: encoder.encode("hello"),
        chainId: "5",
        hexOutput:
          "566f63646f6e69207369676e6564207472616e73616374696f6e3a0a350a31633861666639353036383563326564346263333137346633343732323837623536643935313762396339343831323733313961303961376133366465616338",
      },
      {
        payload: encoder.encode("hello"),
        chainId: "arigato",
        hexOutput:
          "566f63646f6e69207369676e6564207472616e73616374696f6e3a0a6172696761746f0a31633861666639353036383563326564346263333137346633343732323837623536643935313762396339343831323733313961303961376133366465616338",
      },
      {
        payload: encoder.encode("Emojis ✅🟧👻"),
        chainId: "1",
        hexOutput:
          "566f63646f6e69207369676e6564207472616e73616374696f6e3a0a310a33336562396435303232326262323532663166663336333766396366613262323538343863373139313230396630386362653837356463646638323435656538",
      },
    ];

    for (const item of inputs) {
      const result = digestVocdoniTransaction(item.payload, item.chainId);
      const hexResult = Buffer.from(result).toString("hex");
      expect(hexResult).toEqual(item.hexOutput);
    }
  });

  it("String and bytes payloads should match", () => {
    const encoder = new TextEncoder();
    const inputs = [
      { str: "hello", bytes: encoder.encode("hello"), chainId: "1" },
      { str: "", bytes: new Uint8Array(), chainId: "1" },
      {
        str: "More text here",
        bytes: encoder.encode("More text here"),
        chainId: "1",
      },
      { str: "hello", bytes: encoder.encode("hello"), chainId: "5" },
      { str: "hello", bytes: encoder.encode("hello"), chainId: "arigato" },
      {
        str: "Emojis ✅🟧👻",
        bytes: encoder.encode("Emojis ✅🟧👻"),
        chainId: "1",
      },
    ];

    for (const item of inputs) {
      const strResult = digestVocdoniTransaction(item.str, item.chainId);
      const bytesResult = digestVocdoniTransaction(item.bytes, item.chainId);
      const hexResult1 = Buffer.from(strResult).toString("hex");
      const hexResult2 = Buffer.from(bytesResult).toString("hex");
      expect(hexResult1).toEqual(hexResult2);
    }
  });
});
