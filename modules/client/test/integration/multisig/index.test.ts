// @ts-ignore
declare const describe, it, expect;

// mocks need to be at the top of the imports
import { mockedIPFSClient } from "../../mocks/aragon-sdk-ipfs";

import { JsonRpcProvider } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";
import { Context, ContextPlugin, MultisigClient } from "../../../src";
import { Client as IpfsClient } from "@aragon/sdk-ipfs";
import { GraphQLClient } from "graphql-request";

import { contextParams, contextParamsFailing } from "../constants";

describe("Client Multisig", () => {
  describe("Client instances", () => {
    it("Should create a working client", async () => {
      const ctx = new Context(contextParams);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new MultisigClient(ctxPlugin);

      expect(client).toBeInstanceOf(MultisigClient);
      expect(client.web3.getProvider()).toBeInstanceOf(JsonRpcProvider);
      expect(client.web3.getConnectedSigner()).toBeInstanceOf(Wallet);
      expect(client.ipfs.getClient()).toBeInstanceOf(IpfsClient);
      expect(client.graphql.getClient()).toBeInstanceOf(GraphQLClient);

      // Web3
      const web3status = await client.web3.isUp();
      expect(web3status).toEqual(true);
      // IPFS
      await client.ipfs.ensureOnline();
      const ipfsStatus = await client.ipfs.isUp();
      expect(ipfsStatus).toEqual(true);
      // GraqphQl
      await client.graphql.ensureOnline();
      const graphqlStatus = await client.graphql.isUp();
      expect(graphqlStatus).toEqual(true);
    });

    it("Should create a failing client", async () => {
      const ctx = new Context(contextParamsFailing);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new MultisigClient(ctxPlugin);

      expect(client).toBeInstanceOf(MultisigClient);
      expect(client.web3.getProvider()).toBeInstanceOf(JsonRpcProvider);
      expect(client.web3.getConnectedSigner()).toBeInstanceOf(Wallet);
      expect(client.ipfs.getClient()).toBeInstanceOf(IpfsClient);
      expect(client.graphql.getClient()).toBeInstanceOf(GraphQLClient);

      // Web3
      const web3status = await client.web3.isUp();
      expect(web3status).toEqual(false);
      // IPFS
      mockedIPFSClient.nodeInfo.mockRejectedValueOnce(false);
      const ipfsStatus = await client.ipfs.isUp();
      expect(ipfsStatus).toEqual(false);
      // GraqphQl
      const graphqlStatus = await client.graphql.isUp();
      expect(graphqlStatus).toEqual(false);
    });
  });
});
