import { ClientDao } from "../../src";
import { JsonRpcProvider } from "@ethersproject/providers";
import { ContextParams } from "../../src/internal/interfaces/context";
import { Wallet } from "@ethersproject/wallet";
import { Context } from "../../src/context";

const web3endpoints = {
  working: [
    "https://cloudflare-eth.com/",
    "https://mainnet.infura.io/v3/94d2e8caf1bc4c4884af830d96f927ca",
  ],
  failing: ["https://bad-url-gateway.io/"],
};

const TEST_WALLET = "8d7d56a9efa4158d232edbeaae601021eb3477ad77b5f3c720601fd74e8e04bb"

const contextParams: ContextParams = {
  network: "mainnet",
  signer: new Wallet(TEST_WALLET),
  dao: "0x1234567890123456789012345678901234567890",
  daoFactoryAddress: "0x0123456789012345678901234567890123456789",
  web3Providers: web3endpoints.working
}

describe("Client instances", () => {
  it("Should create an empty client", () => {
    const client = new ClientDao({} as Context);

    expect(client).toBeInstanceOf(ClientDao);
  });
  it("Should create a working client", async () => {
    const context = new Context(contextParams);
    const client = new ClientDao(context);

    expect(client).toBeInstanceOf(ClientDao);
    expect(client.web3).toBeInstanceOf(JsonRpcProvider);

    const status = await client.checkWeb3Status();
    expect(status).toEqual(true);
  });
  it("Should create a failing client", async () => {
    contextParams.web3Providers = web3endpoints.failing
    const context = new Context(contextParams);
    const client = new ClientDao(context);

    expect(client).toBeInstanceOf(ClientDao);
    expect(client.web3).toBeInstanceOf(JsonRpcProvider);

    const status = await client.checkWeb3Status();
    expect(status).toEqual(false);
  });
  it("Should create a client, fail and shift to a working endpoint", async () => {
    contextParams.web3Providers = web3endpoints.failing.concat(web3endpoints.working)
    const context = new Context(contextParams);
    const client = new ClientDao(context);

    expect(client).toBeInstanceOf(ClientDao);
    expect(client.web3).toBeInstanceOf(JsonRpcProvider);

    await client
      .checkWeb3Status()
      .then(isUp => {
        expect(isUp).toEqual(false);
        return client.shiftWeb3Node().checkWeb3Status();
      })
      .then(isUp => {
        expect(isUp).toEqual(true);
      });
  });
});
