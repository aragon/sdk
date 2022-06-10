import { JsonRpcProvider } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";
import {
  ClientDaoERC20Voting,
  ClientDaoWhitelistVoting,
  Context,
  ContextParams,
  ICreateDaoERC20Voting,
  ICreateDaoWhitelistVoting,
  IWithdraw,
} from "../../src";
// import { ICreateProposal, VoteOption } from "../../src/internal/interfaces/dao";
import * as ganacheSetup from "../../../../helpers/ganache-setup";
import * as deployContracts from "../../../../helpers/deployContracts";

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
  ipfsNodes: [
    {
      url: "https://testing-ipfs-0.aragon.network",
      headers:{
        "X-API-KEY": process.env.IPFS_API_KEY || ""
      }
    }
  ],
};

const contextParamsLocalChain: ContextParams = {
  network: 31337,
  signer: new Wallet(TEST_WALLET),
  dao: "0x1234567890123456789012345678901234567890",
  daoFactoryAddress: "0xf8065dD2dAE72D4A8e74D8BB0c8252F3A9acE7f9",
  web3Providers: ["http://localhost:8545"],
  ipfsNodes: [
    {
      url: "http:localhost:5001",
    },
    {
      url: "http:localhost:5002",
    },
    {
      url: "http:localhost:5003",
    },
  ],
};

