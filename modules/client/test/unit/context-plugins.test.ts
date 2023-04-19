// @ts-ignore
declare const describe, it, beforeEach, expect, test;

import {
  Context,
  ContextPlugin,
  ContextPluginParams,
  LIVE_CONTRACTS,
} from "../../src";
import { Wallet } from "@ethersproject/wallet";
import { JsonRpcProvider } from "@ethersproject/providers";
import { Client as IpfsClient } from "@aragon/sdk-ipfs";
import { GraphQLClient } from "graphql-request";
import {
  GRAPHQL_NODES,
  IPFS_NODES,
  WEB3_ENDPOINTS,
} from "../../src/client-common/constants";

const TEST_WALLET =
  "8d7d56a9efa4158d232edbeaae601021eb3477ad77b5f3c720601fd74e8e04bb";
const web3endpoints = {
  working: [
    "https://mainnet.infura.io/v3/94d2e8caf1bc4c4884af830d96f927ca",
    "https://cloudflare-eth.com/",
  ],
  failing: ["https://bad-url-gateway.io/"],
};

let contextParams: ContextPluginParams;

describe("ContextPlugin instances", () => {
  beforeEach(() => {
    contextParams = {
      network: "mainnet",
      signer: new Wallet(TEST_WALLET),
      daoFactoryAddress: "0x1234567890123456789012345678901234567890",
      web3Providers: web3endpoints.working,
      gasFeeEstimationFactor: 0.1,
      graphqlNodes: [{ url: "https://example.com" }],
      ipfsNodes: [{ url: "https://example.com" }],
    };
  });
  it("Should create an empty context and have default values", () => {
    const context = new ContextPlugin();

    expect(context).toBeInstanceOf(ContextPlugin);
    expect(context.network.name).toBe("homestead");
    expect(context.network.chainId).toBe(1);
    expect(context.daoFactoryAddress).toBe(LIVE_CONTRACTS.homestead.daoFactory);
    expect(context.ensRegistryAddress).toBe(context.network.ensAddress);
    expect(context.gasFeeEstimationFactor).toBe(0.625);
    expect(context.web3Providers.length).toBe(WEB3_ENDPOINTS.homestead.length);
    expect(context.ipfs.length).toBe(IPFS_NODES.homestead.length);
    expect(context.graphql.length).toBe(GRAPHQL_NODES.homestead.length);
    context.web3Providers.map((provider) => {
      expect(provider).toBeInstanceOf(JsonRpcProvider);
    });
    context.ipfs.map((ipfsClient) => {
      expect(ipfsClient).toBeInstanceOf(IpfsClient);
    });
    context.graphql.map((graphqlClient) =>
      expect(graphqlClient).toBeInstanceOf(GraphQLClient)
    );
  });
  it("Should create a context and have the correct values", () => {
    const context = new ContextPlugin(contextParams);

    expect(context).toBeInstanceOf(ContextPlugin);
    expect(context.network.name).toEqual("homestead");
    expect(context.network.chainId).toEqual(1);
    expect(context.signer).toBeInstanceOf(Wallet);
    expect(context.daoFactoryAddress).toEqual(contextParams.daoFactoryAddress);
    context.web3Providers.map((provider) => {
      expect(provider).toBeInstanceOf(JsonRpcProvider);
    });
    context.ipfs.map((ipfsClient) => {
      expect(ipfsClient).toBeInstanceOf(IpfsClient);
    });
    context.graphql.map((graphqlClient) =>
      expect(graphqlClient).toBeInstanceOf(GraphQLClient)
    );
    expect(context.gasFeeEstimationFactor).toEqual(0.1);
  });
  it("Should create a context with invalid network and fail", () => {
    contextParams.network = "notexistingnetwork";

    expect(() => {
      new ContextPlugin(contextParams);
    }).toThrow();
  });
  it("Should create a context with invalid gas fee estimation factor and fail", () => {
    contextParams.gasFeeEstimationFactor = 1.1;

    expect(() => {
      new ContextPlugin(contextParams);
    }).toThrow();
  });
  it("Should create a context plugin from a context and have the default values", () => {
    const ctx = new Context();
    const contextPlugin = ContextPlugin.fromContext(ctx);
    expect(contextPlugin).toBeInstanceOf(ContextPlugin);
    expect(contextPlugin.network.name).toBe("homestead");
    expect(contextPlugin.network.chainId).toBe(1);
    expect(contextPlugin.daoFactoryAddress).toBe(
      LIVE_CONTRACTS.homestead.daoFactory,
    );
    expect(contextPlugin.ensRegistryAddress).toBe(
      contextPlugin.network.ensAddress,
    );
    expect(contextPlugin.gasFeeEstimationFactor).toBe(0.625);
    expect(contextPlugin.web3Providers.length).toBe(
      WEB3_ENDPOINTS.homestead.length,
    );
    expect(contextPlugin.ipfs.length).toBe(IPFS_NODES.homestead.length);
    expect(contextPlugin.graphql.length).toBe(GRAPHQL_NODES.homestead.length);
    contextPlugin.web3Providers.map((provider) => {
      expect(provider).toBeInstanceOf(JsonRpcProvider);
    });
    contextPlugin.ipfs.map((ipfsClient) => {
      expect(ipfsClient).toBeInstanceOf(IpfsClient);
    });
    contextPlugin.graphql.map((graphqlClient) =>
      expect(graphqlClient).toBeInstanceOf(GraphQLClient)
    );
  });
  it("Should change the network and update the rest of parameters", () => {
    const context = new ContextPlugin();
    context.set({ network: "matic" });

    expect(context).toBeInstanceOf(Context);
    expect(context.network.name).toBe("matic");
    expect(context.network.chainId).toBe(137);
    expect(context.daoFactoryAddress).toBe(LIVE_CONTRACTS.matic.daoFactory);
    expect(context.ensRegistryAddress).toBe(LIVE_CONTRACTS.matic.ensRegistry);
    expect(context.gasFeeEstimationFactor).toBe(0.625);
    expect(context.web3Providers.length).toBe(WEB3_ENDPOINTS.matic.length);
    expect(context.ipfs.length).toBe(IPFS_NODES.matic.length);
    expect(context.graphql.length).toBe(GRAPHQL_NODES.matic.length);
    context.web3Providers.map((provider) => {
      expect(provider).toBeInstanceOf(JsonRpcProvider);
    });
    context.ipfs.map((ipfsClient) => {
      expect(ipfsClient).toBeInstanceOf(IpfsClient);
    });
    context.graphql.map((graphqlClient) =>
      expect(graphqlClient).toBeInstanceOf(GraphQLClient)
    );
  });
});
