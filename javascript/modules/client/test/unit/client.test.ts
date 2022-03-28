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
  "0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e";

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
  it("Should create a DAO (just testing locally)", async () => {
    contextParams.network = 31337
    contextParams.web3Providers = ["http://localhost:8545"]
    contextParams.daoFactoryAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"
    // contextParams.web3Providers = ["https://eth-rinkeby.alchemyapi.io/v2/bgIqe2NxazpzsjfmVmhj3aS3j_HZ9mpr"]
    const context = new Context(contextParams);
    const client = new ClientDaoWhitelist(context);

    expect(client).toBeInstanceOf(ClientDaoWhitelist);
    expect(client.web3).toBeInstanceOf(JsonRpcProvider);

    const createDao = await client
      .dao.create(
        { name: 'test' + Math.random().toString(), metadata:'0x1111' },
        { addr: '0x0000000000000000000000000000000000000000', name:'TestMVM', symbol:'MVM' },
        {
          receivers: ['0x71EeDbe7c99d08C9755579f2c312C8E2755F165F',
            '0xc95D9623E8FDc248C61152bAC87c2f914FEB7b13'],
          amounts: [BigInt(1), BigInt(1)]
        },
        { minParticipation: 10, minDuration: 10, minSupport: 10 },
          '0x71EeDbe7c99d08C9755579f2c312C8E2755F165F'
      )

    expect(createDao).toEqual("0x1234567890123456789012345678901234567890")
  });
});
