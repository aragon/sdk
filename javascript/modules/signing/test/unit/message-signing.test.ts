import { computePublicKey } from "@ethersproject/signing-key";
import { Wallet } from "@ethersproject/wallet";
import { TextEncoder } from "util";
import { JsonSignature, BytesSignature } from "../../src";

const DUMMY_WALLET_SK =
  "8d7d56a9efa4158d232edbeaae601021eb3477ad77b5f3c720601fd74e8e04bb";

describe("Message signing", () => {
  describe("JSON payloads", () => {
    it("Should sign a JSON payload, regardless of the order of the fields", async () => {
      let wallet = new Wallet(DUMMY_WALLET_SK);

      const jsonBody1 = { method: "getVisibility", timestamp: 1582196988554 };
      const jsonBody2 = { timestamp: 1582196988554, method: "getVisibility" };

      const signature1 = await JsonSignature.signMessage(jsonBody1, wallet);
      const signature2 = await JsonSignature.signMessage(jsonBody2, wallet);

      expect(signature1).toEqual(
        "0x2aab382d8cf025f55d8c3f7597e83dc878939ef63f1a27b818fa0814d79e91d66dc8d8112fbdcc89d2355d58a74ad227a2a9603ef7eb2321283a8ea93fb90ee11b"
      );
      expect(signature2).toEqual(
        "0x2aab382d8cf025f55d8c3f7597e83dc878939ef63f1a27b818fa0814d79e91d66dc8d8112fbdcc89d2355d58a74ad227a2a9603ef7eb2321283a8ea93fb90ee11b"
      );
    });
    it("Should produce and recognize valid signatures, regardless of the order of the fields (isValid)", async () => {
      let wallet = new Wallet(DUMMY_WALLET_SK);

      const jsonBody1 = { method: "getVisibility", timestamp: 1582196988554 };
      const jsonBody2 = { timestamp: 1582196988554, method: "getVisibility" };

      const signature1 = await JsonSignature.signMessage(jsonBody1, wallet);
      const signature2 = await JsonSignature.signMessage(jsonBody2, wallet);

      expect(
        JsonSignature.isValidMessage(
          jsonBody1,
          signature1,
          computePublicKey(wallet.publicKey, true)
        )
      ).toBeTruthy();
      expect(
        JsonSignature.isValidMessage(
          jsonBody2,
          signature2,
          computePublicKey(wallet.publicKey, true)
        )
      ).toBeTruthy();
      expect(
        JsonSignature.isValidMessage(jsonBody1, signature1, wallet.publicKey)
      ).toBeTruthy();
      expect(
        JsonSignature.isValidMessage(jsonBody2, signature2, wallet.publicKey)
      ).toBeTruthy();
    });
    it("Should recover the public key from a JSON and a signature", async () => {
      let wallet = new Wallet(DUMMY_WALLET_SK);

      const jsonBody1 = { a: 1, b: "hi", c: false, d: [1, 2, 3, 4, 5, 6] };
      const jsonBody2 = { d: [1, 2, 3, 4, 5, 6], c: false, b: "hi", a: 1 };

      const signature1 = await JsonSignature.signMessage(jsonBody1, wallet);
      const signature2 = await JsonSignature.signMessage(jsonBody2, wallet);

      const recoveredPubKeyComp1 = JsonSignature.recoverMessagePublicKey(
        jsonBody1,
        signature1
      );
      const recoveredPubKeyComp2 = JsonSignature.recoverMessagePublicKey(
        jsonBody2,
        signature2
      );
      const recoveredPubKey1 = JsonSignature.recoverMessagePublicKey(
        jsonBody1,
        signature1,
        true
      );
      const recoveredPubKey2 = JsonSignature.recoverMessagePublicKey(
        jsonBody2,
        signature2,
        true
      );

      expect(recoveredPubKeyComp1).toEqual(recoveredPubKeyComp2);
      expect(recoveredPubKeyComp1).toEqual(
        computePublicKey(wallet.publicKey, true)
      );
      expect(recoveredPubKeyComp1).toEqual(
        "0x02cb3cabb521d84fc998b5649d6b59e27a3e27633d31cc0ca6083a00d68833d5ca"
      );

      expect(recoveredPubKey1).toEqual(recoveredPubKey2);
      expect(recoveredPubKey1).toEqual(wallet.publicKey);
      expect(recoveredPubKey1).toEqual(
        "0x04cb3cabb521d84fc998b5649d6b59e27a3e27633d31cc0ca6083a00d68833d5caeaeb67fbce49e44f089a28f46a4d815abd51bc5fc122065518ea4adb199ba780"
      );
    });
    it("Should recover the public key from a JSON with UTF-8 data and a signature", async () => {
      let wallet = new Wallet(DUMMY_WALLET_SK);

      const jsonBody1 = { a: "àèìòù", b: "áéíóú" };
      const jsonBody2 = { b: "áéíóú", a: "àèìòù" };

      const signature1 = await JsonSignature.signMessage(jsonBody1, wallet);
      const signature2 = await JsonSignature.signMessage(jsonBody2, wallet);

      const recoveredPubKeyComp1 = JsonSignature.recoverMessagePublicKey(
        jsonBody1,
        signature1
      );
      const recoveredPubKeyComp2 = JsonSignature.recoverMessagePublicKey(
        jsonBody2,
        signature2
      );
      const recoveredPubKey1 = JsonSignature.recoverMessagePublicKey(
        jsonBody1,
        signature1,
        true
      );
      const recoveredPubKey2 = JsonSignature.recoverMessagePublicKey(
        jsonBody2,
        signature2,
        true
      );

      expect(recoveredPubKeyComp1).toEqual(recoveredPubKeyComp2);
      expect(recoveredPubKeyComp1).toEqual(
        computePublicKey(wallet.publicKey, true)
      );
      expect(recoveredPubKeyComp1).toEqual(
        "0x02cb3cabb521d84fc998b5649d6b59e27a3e27633d31cc0ca6083a00d68833d5ca"
      );

      expect(recoveredPubKey1).toEqual(recoveredPubKey2);
      expect(recoveredPubKey1).toEqual(wallet.publicKey);
      expect(recoveredPubKey1).toEqual(
        "0x04cb3cabb521d84fc998b5649d6b59e27a3e27633d31cc0ca6083a00d68833d5caeaeb67fbce49e44f089a28f46a4d815abd51bc5fc122065518ea4adb199ba780"
      );
    });

    it("Should correctly verify signature of messages singed by go-dvote", () => {
      const message = { method: "getVisibility", timestamp: 1582196988222 };
      const msgBytes = new TextEncoder().encode(
        JsonSignature.normalizedJsonString(message)
      );
      const signature =
        "fc34c63a581e5950781ddfc03c4e892a1b1dfc10f03dc4dfb2c4dc978dea2c9951d3528cf5ad006861f6f75dad921d53e8eaaa21208450f8de182ef72383681001";
      const publicKey =
        "0352054de97f1f2422e85e3c0ef8c39d1d704529cebad64965fcad62ef1b96e587";
      expect(
        BytesSignature.isValidMessage(msgBytes, signature, publicKey)
      ).toBeTruthy();
    });
    it("Should create the same signature as go-dvote", async () => {
      const wallet = new Wallet(
        "a5ff5f333f74dbc44056a7944241675761093c4db01bcbfed7e978bd1b489a16"
      );
      const message = { method: "getVisibility", timestamp: 1582196988222 };

      const signature = await JsonSignature.signMessage(message, wallet);
      const expectedSignature =
        "0xfc34c63a581e5950781ddfc03c4e892a1b1dfc10f03dc4dfb2c4dc978dea2c9951d3528cf5ad006861f6f75dad921d53e8eaaa21208450f8de182ef7238368101c";
      expect(signature).toEqual(expectedSignature);
    });
  });

  describe("Bytes payloads", () => {
    it("Should produce and recognize valid signatures with UTF-8 data (BytesSignature.isValidMessage)", async () => {
      const wallet = new Wallet(DUMMY_WALLET_SK);
      const publicKeyComp = computePublicKey(wallet.publicKey, true);
      const publicKey = wallet.publicKey;

      const jsonBody1 = '{ "a": "àèìòù", "b": "áéíóú" }';
      const jsonBody2 = '{ "b": "test&", "a": "&test" }';
      const jsonBody3 = '{ "b": "😃🌟🌹⚖️🚀", "a": "&test" }';

      const bytesBody1 = new TextEncoder().encode(jsonBody1);
      const bytesBody2 = new TextEncoder().encode(jsonBody2);
      const bytesBody3 = new TextEncoder().encode(jsonBody3);

      const signature1 = await BytesSignature.signMessage(bytesBody1, wallet);
      const signature2 = await BytesSignature.signMessage(bytesBody2, wallet);
      const signature3 = await BytesSignature.signMessage(bytesBody3, wallet);

      expect(
        BytesSignature.isValidMessage(bytesBody1, signature1, publicKeyComp)
      ).toBeTruthy();
      expect(
        BytesSignature.isValidMessage(bytesBody2, signature2, publicKeyComp)
      ).toBeTruthy();
      expect(
        BytesSignature.isValidMessage(bytesBody3, signature3, publicKeyComp)
      ).toBeTruthy();
      expect(
        BytesSignature.isValidMessage(bytesBody1, signature1, publicKey)
      ).toBeTruthy();
      expect(
        BytesSignature.isValidMessage(bytesBody2, signature2, publicKey)
      ).toBeTruthy();
      expect(
        BytesSignature.isValidMessage(bytesBody3, signature3, publicKey)
      ).toBeTruthy();
    });
    it("Should produce and recognize valid signatures, regardless of the order of the fields (BytesSignature.isValidMessage)", async () => {
      let wallet = new Wallet(DUMMY_WALLET_SK);

      const jsonBody1 =
        '{ "method": "getVisibility", "timestamp": 1582196988554 }';
      const bytesBody1 = new TextEncoder().encode(jsonBody1);
      const jsonBody2 =
        '{ "timestamp": 1582196988554, "method": "getVisibility" }';
      const bytesBody2 = new TextEncoder().encode(jsonBody2);

      const signature1 = await BytesSignature.signMessage(bytesBody1, wallet);
      const signature2 = await BytesSignature.signMessage(bytesBody2, wallet);

      expect(
        BytesSignature.isValidMessage(
          bytesBody1,
          signature1,
          computePublicKey(wallet.publicKey, true)
        )
      ).toBeTruthy();
      expect(
        BytesSignature.isValidMessage(
          bytesBody2,
          signature2,
          computePublicKey(wallet.publicKey, true)
        )
      ).toBeTruthy();
      expect(
        BytesSignature.isValidMessage(bytesBody1, signature1, wallet.publicKey)
      ).toBeTruthy();
      expect(
        BytesSignature.isValidMessage(bytesBody2, signature2, wallet.publicKey)
      ).toBeTruthy();
    });
    it("Should correctly verify signature of messages singed by go-dvote", () => {
      const message = "hello world!";
      const msgBytes = new TextEncoder().encode(message);
      const signature =
        "038dcc036f935cc1379be60d8292ea15cb5f5cf18180ce126f9591b2497e01fa1e72a2e1f68209fe5e3730fcd9f78dade5967edbb80c62f152fbcfafb3ecd88001";
      const publicKey =
        "03d97b7621ddaf7f80901cd2bdb15fa636d78e8d7b873fe8a48889c56e01e4693d";
      expect(
        BytesSignature.isValidMessage(msgBytes, signature, publicKey)
      ).toBeTruthy();
    });
    it("Should create the same signature as go-dvote", async () => {
      const wallet = new Wallet(
        "a5ff5f333f74dbc44056a7944241675761093c4db01bcbfed7e978bd1b489a16"
      );
      const message = { method: "getVisibility", timestamp: 1582196988222 };
      const strMessage = JsonSignature.normalizedJsonString(message);
      const msgBytes = new TextEncoder().encode(strMessage);

      const signature = await BytesSignature.signMessage(msgBytes, wallet);
      const expectedSignature =
        "0xfc34c63a581e5950781ddfc03c4e892a1b1dfc10f03dc4dfb2c4dc978dea2c9951d3528cf5ad006861f6f75dad921d53e8eaaa21208450f8de182ef7238368101c";
      expect(signature).toEqual(expectedSignature);
    });
  });
});
