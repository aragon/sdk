// @ts-ignore
declare const describe, it, beforeAll, afterAll, expect, test;

import { JsonRpcProvider } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";
import { ClientErc20, ContextErc20, ContextErc20Params } from "../../src";
// import { ICreateProposal, VoteOption } from "../../src/internal/interfaces/dao";
import * as ganacheSetup from "../../../../helpers/ganache-setup";
import * as deployContracts from "../../../../helpers/deployContracts";
import {
  ICreateProposalParams,
  // IWithdrawParams,
  ProposalCreationSteps,
  VoteOptions,
} from "../../src/internal/interfaces/plugins";

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

const contextParams: ContextErc20Params = {
  network: "mainnet",
  signer: new Wallet(TEST_WALLET),
  dao: "0x1234567890123456789012345678901234567890",
  daoFactoryAddress: "0x0123456789012345678901234567890123456789",
  web3Providers: web3endpoints.working,
  pluginAddress: "0x2345678901234567890123456789012345678901",
  ipfsNodes: [
    {
      url: "https://testing-ipfs-0.aragon.network/api/v0",
      headers: {
        "X-API-KEY": IPFS_API_KEY || "",
      },
    },
  ],
  subgraphURLs: ["https://api.thegraph.com/subgraphs/name/aragon/aragon-zaragoza-rinkeby"]
};

const contextParamsLocalChain: ContextErc20Params = {
  network: 31337,
  signer: new Wallet(TEST_WALLET),
  dao: "0x1234567890123456789012345678901234567890",
  daoFactoryAddress: "0xf8065dD2dAE72D4A8e74D8BB0c8252F3A9acE7f9",
  web3Providers: ["http://localhost:8545"],
  pluginAddress: "0x2345678901234567890123456789012345678901",
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
  subgraphURLs: ["https://api.thegraph.com/subgraphs/name/aragon/aragon-zaragoza-rinkeby"]
};

describe("Client", () => {
  beforeAll(async () => {
    const server = await ganacheSetup.start();
    const daoFactory = await deployContracts.deploy(server);
    contextParamsLocalChain.daoFactoryAddress = daoFactory.address;
  });

  afterAll(async () => {
    await ganacheSetup.stop();
  });

  describe("Client instances", () => {
    it("Should create a working client", async () => {
      const ctx = new ContextErc20(contextParams);
      const client = new ClientErc20(ctx);

      expect(client).toBeInstanceOf(ClientErc20);
      expect(client.web3.getProvider()).toBeInstanceOf(JsonRpcProvider);
      expect(client.web3.getConnectedSigner()).toBeInstanceOf(Wallet);

      const status = await client.web3.isUp();
      expect(status).toEqual(true);
    });
    it("Should create a failing client", async () => {
      contextParams.web3Providers = web3endpoints.failing;
      const context = new ContextErc20(contextParams);
      const client = new ClientErc20(context);

      expect(client).toBeInstanceOf(ClientErc20);
      expect(client.web3.getProvider()).toBeInstanceOf(JsonRpcProvider);
      expect(client.web3.getConnectedSigner()).toBeInstanceOf(Wallet);

      const web3Status = await client.web3.isUp();
      expect(web3Status).toEqual(false);
    });
    it("Should create a client, fail and shift to a working endpoint", async () => {
      contextParams.web3Providers = web3endpoints.failing.concat(
        web3endpoints.working,
      );
      const context = new ContextErc20(contextParams);
      const client = new ClientErc20(context);

      await client
        .web3.isUp()
        .then((isUp) => {
          expect(isUp).toEqual(false);
          client.web3.shiftProvider();

          return client.web3.isUp();
        })
        .then((isUp) => {
          expect(isUp).toEqual(true);
        });
    });
  });

  describe("Proposal Creation", () => {
    test.todo("Should estimate gas fees for creating a new proposal");
    // it("Should estimate gas fees for creating a new proposal", async () => {
    //   const context = new ContextErc20(contextParamsLocalChain);
    //   const client = new ClientErc20(context);

    //   const proposalParams: ICreateProposalParams = {
    //     metadataUri: "ipfs://",
    //     actions: [],
    //     creatorVote: VoteOptions.YEA,
    //     startDate: new Date(),
    //     endDate: new Date(),
    //     executeIfPassed: true,
    //   };

    //   const gasFeesEstimation = await client.estimation.createProposal(
    //     proposalParams,
    //   );

    //   expect(typeof gasFeesEstimation).toEqual("object");
    //   expect(typeof gasFeesEstimation.average).toEqual("bigint");
    //   expect(typeof gasFeesEstimation.max).toEqual("bigint");
    //   expect(typeof gasFeesEstimation.max).toBeGreaterThan(BigInt(0));
    //   expect(gasFeesEstimation.max).toBeGreaterThan(gasFeesEstimation.average);
    // });
    it("Should create a proposal locally", async () => {
      const context = new ContextErc20(contextParamsLocalChain);
      const client = new ClientErc20(context);

      const proposalParams: ICreateProposalParams = {
        metadataUri: "ipfs://",
        actions: [
          client.encoding.withdrawAction({
            recipientAddress: "0x9a16078c911afAb4CE4B7d261A67F8DF99fAd877",
            amount: BigInt(10),
            reference: "Test",
          }),
        ],
        creatorVote: VoteOptions.NAY,
        startDate: new Date(),
        endDate: new Date(),
        executeIfPassed: true,
      };

      for await (const step of client.methods.createProposal(proposalParams)) {
        switch (step.key) {
          case ProposalCreationSteps.CREATING:
            expect(typeof step.txHash).toBe("string");
            expect(step.txHash).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
            break;
          case ProposalCreationSteps.DONE:
            expect(typeof step.proposalId).toBe("string");
            expect(step.proposalId).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
            break;
          default:
            throw new Error(
              "Unexpected DAO deposit step: " + Object.keys(step).join(", "),
            );
        }
      }
    });
  });

  describe("Action generators", () => {
    test.todo(
      "Should create a ERC20VotingDAO client and generate a withdraw action",
    );
    // it("Should create a ERC20VotingDAO client and generate a withdraw action", async () => {
    //   const context = new ContextErc20(contextParamsLocalChain);
    //   const client = new ClientErc20(context);

    //   const withdrawParams: IWithdrawParams = {
    //     recipientAddress: "0x9a16078c911afAb4CE4B7d261A67F8DF99fAd877",
    //     amount: BigInt(10),
    //     reference: "Test",
    //   };

    //   const withdrawAction = client.encoding.withdrawAction(withdrawParams);

    //   expect(typeof withdrawAction).toBe("object");
    //   expect(withdrawAction.to).toEqual(
    //     "0x9a16078c911afAb4CE4B7d261A67F8DF99fAd877",
    //   );
    //   expect(withdrawAction.value).toEqual(BigInt(10));
    //   expect(withdrawAction.data).toEqual(
    //     "0x4f06563200000000000000000000000000000000000000000000000000000000000000000000000000000000000000009a16078c911afab4ce4b7d261a67f8df99fad877000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000045465737400000000000000000000000000000000000000000000000000000000",
    //   );
    // });
  });
});
