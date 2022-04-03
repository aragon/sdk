import { computePublicKey } from "@ethersproject/signing-key";
import { Wallet } from "@ethersproject/wallet";
import { TextEncoder } from "util";
import { JsonSignature, BytesSignature } from "../../src";

const MAIN_CHAIN_ID = "production";
const ALT_CHAIN_ID = "dvelopment";
const DUMMY_WALLET_SK =
  "8d7d56a9efa4158d232edbeaae601021eb3477ad77b5f3c720601fd74e8e04bb";

describe("Transaction signing", () => {
  describe("JSON payloads", () => {
    it("Should sign a JSON payload, regardless of the order of the fields", async () => {
      const wallet = new Wallet(DUMMY_WALLET_SK);

      const jsonBody1 = { method: "getVisibility", timestamp: 1582196988554 };
      const jsonBody2 = { timestamp: 1582196988554, method: "getVisibility" };

      const signature1 = await JsonSignature.signTransaction(
        jsonBody1,
        MAIN_CHAIN_ID,
        wallet
      );
      const signature2 = await JsonSignature.signTransaction(
        jsonBody2,
        MAIN_CHAIN_ID,
        wallet
      );

      expect(signature1).toEqual(
        "0x44d31937862e1f835f92d8b3f93858636bad075bd2429cf79404a81e42bd3d00196613c37a99b054c32339dde53ce3c25932c5d5f89483ccdf93234d3c4808b81b"
      );
      expect(signature2).toEqual(
        "0x44d31937862e1f835f92d8b3f93858636bad075bd2429cf79404a81e42bd3d00196613c37a99b054c32339dde53ce3c25932c5d5f89483ccdf93234d3c4808b81b"
      );
    });
    it("Should produce and recognize valid signatures, regardless of the order of the fields (isValid)", async () => {
      const wallet = new Wallet(DUMMY_WALLET_SK);

      const jsonBody1 = { method: "getVisibility", timestamp: 1582196988554 };
      const jsonBody2 = { timestamp: 1582196988554, method: "getVisibility" };

      const signature1 = await JsonSignature.signTransaction(
        jsonBody1,
        MAIN_CHAIN_ID,
        wallet
      );
      const signature2 = await JsonSignature.signTransaction(
        jsonBody2,
        MAIN_CHAIN_ID,
        wallet
      );

      expect(
        JsonSignature.isValidTransaction(
          jsonBody1,
          MAIN_CHAIN_ID,
          signature1,
          computePublicKey(wallet.publicKey, true)
        )
      ).toBeTruthy();
      expect(
        JsonSignature.isValidTransaction(
          jsonBody2,
          MAIN_CHAIN_ID,
          signature2,
          computePublicKey(wallet.publicKey, true)
        )
      ).toBeTruthy();
      expect(
        JsonSignature.isValidTransaction(
          jsonBody1,
          MAIN_CHAIN_ID,
          signature1,
          wallet.publicKey
        )
      ).toBeTruthy();
      expect(
        JsonSignature.isValidTransaction(
          jsonBody2,
          MAIN_CHAIN_ID,
          signature2,
          wallet.publicKey
        )
      ).toBeTruthy();
    });
    it("Should recover the public key from a JSON and a signature", async () => {
      const wallet = new Wallet(DUMMY_WALLET_SK);

      const jsonBody1 = { a: 1, b: "hi", c: false, d: [1, 2, 3, 4, 5, 6] };
      const jsonBody2 = { d: [1, 2, 3, 4, 5, 6], c: false, b: "hi", a: 1 };

      const signature1 = await JsonSignature.signTransaction(
        jsonBody1,
        MAIN_CHAIN_ID,
        wallet
      );
      const signature2 = await JsonSignature.signTransaction(
        jsonBody2,
        MAIN_CHAIN_ID,
        wallet
      );

      const recoveredPubKeyComp1 = JsonSignature.recoverTransactionPublicKey(
        jsonBody1,
        MAIN_CHAIN_ID,
        signature1
      );
      const recoveredPubKeyComp2 = JsonSignature.recoverTransactionPublicKey(
        jsonBody2,
        MAIN_CHAIN_ID,
        signature2
      );
      const recoveredPubKey1 = JsonSignature.recoverTransactionPublicKey(
        jsonBody1,
        MAIN_CHAIN_ID,
        signature1,
        true
      );
      const recoveredPubKey2 = JsonSignature.recoverTransactionPublicKey(
        jsonBody2,
        MAIN_CHAIN_ID,
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
      const wallet = new Wallet(DUMMY_WALLET_SK);

      const jsonBody1 = { a: "àèìòù", b: "áéíóú" };
      const jsonBody2 = { b: "áéíóú", a: "àèìòù" };

      const signature1 = await JsonSignature.signTransaction(
        jsonBody1,
        MAIN_CHAIN_ID,
        wallet
      );
      const signature2 = await JsonSignature.signTransaction(
        jsonBody2,
        MAIN_CHAIN_ID,
        wallet
      );

      const recoveredPubKeyComp1 = JsonSignature.recoverTransactionPublicKey(
        jsonBody1,
        MAIN_CHAIN_ID,
        signature1
      );
      const recoveredPubKeyComp2 = JsonSignature.recoverTransactionPublicKey(
        jsonBody2,
        MAIN_CHAIN_ID,
        signature2
      );
      const recoveredPubKey1 = JsonSignature.recoverTransactionPublicKey(
        jsonBody1,
        MAIN_CHAIN_ID,
        signature1,
        true
      );
      const recoveredPubKey2 = JsonSignature.recoverTransactionPublicKey(
        jsonBody2,
        MAIN_CHAIN_ID,
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
        "8675144382150c3eb9da3b6c3c5591cbce07dd96f82400ca73cc4371718d87131bee51b8ad3a91cbad33b44f94654b145b5383f03e5137a663b14ecc1d94ec7000";
      const publicKey =
        "02f601098d41d6d91aabaedf245cf6ce2a0ba949c4013bc45b816615d40f885e3a";
      expect(
        BytesSignature.isValidTransaction(
          msgBytes,
          "chain-123",
          signature,
          publicKey
        )
      ).toBeTruthy();
    });
    it("Should create the same signature as go-dvote", async () => {
      const wallet = new Wallet(
        "94f3a5c22e1dc88f9757b945da0e6d00d1c97772235c9ebd8197df8977c635a4"
      );
      const message = { method: "getVisibility", timestamp: 1582196988222 };

      const signature = await JsonSignature.signTransaction(
        message,
        "chain-123",
        wallet
      );
      const expectedSignature =
        "0x8675144382150c3eb9da3b6c3c5591cbce07dd96f82400ca73cc4371718d87131bee51b8ad3a91cbad33b44f94654b145b5383f03e5137a663b14ecc1d94ec701b";
      expect(signature).toEqual(expectedSignature);
    });
  });

  describe("Bytes payloads", () => {
    it("Should produce and recognize valid signatures with UTF-8 data", async () => {
      const wallet = new Wallet(DUMMY_WALLET_SK);
      const publicKeyComp = computePublicKey(wallet.publicKey, true);
      const publicKey = wallet.publicKey;

      const jsonBody1 = '{ "a": "àèìòù", "b": "áéíóú" }';
      const jsonBody2 = '{ "b": "test&", "a": "&test" }';
      const jsonBody3 = '{ "b": "😃🌟🌹⚖️🚀", "a": "&test" }';

      const bytesBody1 = new TextEncoder().encode(jsonBody1);
      const bytesBody2 = new TextEncoder().encode(jsonBody2);
      const bytesBody3 = new TextEncoder().encode(jsonBody3);

      const signature1 = await BytesSignature.signTransaction(
        bytesBody1,
        ALT_CHAIN_ID,
        wallet
      );
      const signature2 = await BytesSignature.signTransaction(
        bytesBody2,
        ALT_CHAIN_ID,
        wallet
      );
      const signature3 = await BytesSignature.signTransaction(
        bytesBody3,
        ALT_CHAIN_ID,
        wallet
      );

      expect(
        BytesSignature.isValidTransaction(
          bytesBody1,
          ALT_CHAIN_ID,
          signature1,
          publicKeyComp
        )
      ).toBeTruthy();
      expect(
        BytesSignature.isValidTransaction(
          bytesBody2,
          ALT_CHAIN_ID,
          signature2,
          publicKeyComp
        )
      ).toBeTruthy();
      expect(
        BytesSignature.isValidTransaction(
          bytesBody3,
          ALT_CHAIN_ID,
          signature3,
          publicKeyComp
        )
      ).toBeTruthy();
      expect(
        BytesSignature.isValidTransaction(
          bytesBody1,
          ALT_CHAIN_ID,
          signature1,
          publicKey
        )
      ).toBeTruthy();
      expect(
        BytesSignature.isValidTransaction(
          bytesBody2,
          ALT_CHAIN_ID,
          signature2,
          publicKey
        )
      ).toBeTruthy();
      expect(
        BytesSignature.isValidTransaction(
          bytesBody3,
          ALT_CHAIN_ID,
          signature3,
          publicKey
        )
      ).toBeTruthy();
    });
    it("Should produce and recognize valid signatures, regardless of the order of the fields", async () => {
      const wallet = new Wallet(DUMMY_WALLET_SK);

      const jsonBody1 =
        '{ "method": "getVisibility", "timestamp": 1582196988554 }';
      const bytesBody1 = new TextEncoder().encode(jsonBody1);
      const jsonBody2 =
        '{ "timestamp": 1582196988554, "method": "getVisibility" }';
      const bytesBody2 = new TextEncoder().encode(jsonBody2);

      const signature1 = await BytesSignature.signTransaction(
        bytesBody1,
        MAIN_CHAIN_ID,
        wallet
      );
      const signature2 = await BytesSignature.signTransaction(
        bytesBody2,
        MAIN_CHAIN_ID,
        wallet
      );

      expect(
        BytesSignature.isValidTransaction(
          bytesBody1,
          MAIN_CHAIN_ID,
          signature1,
          computePublicKey(wallet.publicKey, true)
        )
      ).toBeTruthy();
      expect(
        BytesSignature.isValidTransaction(
          bytesBody2,
          MAIN_CHAIN_ID,
          signature2,
          computePublicKey(wallet.publicKey, true)
        )
      ).toBeTruthy();
      expect(
        BytesSignature.isValidTransaction(
          bytesBody1,
          MAIN_CHAIN_ID,
          signature1,
          wallet.publicKey
        )
      ).toBeTruthy();
      expect(
        BytesSignature.isValidTransaction(
          bytesBody2,
          MAIN_CHAIN_ID,
          signature2,
          wallet.publicKey
        )
      ).toBeTruthy();
    });
    it("Should correctly verify signature of messages singed by go-dvote", () => {
      const message = "hello world!";
      const msgBytes = new TextEncoder().encode(message);
      const signature =
        "4e0c9166442322ba15d241782804c1c3f6f0b8a55bfa279949b597ee4c9717bd6149b677ab0fccc48823cdc88b24ad56abc89d5ea4e48aea2d4febd911b7345801";
      const publicKey =
        "03f0029f3a35380b528de4ea7194e36c1fa1505781fe7dd8ffe82525952f34ce8d";
      expect(
        BytesSignature.isValidTransaction(
          msgBytes,
          "chain-123",
          signature,
          publicKey
        )
      ).toBeTruthy();
    });
    it("Should create the same signature as go-dvote", async () => {
      const wallet = new Wallet(
        "94f3a5c22e1dc88f9757b945da0e6d00d1c97772235c9ebd8197df8977c635a4"
      );
      const message = { method: "getVisibility", timestamp: 1582196988222 };
      const strMessage = JsonSignature.normalizedJsonString(message);
      const msgBytes = new TextEncoder().encode(strMessage);

      const signature = await BytesSignature.signTransaction(
        msgBytes,
        "chain-123",
        wallet
      );
      const expectedSignature =
        "0x8675144382150c3eb9da3b6c3c5591cbce07dd96f82400ca73cc4371718d87131bee51b8ad3a91cbad33b44f94654b145b5383f03e5137a663b14ecc1d94ec701b";
      expect(signature).toEqual(expectedSignature);
    });
  });
});
