// @ts-ignore
declare const describe, it, beforeEach, expect, test;

import { Context, ContextParams, LIVE_CONTRACTS } from "../../src";
import { Wallet } from "@ethersproject/wallet";
import { JsonRpcProvider } from "@ethersproject/providers";
import { Client as IpfsClient } from "@aragon/sdk-ipfs";
import { GraphQLClient } from "graphql-request";

const TEST_WALLET =
  "8d7d56a9efa4158d232edbeaae601021eb3477ad77b5f3c720601fd74e8e04bb";
const web3endpoints = {
  working: [
    "https://mainnet.infura.io/v3/94d2e8caf1bc4c4884af830d96f927ca",
    "https://cloudflare-eth.com/",
  ],
  failing: ["https://bad-url-gateway.io/"],
};

let contextParams: ContextParams;

describe("Context instances", () => {
  beforeEach(() => {
    contextParams = {
      network: "mainnet",
      signer: new Wallet(TEST_WALLET),
      daoFactoryAddress: "0x1234",
      web3Providers: web3endpoints.working,
      gasFeeEstimationFactor: 0.1,
      graphqlNodes: [],
      ipfsNodes:[]
    };
  });
  it("Should create an empty context", () => {
    const context = new Context({});

    expect(context).toBeInstanceOf(Context);
  });
  it("Should create an empty context and have default values", () => {
    const context = new Context({});

    expect(context).toBeInstanceOf(Context);
    expect(context.signer).toEqual(undefined);
    expect(context.gasFeeEstimationFactor).toEqual(0.625);
  });
  it("Should create a context and have the correct values", () => {
    const context = new Context(contextParams);

    expect(context).toBeInstanceOf(Context);
    expect(context.network.name).toEqual("homestead");
    expect(context.network.chainId).toEqual(1);
    expect(context.signer).toBeInstanceOf(Wallet);
    expect(context.daoFactoryAddress).toEqual("0x1234");
    context.web3Providers?.map((provider) =>
      expect(provider).toBeInstanceOf(JsonRpcProvider)
    );
    context.ipfs?.map((ipfsClient) =>
      expect(ipfsClient).toBeInstanceOf(IpfsClient)
    );
    context.graphql?.map((graphqlClient) =>
      expect(graphqlClient).toBeInstanceOf(GraphQLClient)
    );
    expect(context.gasFeeEstimationFactor).toEqual(0.1);
  });
  it("Should set a new context and have the correct values", () => {
    const context = new Context(contextParams);
    contextParams = {
      network: "goerli",
      signer: new Wallet(TEST_WALLET),
      daoFactoryAddress: "0x2345",
      web3Providers: web3endpoints.working,
      gasFeeEstimationFactor: 0.1,
      ipfsNodes: [{ url: "https://localhost", headers: {} }],
      graphqlNodes: [{ url: "https://localhost" }],
    };
    context.set(contextParams);

    expect(context).toBeInstanceOf(Context);
    expect(context.network.name).toEqual("goerli");
    expect(context.network.chainId).toEqual(5);
    expect(context.signer).toBeInstanceOf(Wallet);
    expect(context.daoFactoryAddress).toEqual("0x2345");
    context.web3Providers?.map((provider) =>
      expect(provider).toBeInstanceOf(JsonRpcProvider)
    );
    context.ipfs?.map((ipfsClient) =>
      expect(ipfsClient).toBeInstanceOf(IpfsClient)
    );
    context.graphql?.map((graphqlClient) =>
      expect(graphqlClient).toBeInstanceOf(GraphQLClient)
    );
    expect(context.gasFeeEstimationFactor).toEqual(0.1);
  });
  it("Should create a context with invalid network and fail", () => {
    contextParams.network = "notexistingnetwork";

    expect(() => {
      new Context(contextParams);
    }).toThrow();
  });
  it("Should create a context with invalid gas fee estimation factor and fail", () => {
    contextParams.gasFeeEstimationFactor = 1.1;

    expect(() => {
      new Context(contextParams);
    }).toThrow();
  });
  it("Should create a context with the correct DAOFactory address from the core-contracts-package", () => {
    contextParams.daoFactoryAddress = "";
    contextParams.network = "matic";
    const context = new Context(contextParams);

    expect(context).toBeInstanceOf(Context);
    expect(context.network.name).toEqual("matic");
    context.web3Providers?.map((provider) =>
      provider.getNetwork().then((nw)=> {
        expect(nw.chainId).toEqual(147);
        expect(nw.name).toEqual("matic");
        expect(nw.ensAddress).toEqual(LIVE_CONTRACTS.matic.ensRegistry);
      })
    );
    expect(context.daoFactoryAddress).toEqual(
      LIVE_CONTRACTS.matic.daoFactory,
    );
    expect(context.ensRegistryAddress).toEqual(
      LIVE_CONTRACTS.matic.ensRegistry,
    );
  });
});
