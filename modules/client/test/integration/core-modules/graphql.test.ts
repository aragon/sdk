import { Wallet } from "@ethersproject/wallet";
import { Client, Context, ContextParams } from "../../../src";

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

const contextParamsMainnet: ContextParams = {
  network: "mainnet",
  signer: new Wallet(TEST_WALLET),
  daoFactoryAddress: "0x0123456789012345678901234567890123456789",
  web3Providers: web3endpoints.working,
  ipfsNodes: [
    {
      url: "https://test.ipfs.aragon.network/api/v0",
      headers: {
        "X-API-KEY": IPFS_API_KEY,
      },
    },
  ],
  graphqlNodes: [{
    url:
      "https://api.thegraph.com/subgraphs/name/aragon/aragon-zaragoza-goerli",
  }],
};

describe("GraphQL core module", () => {
  it("Should detect all invalid graphql endpoints", async () => {
    const ctx = new Context(
      {
        ...contextParamsMainnet,
        graphqlNodes: [
          { url: "https://the.wrong/url" },
          { url: "https://the.wrong/url" },
          { url: "https://the.wrong/url" },
        ],
      },
    );
    const client = new Client(ctx);
    const isUp = await client.graphql.isUp();
    expect(isUp).toBe(false);
    await expect(client.graphql.ensureOnline()).rejects.toThrow(
      "No graphql nodes available",
    );
  });
  it("Should create a valid graphql client", async () => {
    const ctx = new Context(
      {
        ...contextParamsMainnet,
        graphqlNodes: [
          { url: "https://the.wrong/url" },
          { url: "https://the.wrong/url" },
          {
            url:
              "https://api.thegraph.com/subgraphs/name/aragon/aragon-zaragoza-goerli",
          },
          { url: "https://the.wrong/url" },
          { url: "https://the.wrong/url" },
          { url: "https://the.wrong/url" },
          { url: "https://the.wrong/url" },
          { url: "https://the.wrong/url" },
          { url: "https://the.wrong/url" },
        ],
      },
    );
    const client = new Client(ctx);
    await client.graphql.ensureOnline();
    const isUp = await client.graphql.isUp();
    expect(isUp).toBe(true);
  });
});
