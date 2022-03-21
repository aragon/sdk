import { JsonRpcProvider } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";
import { ClientDaoWhitelist, Context, ContextParams } from "../../src";

const web3endpoints = {
  working: [
    "https://cloudflare-eth.com/",
    "https://mainnet.infura.io/v3/94d2e8caf1bc4c4884af830d96f927ca",
  ],
  failing: ["https://bad-url-gateway.io/"],
};

const TEST_WALLET =
  "8d7d56a9efa4158d232edbeaae601021eb3477ad77b5f3c720601fd74e8e04bb";

const contextParams: ContextParams = {
  network: "mainnet",
  signer: new Wallet(TEST_WALLET),
  dao: "0x1234567890123456789012345678901234567890",
  daoFactoryAddress: "0x0123456789012345678901234567890123456789",
  web3Providers: web3endpoints.working,
  subgraphURL: "https://48p1r2roz4.sse.codesandbox.io/"
};

describe("Client instances", () => {
  it("Should create an empty client", () => {
    const client = new ClientDaoWhitelist({} as Context);

    expect(client).toBeInstanceOf(ClientDaoWhitelist);
  });
  it("Should create a working client", async () => {
    const context = new Context(contextParams);
    const client = new ClientDaoWhitelist(context);

    expect(client).toBeInstanceOf(ClientDaoWhitelist);
    expect(client.web3).toBeInstanceOf(JsonRpcProvider);

    const status = await client.checkWeb3Status();
    expect(status).toEqual(true);
  });
  it("Should create a failing client", async () => {
    contextParams.web3Providers = web3endpoints.failing;
    const context = new Context(contextParams);
    const client = new ClientDaoWhitelist(context);

    expect(client).toBeInstanceOf(ClientDaoWhitelist);
    expect(client.web3).toBeInstanceOf(JsonRpcProvider);

    const status = await client.checkWeb3Status();
    expect(status).toEqual(false);
  });
  it("Should create a client, fail and shift to a working endpoint", async () => {
    contextParams.web3Providers = web3endpoints.failing.concat(
      web3endpoints.working,
    );
    const context = new Context(contextParams);
    const client = new ClientDaoWhitelist(context);

    expect(client).toBeInstanceOf(ClientDaoWhitelist);
    expect(client.web3).toBeInstanceOf(JsonRpcProvider);

    await client
      .checkWeb3Status()
      .then((isUp) => {
        expect(isUp).toEqual(false);
        return client.shiftWeb3Node().checkWeb3Status();
      })
      .then((isUp) => {
        expect(isUp).toEqual(true);
      });
  });
  it("Should create a working client and succeed when checking graphQL status", async () => {
    contextParams.subgraphHeaders = {
      Authorization: 'Bearer MY_TOKEN',
      AnotherHeader: 'Another Value'
    };
    const context = new Context(contextParams);
    const client = new ClientDaoWhitelist(context);

    expect(client).toBeInstanceOf(ClientDaoWhitelist);
    expect(client.web3).toBeInstanceOf(JsonRpcProvider);

    const status = await client.checkGraphQLStatus();
    expect(status).toEqual(true);
  });
  it("Should create a working client and fail when checking graphQL status", async () => {
    contextParams.subgraphURL = "https://bad-url-gateway.io/"
    const context = new Context(contextParams);
    const client = new ClientDaoWhitelist(context);

    expect(client).toBeInstanceOf(ClientDaoWhitelist);
    expect(client.web3).toBeInstanceOf(JsonRpcProvider);

    const status = await client.checkGraphQLStatus();
    expect(status).toEqual(false);
  });
  it("Should create a working client and execute a graphQL request", async () => {
    contextParams.subgraphURL = "https://api.thegraph.com/subgraphs/name/aragon/aragon-zaragoza-rinkeby"
    const context = new Context(contextParams);
    const client = new ClientDaoWhitelist(context);

    expect(client).toBeInstanceOf(ClientDaoWhitelist);
    expect(client.web3).toBeInstanceOf(JsonRpcProvider);

    const daoList = await client.daoList(0, 100);
    expect(daoList.daos).toBeDefined();
    expect(daoList.daos).toBeInstanceOf(Array);
  });
});
