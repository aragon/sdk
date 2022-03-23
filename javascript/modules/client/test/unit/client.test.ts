import { JsonRpcProvider } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";
import {ClientDaoSimpleVote, ClientDaoWhitelist, Context, ContextParams} from "../../src";

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
  it("Should be a test", async () => {
    contextParams.network = "rinkeby"
    contextParams.web3Providers = ["https://rinkeby.infura.io/v3/b5825b1fbf1e4a828cc385de83b9dc7e"]
    // contextParams.web3Providers = ["https://eth-rinkeby.alchemyapi.io/v2/bgIqe2NxazpzsjfmVmhj3aS3j_HZ9mpr"]
    const context = new Context(contextParams);
    const client = new ClientDaoSimpleVote(context);

    expect(client).toBeInstanceOf(ClientDaoSimpleVote);
    expect(client.web3).toBeInstanceOf(JsonRpcProvider);
// console.log(client.web3)
    const testAttach = await client
        .attachContractExample("0xbda31B34f09069DF702cC9eC7F27AEAFAA3a2ce7")
    console.log(testAttach.functions)
    console.log(await testAttach.functions.daoBase())

    const overrideOptions = {
      gasLimit: 30000000,
      gasPrice: 100000
    };

    console.log(await testAttach.functions.newDAO(
        ['test1', '0x1111'],
        ['0x0000000000000000000000000000000000000000','TestMVM1','MVM1'],
        [
          ['0x71EeDbe7c99d08C9755579f2c312C8E2755F165F',
            '0xc95D9623E8FDc248C61152bAC87c2f914FEB7b13'],
          [1,1]
        ],
        [10, 10, 10],
        '0x71EeDbe7c99d08C9755579f2c312C8E2755F165F', overrideOptions
        // '0x71EeDbe7c99d08C9755579f2c312C8E2755F165F', overrideOptions
    ))
  });
});
