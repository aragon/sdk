// @ts-ignore
declare const describe, it, beforeEach, expect, test;

import { ContextPlugin, ContextPluginParams } from "../../src";
import { Wallet } from "@ethersproject/wallet";
import { JsonRpcProvider } from "@ethersproject/providers";
import { activeContractsList } from "@aragon/core-contracts-ethers";

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
      daoFactoryAddress: "0x1234",
      web3Providers: web3endpoints.working,
      gasFeeEstimationFactor: 0.1,
      pluginAddress: "0x2345",
      graphqlURLs: []
    };
  });
  it("Should create an empty context", () => {
    const context = new ContextPlugin({});

    expect(context).toBeInstanceOf(ContextPlugin);
  });
  it("Should create an empty context and have default values", () => {
    const context = new ContextPlugin({});

    expect(context).toBeInstanceOf(ContextPlugin);
    expect(context.signer).toEqual(undefined);
    expect(context.daoFactoryAddress).toEqual(undefined);
    expect(context.gasFeeEstimationFactor).toEqual(0.625);
    expect(context.pluginAddress).toEqual("");
  });
  it("Should create a context and have the correct values", () => {
    const context = new ContextPlugin(contextParams);

    expect(context).toBeInstanceOf(ContextPlugin);
    expect(context.network).toEqual("mainnet");
    expect(context.signer).toBeInstanceOf(Wallet);
    expect(context.daoFactoryAddress).toEqual("0x1234");
    context.web3Providers?.map((provider) =>
      expect(provider).toBeInstanceOf(JsonRpcProvider)
    );
    expect(context.gasFeeEstimationFactor).toEqual(0.1);
    expect(context.pluginAddress).toEqual("0x2345");
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
  it("Should create a context with the correct DAOFactory address from the core-contracts-package", () => {
    contextParams.daoFactoryAddress = "";
    contextParams.network = "rinkeby";
    const context = new ContextPlugin(contextParams);

    expect(context).toBeInstanceOf(ContextPlugin);
    expect(context.network).toEqual("rinkeby");
    expect(context.daoFactoryAddress).toEqual(
      activeContractsList.rinkeby.DAOFactory,
    );
  });
});