describe("Client instances", () => {
  beforeAll(async () => {
    const server = await ganacheSetup.start();
    const daoFactory = await deployContracts.deploy(server);
    contextParamsLocalChain.daoFactoryAddress = daoFactory.address;
  });

  afterAll(async () => {
    await ganacheSetup.stop();
  });

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

    const gasFeesEstimation = await client.estimate.create(daoCreationParams);

    expect(typeof gasFeesEstimation).toEqual("object");
    expect(typeof gasFeesEstimation.average).toEqual("bigint");
    expect(typeof gasFeesEstimation.max).toEqual("bigint");
    expect(gasFeesEstimation.max > gasFeesEstimation.average).toBeTruthy();
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

    const gasFeesEstimation = await client.estimate.create(daoCreationParams);

    expect(typeof gasFeesEstimation).toEqual("object");
    expect(typeof gasFeesEstimation.average).toEqual("bigint");
    expect(typeof gasFeesEstimation.max).toEqual("bigint");
    expect(gasFeesEstimation.max > gasFeesEstimation.average).toBeTruthy();
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
  it("Should connect to a IPFS node and upload a string and recover the same string", async () => {
    const context = new Context(contextParams);
    const client = new ClientDaoERC20Voting(context);
    const originalStr = "I am a test";
    const cid = await client.pin(originalStr);
    const recoveredString = await client.fetchString(cid);
    const recoveredBytes = await client.fetchBytes(cid);
    const decodedString = new TextDecoder().decode(recoveredBytes)

    expect(typeof recoveredBytes).toBe("object");
    expect(typeof recoveredString).toBe("string");
    expect(typeof decodedString).toBe("string");
    expect(recoveredString).toEqual(originalStr);
    expect(decodedString).toEqual(originalStr);
  });
  it("Should connect to a IPFS node and upload bytes and recover the same string", async () => {
    const context = new Context(contextParams);
    const client = new ClientDaoERC20Voting(context);
    const originalBytes = new Uint8Array([72, 101, 108, 108, 111, 32, 84, 104, 101, 114, 101, 32, 58, 41]);
    const cid = await client.pin(originalBytes);
    const recoveredString = await client.fetchString(cid);
    const recoveredBytes = await client.fetchBytes(cid);
    const decodedString = new TextDecoder().decode(recoveredBytes);

    expect(typeof recoveredBytes).toBe("object");
    expect(typeof recoveredString).toBe("string");
    expect(typeof decodedString).toBe("string");
    expect(recoveredString).toEqual("Hello There :)");
    expect(decodedString).toEqual("Hello There :)");
  });
  // it("Should create a ERC20Voting proposal locally", async () => {
  //   const context = new Context(contextParamsLocalChain);
  //   const client = new ClientDaoERC20Voting(context);
  //
  //   const proposalCreationParams: ICreateProposal = {
  //     metadata: "0x1234",
  //     executeIfDecided: true,
  //     creatorChoice: VoteOption.YEA,
  //   };
  //
  //   const newProposalId = await client.dao.simpleVote.createProposal(
  //     "0xB30dAf0240261Be564Cea33260F01213c47AAa0D",
  //     proposalCreationParams
  //   );
  //
  //   expect(newProposalId).toBeInstanceOf(BigNumber);
  //   expect(BigNumber.isBigNumber(newProposalId)).toBeTruthy();
  //   expect(newProposalId.toBigInt()).toBeGreaterThan(0);
  // });
  // it("Should create a WhitelistVoting proposal locally", async () => {
  //   const context = new Context(contextParamsLocalChain);
  //   const client = new ClientDaoWhitelistVoting(context);
  //
  //   const proposalCreationParams: ICreateProposal = {
  //     metadata: "0x1234",
  //     executeIfDecided: true,
  //     creatorChoice: VoteOption.YEA,
  //   };
  //
  //   const newProposalId = await client.dao.whitelist.createProposal(
  //     "0xB30dAf0240261Be564Cea33260F01213c47AAa0D",
  //     proposalCreationParams
  //   );
  //
  //   expect(newProposalId).toBeInstanceOf(BigNumber);
  //   expect(BigNumber.isBigNumber(newProposalId)).toBeTruthy();
  //   expect(newProposalId.toBigInt()).toBeGreaterThan(0);
  // });
  it("Should create a ERC20VotingDAO client and generate a withdraw action", async () => {
    const context = new Context(contextParamsLocalChain);
    const client = new ClientDaoERC20Voting(context);

    const withdrawParams: IWithdraw = {
      to: "0x9a16078c911afAb4CE4B7d261A67F8DF99fAd877",
      amount: BigInt(10),
      reference: "Test",
    };

    const withdrawAction = client.actions.withdraw(
      "0x9a16078c911afAb4CE4B7d261A67F8DF99fAd877",
      BigInt(1),
      withdrawParams
    );

    expect(typeof withdrawAction).toBe("object");
    expect(withdrawAction.to).toEqual(
      "0x9a16078c911afAb4CE4B7d261A67F8DF99fAd877"
    );
    expect(withdrawAction.value).toEqual(BigInt(1));
    expect(withdrawAction.data).toEqual(
      "0x4f06563200000000000000000000000000000000000000000000000000000000000000000000000000000000000000009a16078c911afab4ce4b7d261a67f8df99fad877000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000045465737400000000000000000000000000000000000000000000000000000000"
    );
  });
  it("Should create a WhitelistVoting client and generate a withdraw action", async () => {
    const context = new Context(contextParamsLocalChain);
    const client = new ClientDaoWhitelistVoting(context);

    const withdrawParams: IWithdraw = {
      to: "0x9a16078c911afAb4CE4B7d261A67F8DF99fAd877",
      amount: BigInt(10),
      reference: "Test",
    };

    const withdrawAction = client.actions.withdraw(
      "0x9a16078c911afAb4CE4B7d261A67F8DF99fAd877",
      BigInt(1),
      withdrawParams
    );

    expect(typeof withdrawAction).toBe("object");
    expect(withdrawAction.to).toEqual(
      "0x9a16078c911afAb4CE4B7d261A67F8DF99fAd877"
    );
    expect(withdrawAction.value).toEqual(BigInt(1));
    expect(withdrawAction.data).toEqual(
      "0x4f06563200000000000000000000000000000000000000000000000000000000000000000000000000000000000000009a16078c911afab4ce4b7d261a67f8df99fad877000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000045465737400000000000000000000000000000000000000000000000000000000"
    );
  });
});
