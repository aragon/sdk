import { ClientDao } from "../../src";
import { JsonRpcProvider } from "@ethersproject/providers";

const web3endpoints = {
  working: [
    "https://cloudflare-eth.com/",
    "https://mainnet.infura.io/v3/94d2e8caf1bc4c4884af830d96f927ca",
  ],
  failing: ["https://bad-url-gateway.io/"],
};

describe("Client instances", () => {
  it("Should create an empty client", () => {
    const client = new ClientDao();

    expect(client).toBeInstanceOf(ClientDao);
    expect(client.signer).toEqual(undefined);
  });
  it("Should create a working client", async () => {
    const client = new ClientDao("mainnet", web3endpoints.working);

    expect(client).toBeInstanceOf(ClientDao);
    expect(client.web3).toBeInstanceOf(JsonRpcProvider);

    const status = await client.checkWeb3Status();
    expect(status).toEqual(true);
  });
  it("Should create a failing client", async () => {
    const client = new ClientDao("mainnet", web3endpoints.failing);

    expect(client).toBeInstanceOf(ClientDao);
    expect(client.web3).toBeInstanceOf(JsonRpcProvider);

    const status = await client.checkWeb3Status();
    expect(status).toEqual(false);
  });
  it("Should create a client, fail and shift to a working endpoint", async () => {
    const client = new ClientDao(
      "mainnet",
      web3endpoints.failing.concat(web3endpoints.working)
    );

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
