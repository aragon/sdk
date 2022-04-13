import { JsonRpcProvider } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";
import {
  ClientDaoERC20Voting,
  ClientDaoWhitelistVoting,
  Context,
  ContextParams,
  ICreateDaoERC20Voting,
  ICreateDaoWhitelistVoting,
} from "../../src";
import { BigNumber } from "@ethersproject/bignumber";

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

const contextParamsLocalChain: ContextParams = {
  network: 31337,
  signer: new Wallet(TEST_WALLET),
  dao: "0x1234567890123456789012345678901234567890",
  daoFactoryAddress: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
  web3Providers: ["http://localhost:8545"],
};

describe("Client instances", () => {
  it("Should create an empty client", () => {
    const clientDaoERC20Voting = new ClientDaoERC20Voting({} as Context);
    const clientDaoWhitelistVoting = new ClientDaoWhitelistVoting(
      {} as Context
    );

    expect(clientDaoERC20Voting).toBeInstanceOf(ClientDaoERC20Voting);
    expect(clientDaoWhitelistVoting).toBeInstanceOf(ClientDaoWhitelistVoting);
  });
  it("Should create a working client", async () => {
    const context = new Context(contextParams);
    const clientDaoERC20Voting = new ClientDaoERC20Voting(context);
    const clientDaoWhitelistVoting = new ClientDaoWhitelistVoting(context);

    expect(clientDaoERC20Voting).toBeInstanceOf(ClientDaoERC20Voting);
    expect(clientDaoWhitelistVoting).toBeInstanceOf(ClientDaoWhitelistVoting);

    expect(clientDaoERC20Voting.web3).toBeInstanceOf(JsonRpcProvider);
    expect(clientDaoWhitelistVoting.web3).toBeInstanceOf(JsonRpcProvider);

    expect(clientDaoERC20Voting.connectedSigner).toBeInstanceOf(Wallet);
    expect(clientDaoWhitelistVoting.connectedSigner).toBeInstanceOf(Wallet);

    const clientDaoERC20VotingStatus = await clientDaoERC20Voting.checkWeb3Status();
    expect(clientDaoERC20VotingStatus).toEqual(true);

    const clientDaoWhitelistVotingStatus = await clientDaoWhitelistVoting.checkWeb3Status();
    expect(clientDaoWhitelistVotingStatus).toEqual(true);
  });
  it("Should create a failing client", async () => {
    contextParams.web3Providers = web3endpoints.failing;
    const context = new Context(contextParams);
    const clientDaoERC20Voting = new ClientDaoERC20Voting(context);
    const clientDaoWhitelistVoting = new ClientDaoWhitelistVoting(context);

    expect(clientDaoERC20Voting).toBeInstanceOf(ClientDaoERC20Voting);
    expect(clientDaoWhitelistVoting).toBeInstanceOf(ClientDaoWhitelistVoting);

    expect(clientDaoERC20Voting.web3).toBeInstanceOf(JsonRpcProvider);
    expect(clientDaoWhitelistVoting.web3).toBeInstanceOf(JsonRpcProvider);

    expect(clientDaoERC20Voting.connectedSigner).toBeInstanceOf(Wallet);
    expect(clientDaoWhitelistVoting.connectedSigner).toBeInstanceOf(Wallet);

    const clientDaoERC20VotingStatus = await clientDaoERC20Voting.checkWeb3Status();
    expect(clientDaoERC20VotingStatus).toEqual(false);

    const clientDaoWhitelistVotingStatus = await clientDaoWhitelistVoting.checkWeb3Status();
    expect(clientDaoWhitelistVotingStatus).toEqual(false);
  });
  it("Should create a client, fail and shift to a working endpoint", async () => {
    contextParams.web3Providers = web3endpoints.failing.concat(
      web3endpoints.working
    );
    const context = new Context(contextParams);
    const clientDaoERC20Voting = new ClientDaoERC20Voting(context);
    const clientDaoWhitelistVoting = new ClientDaoWhitelistVoting(context);

    expect(clientDaoERC20Voting).toBeInstanceOf(ClientDaoERC20Voting);
    expect(clientDaoWhitelistVoting).toBeInstanceOf(ClientDaoWhitelistVoting);

    expect(clientDaoERC20Voting.web3).toBeInstanceOf(JsonRpcProvider);
    expect(clientDaoWhitelistVoting.web3).toBeInstanceOf(JsonRpcProvider);

    await clientDaoERC20Voting
      .checkWeb3Status()
      .then(isUp => {
        expect(isUp).toEqual(false);
        return clientDaoERC20Voting.shiftWeb3Node().checkWeb3Status();
      })
      .then(isUp => {
        expect(isUp).toEqual(true);
      });

    await clientDaoWhitelistVoting
      .checkWeb3Status()
      .then(isUp => {
        expect(isUp).toEqual(false);
        return clientDaoWhitelistVoting.shiftWeb3Node().checkWeb3Status();
      })
      .then(isUp => {
        expect(isUp).toEqual(true);
      });
  });
  it("Should estimate gas fees for creating a ERC20VotingDAO", async () => {
    const context = new Context(contextParamsLocalChain);
    const client = new ClientDaoERC20Voting(context);

    expect(client).toBeInstanceOf(ClientDaoERC20Voting);
    expect(client.web3).toBeInstanceOf(JsonRpcProvider);

    const daoCreationParams: ICreateDaoERC20Voting = {
      daoConfig: {
        name: "ERC20VotingDAO_" + Math.floor(Math.random() * 9999) + 1,
        metadata: "0x1234",
      },
      tokenConfig: {
        address: "0x0000000000000000000000000000000000000000",
        name:
          "TestToken" +
          (Math.random() + 1)
            .toString(36)
            .substring(4)
            .toUpperCase(),
        symbol:
          "TEST" +
          (Math.random() + 1)
            .toString(36)
            .substring(4)
            .toUpperCase(),
      },
      mintConfig: [
        {
          address: Wallet.createRandom().address,
          balance: BigInt(Math.floor(Math.random() * 9999) + 1),
        },
        {
          address: Wallet.createRandom().address,
          balance: BigInt(Math.floor(Math.random() * 9999) + 1),
        },
      ],
      votingConfig: {
        minSupport: Math.floor(Math.random() * 100) + 1,
        minParticipation: Math.floor(Math.random() * 100) + 1,
        minDuration: Math.floor(Math.random() * 9999) + 1,
      },
      gsnForwarder: Wallet.createRandom().address,
    };

    const gasFeesEstimation = await client.dao.estimateCreate(
      daoCreationParams
    );

    expect(BigNumber.isBigNumber(gasFeesEstimation)).toBeTruthy();
  });
  it("Should create a ERC20VotingDAO locally", async () => {
    const context = new Context(contextParamsLocalChain);
    const client = new ClientDaoERC20Voting(context);

    expect(client).toBeInstanceOf(ClientDaoERC20Voting);
    expect(client.web3).toBeInstanceOf(JsonRpcProvider);

    const daoCreationParams: ICreateDaoERC20Voting = {
      daoConfig: {
        name: "ERC20VotingDAO_" + Math.floor(Math.random() * 9999) + 1,
        metadata: "0x1234",
      },
      tokenConfig: {
        address: "0x0000000000000000000000000000000000000000",
        name:
          "TestToken" +
          (Math.random() + 1)
            .toString(36)
            .substring(4)
            .toUpperCase(),
        symbol:
          "TEST" +
          (Math.random() + 1)
            .toString(36)
            .substring(4)
            .toUpperCase(),
      },
      mintConfig: [
        {
          address: Wallet.createRandom().address,
          balance: BigInt(Math.floor(Math.random() * 9999) + 1),
        },
        {
          address: Wallet.createRandom().address,
          balance: BigInt(Math.floor(Math.random() * 9999) + 1),
        },
      ],
      votingConfig: {
        minSupport: Math.floor(Math.random() * 100) + 1,
        minParticipation: Math.floor(Math.random() * 100) + 1,
        minDuration: Math.floor(Math.random() * 9999) + 1,
      },
      gsnForwarder: Wallet.createRandom().address,
    };

    const newDaoAddress = await client.dao.create(daoCreationParams);

    expect(typeof newDaoAddress).toBe("string");
    expect(newDaoAddress.length).toBe(42);
    expect(newDaoAddress).toContain("0x");
    expect(newDaoAddress).toMatch(/^[A-Fa-f0-9]/i);
  });
  it("Should estimate gas fees for creating a WhitelistVoting", async () => {
    const context = new Context(contextParamsLocalChain);
    const client = new ClientDaoWhitelistVoting(context);

    expect(client).toBeInstanceOf(ClientDaoWhitelistVoting);
    expect(client.web3).toBeInstanceOf(JsonRpcProvider);

    const daoCreationParams: ICreateDaoWhitelistVoting = {
      daoConfig: {
        name: "WhitelistVotingDAO_" + Math.floor(Math.random() * 9999) + 1,
        metadata: "0x1234",
      },
      votingConfig: {
        minSupport: Math.floor(Math.random() * 100) + 1,
        minParticipation: Math.floor(Math.random() * 100) + 1,
        minDuration: Math.floor(Math.random() * 9999) + 1,
      },
      whitelistVoters: [
        Wallet.createRandom().address,
        Wallet.createRandom().address,
      ],
      gsnForwarder: Wallet.createRandom().address,
    };

    const gasFeesEstimation = await client.dao.estimateCreate(
      daoCreationParams
    );

    expect(BigNumber.isBigNumber(gasFeesEstimation)).toBeTruthy();
  });
  it("Should create a WhitelistVoting locally", async () => {
    const context = new Context(contextParamsLocalChain);
    const client = new ClientDaoWhitelistVoting(context);

    expect(client).toBeInstanceOf(ClientDaoWhitelistVoting);
    expect(client.web3).toBeInstanceOf(JsonRpcProvider);

    const daoCreationParams: ICreateDaoWhitelistVoting = {
      daoConfig: {
        name: "WhitelistVotingDAO_" + Math.floor(Math.random() * 9999) + 1,
        metadata: "0x1234",
      },
      votingConfig: {
        minSupport: Math.floor(Math.random() * 100) + 1,
        minParticipation: Math.floor(Math.random() * 100) + 1,
        minDuration: Math.floor(Math.random() * 9999) + 1,
      },
      whitelistVoters: [
        Wallet.createRandom().address,
        Wallet.createRandom().address,
      ],
      gsnForwarder: Wallet.createRandom().address,
    };

    const newDaoAddress = await client.dao.create(daoCreationParams);

    expect(typeof newDaoAddress).toBe("string");
    expect(newDaoAddress.length).toBe(42);
    expect(newDaoAddress).toContain("0x");
    expect(newDaoAddress).toMatch(/^[A-Fa-f0-9]/i);
  });
});
