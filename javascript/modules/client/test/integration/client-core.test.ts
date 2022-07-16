// @ts-ignore
declare const describe, it, beforeAll, afterAll, expect, test;

import { Wallet } from "@ethersproject/wallet";
import { Client, Context, ContextParams } from "../../src";

const IPFS_API_KEY = process.env.IPFS_API_KEY ||
  Buffer.from(
    "YjQ3N1JoRUNmOHM4c2RNN1hya0xCczJ3SGM0a0NNd3BiY0ZDNTVLdCAg==",
    "base64",
  ).toString().trim();

const web3endpoints = {
  working: [
    "https://mainnet.infura.io/v3/94d2e8caf1bc4c4884af830d96f927ca",
    "https://cloudflare-eth.com/",
  ],
  failing: ["https://bad-url-gateway.io/"],
};

const TEST_WALLET =
  "0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e";

const contextParams: ContextParams = {
  network: "mainnet",
  signer: new Wallet(TEST_WALLET),
  dao: "0x1234567890123456789012345678901234567890",
  daoFactoryAddress: "0x0123456789012345678901234567890123456789",
  web3Providers: web3endpoints.working,
  ipfsNodes: [
    {
      url: "https://testing-ipfs-0.aragon.network/api/v0",
      headers: {
        "X-API-KEY": IPFS_API_KEY,
      },
    },
  ],
};

describe("Client Core", () => {
  describe("IPFS client", () => {
    it("Should have an API token to test the proxy", () => {
      expect(IPFS_API_KEY.length).toBeGreaterThan(0);
    });
    it("Should connect to a IPFS node and upload a string and recover the same string", async () => {
      const context = new Context(contextParams);
      const client = new Client(context);
      const originalStr = "I am a test";
      const cid = await client.ipfs.add(originalStr);
      const recoveredString = await client.ipfs.fetchString(cid);
      const recoveredBytes = await client.ipfs.fetchBytes(cid);
      const decodedString = new TextDecoder().decode(recoveredBytes);

      expect(typeof recoveredBytes).toBe("object");
      expect(typeof recoveredString).toBe("string");
      expect(typeof decodedString).toBe("string");
      expect(recoveredString).toEqual(originalStr);
      expect(decodedString).toEqual(originalStr);
    });
    it("Should connect to a IPFS node, upload bytes and recover the same string", async () => {
      const context = new Context(contextParams);
      const client = new Client(context);
      const originalBytes = new Uint8Array([
        72,
        101,
        108,
        108,
        111,
        32,
        84,
        104,
        101,
        114,
        101,
        32,
        58,
        41,
      ]);
      const cid = await client.ipfs.add(originalBytes);
      const recoveredString = await client.ipfs.fetchString(cid);
      const recoveredBytes = await client.ipfs.fetchBytes(cid);
      const decodedString = new TextDecoder().decode(recoveredBytes);

      expect(typeof recoveredBytes).toBe("object");
      expect(typeof recoveredString).toBe("string");
      expect(typeof decodedString).toBe("string");
      expect(recoveredString).toEqual("Hello There :)");
      expect(decodedString).toEqual("Hello There :)");
    });
    it("Should work when an IPFS node is functional", async () => {
      const context = new Context(contextParams);
      const client = new Client(context);
      const isOnline = await client.ipfs.isUp();

      expect(isOnline).toEqual(true);
    });
    it("Should fail when shifting an empty node list", async () => {
      {
        const context = new Context(
          Object.assign({}, contextParams, {
            ipfsNodes: [],
          }),
        );
        const client = new Client(context);
        expect(() => {
          client.ipfs.shiftClient();
        }).toThrow();
      }
    });
    it("Should fail when an IPFS node is not working", async () => {
      {
        const context = new Context(
          Object.assign({}, contextParams, {
            ipfsNodes: [],
          }),
        );
        const client = new Client(context);
        const isOnline = await client.ipfs.isUp();

        expect(isOnline).toEqual(false);
      }
      {
        const context = new Context(
          Object.assign({}, contextParams, {
            ipfsNodes: [{ url: "https://does-not-exist-here.random.hb/1234" }],
          }),
        );
        const client = new Client(context);
        const isOnline = await client.ipfs.isUp();

        expect(isOnline).toEqual(false);
      }
    });
  });
});
