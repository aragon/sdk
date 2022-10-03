// @ts-ignore
declare const describe, it, beforeAll, afterAll, expect, test;

import { JsonRpcProvider } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";
import {
  Client,
  ClientErc20,
  Context,
  ContextParams,
  ContextPlugin,
  SortDirection,
} from "../../src";
import * as ganacheSetup from "../../../../helpers/ganache-setup";
import * as deployContracts from "../../../../helpers/deployContracts";
import { Client as IpfsClient } from "@aragon/sdk-ipfs";
import { GraphQLClient } from "graphql-request";

import {
  ExecuteProposalStep,
  ICanVoteParams,
  ICreateProposalParams,
  IErc20PluginInstall,
  IExecuteProposalParams,
  IMintTokenParams,
  IPluginSettings,
  IProposalQueryParams,
  IVoteProposalParams,
  ProposalCreationSteps,
  ProposalSortBy,
  VoteProposalStep,
  VoteValues,
} from "../../src/internal/interfaces/plugins";
import { AddressZero } from "@ethersproject/constants";
import {
  bytesToHex,
  InvalidAddressError,
  InvalidAddressOrEnsError,
} from "@aragon/sdk-common";

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
const ipfsEndpoints = {
  working: [
    {
      url: "https://testing-ipfs-0.aragon.network/api/v0",
      headers: {
        "X-API-KEY": IPFS_API_KEY || "",
      },
    },
  ],
  failing: [
    {
      url: "https://bad-url-gateway.io/",
    },
  ],
};
const grapqhlEndpoints = {
  working: [
    {
      url:
        "https://api.thegraph.com/subgraphs/name/aragon/aragon-zaragoza-rinkeby",
    },
  ],
  failing: [{ url: "https://bad-url-gateway.io/" }],
};

const TEST_WALLET =
  "0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e";

const contextParams: ContextParams = {
  network: "mainnet",
  signer: new Wallet(TEST_WALLET),
  daoFactoryAddress: "0x0123456789012345678901234567890123456789",
  web3Providers: web3endpoints.working,
  ipfsNodes: ipfsEndpoints.working,
  graphqlNodes: grapqhlEndpoints.working,
};
const contextParamsFailing: ContextParams = {
  network: "mainnet",
  signer: new Wallet(TEST_WALLET),
  daoFactoryAddress: "0x0123456789012345678901234567890123456789",
  web3Providers: web3endpoints.failing,
  ipfsNodes: ipfsEndpoints.failing,
  graphqlNodes: grapqhlEndpoints.failing,
};

const contextParamsLocalChain: ContextParams = {
  network: 31337,
  signer: new Wallet(TEST_WALLET),
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
  graphqlNodes: [{
    url:
      "https://api.thegraph.com/subgraphs/name/aragon/aragon-zaragoza-rinkeby",
  }],
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
      const ctx = new Context(contextParams);
      const ctxPlugin = ContextPlugin.fromContext(ctx)
      const client = new ClientErc20(ctxPlugin);

      expect(client).toBeInstanceOf(ClientErc20);
      expect(client.web3.getProvider()).toBeInstanceOf(JsonRpcProvider);
      expect(client.web3.getConnectedSigner()).toBeInstanceOf(Wallet);
      expect(client.ipfs.getClient()).toBeInstanceOf(IpfsClient);
      expect(client.graphql.getClient()).toBeInstanceOf(GraphQLClient);

      // Web3
      const web3status = await client.web3.isUp();
      expect(web3status).toEqual(true);
      // IPFS
      await client.ipfs.ensureOnline();
      const ipfsStatus = await client.ipfs.isUp();
      expect(ipfsStatus).toEqual(true);
      // GraqphQl
      await client.graphql.ensureOnline();
      const graphqlStatus = await client.graphql.isUp();
      expect(graphqlStatus).toEqual(true);
    });

    it("Should create a failing client", async () => {
      const ctx = new Context(contextParamsFailing);
      const ctxPlugin = ContextPlugin.fromContext(ctx)
      const client = new ClientErc20(ctxPlugin);

      expect(client).toBeInstanceOf(ClientErc20);
      expect(client.web3.getProvider()).toBeInstanceOf(JsonRpcProvider);
      expect(client.web3.getConnectedSigner()).toBeInstanceOf(Wallet);
      expect(client.ipfs.getClient()).toBeInstanceOf(IpfsClient);
      expect(client.graphql.getClient()).toBeInstanceOf(GraphQLClient);

      // Web3
      const web3status = await client.web3.isUp();
      expect(web3status).toEqual(false);
      // IPFS
      const ipfsStatus = await client.ipfs.isUp();
      expect(ipfsStatus).toEqual(false);
      // GraqphQl
      const graphqlStatus = await client.graphql.isUp();
      expect(graphqlStatus).toEqual(false);
    });
  });
  describe("Proposal Creation", () => {
    it("Should estimate the gas fees for creating a new proposal", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx)
      const client = new ClientErc20(ctxPlugin);

      const proposalParams: ICreateProposalParams = {
        pluginAddress: "0x1234567890123456789012345678901234567890",
        metadata: {
          title: "Best Proposal",
          summary: "this is the sumnary",
          description: "This is a very long description",
          resources: [{
            name: "Website",
            url: "https://the.website",
          }],
          media: {
            header: "https://no.media/media.jpeg",
            logo: "https://no.media/media.jpeg",
          },
        },
        actions: [],
        creatorVote: VoteValues.YES,
        startDate: new Date(),
        endDate: new Date(),
        executeOnPass: true,
      };

      const estimation = await client.estimation.createProposal(proposalParams);

      expect(typeof estimation).toEqual("object");
      expect(typeof estimation.average).toEqual("bigint");
      expect(typeof estimation.max).toEqual("bigint");
      expect(estimation.max).toBeGreaterThan(BigInt(0));
      expect(estimation.max).toBeGreaterThan(estimation.average);
    });
    it("Should create a new proposal locally", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx)
      const erc20Client = new ClientErc20(ctxPlugin);
      const client = new Client(ctx);

      // generate actions
      const action = await client.encoding.withdrawAction(
        "0x1234567890123456789012345678901234567890",
        {
          recipientAddress: "0x1234567890123456789012345678901234567890",
          amount: BigInt(1),
          reference: "test",
        },
      );

      const proposalParams: ICreateProposalParams = {
        pluginAddress: "0x1234567890123456789012345678901234567890",
        metadata: {
          title: "Best Proposal",
          summary: "this is the sumnary",
          description: "This is a very long description",
          resources: [{
            name: "Website",
            url: "https://the.website",
          }],
          media: {
            header: "https://no.media/media.jpeg",
            logo: "https://no.media/media.jpeg",
          },
        },
        actions: [action],
        creatorVote: VoteValues.YES,
        startDate: new Date(),
        endDate: new Date(),
        executeOnPass: true,
      };

      for await (
        const step of erc20Client.methods.createProposal(proposalParams)
      ) {
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
              "Unexpected proposal creation step: " +
                Object.keys(step).join(", "),
            );
        }
      }
    });
  });

  describe("Vote on a proposal", () => {
    it("Should estimate the gas fees for casting a vote", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx)
      const client = new ClientErc20(ctxPlugin);

      const voteParams: IVoteProposalParams = {
        pluginAddress: "0x1234567890123456789012345678901234567890",
        proposalId: "0x1234567890123456789012345678901234567890",
        vote: VoteValues.YES,
      };
      const estimation = await client.estimation.voteProposal(voteParams);

      expect(typeof estimation).toEqual("object");
      expect(typeof estimation.average).toEqual("bigint");
      expect(typeof estimation.max).toEqual("bigint");
      expect(estimation.max).toBeGreaterThan(BigInt(0));
      expect(estimation.max).toBeGreaterThan(estimation.average);
    });

    it("Should vote on a proposal locally", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx)
      const client = new ClientErc20(ctxPlugin);

      const voteParams: IVoteProposalParams = {
        pluginAddress: "0x1234567890123456789012345678901234567890",
        proposalId: "0x1234567890123456789012345678901234567890",
        vote: VoteValues.YES,
      };

      for await (const step of client.methods.voteProposal(voteParams)) {
        switch (step.key) {
          case VoteProposalStep.VOTING:
            expect(typeof step.txHash).toBe("string");
            expect(step.txHash).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
            break;
          case VoteProposalStep.DONE:
            expect(typeof step.voteId).toBe("string");
            expect(step.voteId).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
            break;
          default:
            throw new Error(
              "Unexpected vote proposal step: " + Object.keys(step).join(", "),
            );
        }
      }
    });
  });

  describe("Execute proposal", () => {
    it("Should estimate the gas fees for executing a proposal", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx)
      const client = new ClientErc20(ctxPlugin);

      const executeParams: IExecuteProposalParams = {
        pluginAddress: "0x1234567890123456789012345678901234567890",
        proposalId: "0x1234567890123456789012345678901234567890",
      };
      const estimation = await client.estimation.executeProposal(executeParams);

      expect(typeof estimation).toEqual("object");
      expect(typeof estimation.average).toEqual("bigint");
      expect(typeof estimation.max).toEqual("bigint");
      expect(estimation.max).toBeGreaterThan(BigInt(0));
      expect(estimation.max).toBeGreaterThan(estimation.average);
    });

    it("Should execute a local proposal", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx)
      const client = new ClientErc20(ctxPlugin);

      const executeParams: IExecuteProposalParams = {
        pluginAddress: "0x1234567890123456789012345678901234567890",
        proposalId: "0x1234567890123456789012345678901234567890",
      };

      for await (const step of client.methods.executeProposal(executeParams)) {
        switch (step.key) {
          case ExecuteProposalStep.EXECUTING:
            expect(typeof step.txHash).toBe("string");
            expect(step.txHash).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
            break;
          case ExecuteProposalStep.DONE:
            break;
          default:
            throw new Error(
              "Unexpected execute proposal step: " +
                Object.keys(step).join(", "),
            );
        }
      }
    });
  });

  describe("Can vote", () => {
    it("Should check if an user can vote in an ERC20 proposal", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx)
      const client = new ClientErc20(ctxPlugin);

      const params: ICanVoteParams = {
        address: "0x1234567890123456789012345678901234567890",
        proposalId: "0x1234567890123456789012345678901234567890_0x1",
        pluginAddress: "0x1234567890123456789012345678901234567890",
      };
      const canVote = await client.methods.canVote(params);
      expect(typeof canVote).toBe("boolean");
    });
  });

  describe("Action generators", () => {
    it("Should create a Erc20 client and generate a install entry", async () => {
      const initParams: IErc20PluginInstall = {
        settings: {
          minDuration: 7200,
          minTurnout: 0.5,
          minSupport: 0.5,
        },
        useToken: {
          address: AddressZero,
        },
      };
      const erc20InstallPluginItem = ClientErc20.encoding.getPluginInstallItem(
        initParams,
      );

      expect(typeof erc20InstallPluginItem).toBe("object");
      expect(erc20InstallPluginItem.data).toBeInstanceOf(Uint8Array);
    });
    it("Should encode an update plugin settings action and fail with an invalid address", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx)
      const client = new ClientErc20(ctxPlugin);
      const params: IPluginSettings = {
        minDuration: 7200,
        minTurnout: 0.5,
        minSupport: 0.5,
      };

      const pluginAddress = "0xinvalid_address";
      expect(() =>
        client.encoding.updatePluginSettingsAction(
          pluginAddress,
          params,
        )
      ).toThrow("Invalid plugin address");
    });
    it("Should encode an update plugin settings action", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx)
      const client = new ClientErc20(ctxPlugin);
      const params: IPluginSettings = {
        minDuration: 7200,
        minTurnout: 0.5,
        minSupport: 0.5,
      };

      const pluginAddress = "0x1234567890123456789012345678901234567890";

      const updatePluginSettingsAction = client.encoding
        .updatePluginSettingsAction(pluginAddress, params);

      expect(typeof updatePluginSettingsAction).toBe("object");
      expect(updatePluginSettingsAction.data).toBeInstanceOf(Uint8Array);
      expect(updatePluginSettingsAction.to).toBe(pluginAddress);
    });
    it("Should encode a mint action with an invalid recipient address and fail", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx)
      const client = new ClientErc20(ctxPlugin);
      const params: IMintTokenParams = {
        address: "0xinvalid_address",
        amount: BigInt(10),
      };

      const minterAddress = "0x1234567890123456789012345678901234567890";
      expect(() =>
        client.encoding.mintTokenAction(
          minterAddress,
          params,
        )
      ).toThrow(new InvalidAddressError());
    });
    it("Should encode a mint action with an invalid token address and fail", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx)
      const client = new ClientErc20(ctxPlugin);
      const params: IMintTokenParams = {
        address: "0x1234567890123456789012345678901234567890",
        amount: BigInt(10),
      };

      const minterAddress = "0xinvalid_address";
      expect(() =>
        client.encoding.mintTokenAction(
          minterAddress,
          params,
        )
      ).toThrow(new InvalidAddressError());
    });
    it("Should encode an ERC20 token mint action", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx)
      const client = new ClientErc20(ctxPlugin);
      const params: IMintTokenParams = {
        address: "0x1234567890123456789012345678901234567890",
        amount: BigInt(10),
      };

      const minterAddress = "0x0987654321098765432109876543210987654321";
      const action = client.encoding.mintTokenAction(minterAddress, params);
      expect(typeof action).toBe("object");
      expect(action.data).toBeInstanceOf(Uint8Array);
      expect(action.to).toBe(minterAddress);
    });
  });

  describe("Action decoders", () => {
    it("Should decode the plugin settings from an update plugin settings action", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx)
      const client = new ClientErc20(ctxPlugin);
      const params: IPluginSettings = {
        minDuration: 7200,
        minTurnout: 0.5,
        minSupport: 0.5,
      };

      const pluginAddress = "0x1234567890123456789012345678901234567890";

      const updatePluginSettingsAction = client.encoding
        .updatePluginSettingsAction(pluginAddress, params);
      const decodedParams: IPluginSettings = client.decoding
        .updatePluginSettingsAction(updatePluginSettingsAction.data);

      expect(decodedParams.minDuration).toBe(params.minDuration);
      expect(decodedParams.minSupport).toBe(params.minSupport);
      expect(decodedParams.minTurnout).toBe(params.minTurnout);
    });
    it("Should decode a mint action", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx)
      const client = new ClientErc20(ctxPlugin);
      const params: IMintTokenParams = {
        address: "0x1234567890123456789012345678901234567890",
        amount: BigInt(10),
      };

      const minterAddress = "0x0987654321098765432109876543210987654321";
      const action = client.encoding.mintTokenAction(minterAddress, params);
      const decodedParams = client.decoding.mintTokenAction(action.data);

      expect(decodedParams.address).toBe(params.address);
      expect(bytesToHex(action.data, true)).toBe(
        "0x40c10f190000000000000000000000001234567890123456789012345678901234567890000000000000000000000000000000000000000000000000000000000000000a",
      );
      expect(decodedParams.amount).toBe(params.amount);
    });

    it("Should try to decode a invalid action and with the update plugin settings decoder return an error", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx)
      const client = new ClientErc20(ctxPlugin);
      const data = new Uint8Array([11, 22, 22, 33, 33, 33]);

      expect(() =>
        client.decoding
          .updatePluginSettingsAction(data)
      )
        .toThrow(
          `no matching function (argument="sighash", value="0x0b161621", code=INVALID_ARGUMENT, version=abi/5.6.0)`,
        );
    });

    it("Should get the function for a given action data", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx)
      const client = new ClientErc20(ctxPlugin);
      const params: IPluginSettings = {
        minDuration: 7200,
        minTurnout: 0.5,
        minSupport: 0.5,
      };

      const pluginAddress = "0x1234567890123456789012345678901234567890";

      const updatePluginSettingsAction = client.encoding
        .updatePluginSettingsAction(pluginAddress, params);
      const iface = client.decoding.findInterface(
        updatePluginSettingsAction.data,
      );
      expect(iface?.id).toBe("function changeVoteConfig(uint64,uint64,uint64)");
      expect(iface?.functionName).toBe("changeVoteConfig");
      expect(iface?.hash).toBe("0x634fe2fb");
    });

    it("Should try to get the function of an invalid data and return null", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx)
      const client = new ClientErc20(ctxPlugin);
      const data = new Uint8Array([11, 22, 22, 33, 33, 33]);
      const iface = client.decoding.findInterface(data);
      expect(iface).toBe(null);
    });
  });

  describe("Data retrieval", () => {
    it("Should get the list of members that can vote in a proposal", async () => {
      const ctx = new Context(contextParams);
      const ctxPlugin = ContextPlugin.fromContext(ctx)
      const client = new ClientErc20(ctxPlugin);

      const daoAddress = "0x1234567890123456789012345678901234567890";
      const wallets = await client.methods.getMembers(daoAddress);

      expect(Array.isArray(wallets)).toBe(true);
      expect(wallets.length).toBeGreaterThan(0);
      expect(typeof wallets[0]).toBe("string");
      expect(wallets[0]).toMatch(/^0x[A-Fa-f0-9]{40}$/i);
    });
    it("Should fetch the given proposal", async () => {
      const ctx = new Context(contextParams);
      const ctxPlugin = ContextPlugin.fromContext(ctx)
      const client = new ClientErc20(ctxPlugin);

      const proposalId = "0xb7bf1249ddf62e7196f21c4a12f9ef39e09c1632_0x0";
      const proposal = await client.methods.getProposal(proposalId);

      expect(typeof proposal).toBe("object");
      expect(proposal === null).toBe(false);
      if (proposal) {
        expect(proposal.id).toBe(proposalId);
        expect(typeof proposal.id).toBe("string");
        expect(proposal.id).toMatch(/^0x[A-Fa-f0-9]{40}_0x[A-Fa-f0-9]{1,}$/i);
        expect(typeof proposal.dao.address).toBe("string");
        expect(proposal.dao.address).toMatch(/^0x[A-Fa-f0-9]{40}$/i);
        expect(typeof proposal.dao.name).toBe("string");
        expect(typeof proposal.creatorAddress).toBe("string");
        expect(proposal.creatorAddress).toMatch(/^0x[A-Fa-f0-9]{40}$/i);
        // check metadata
        expect(typeof proposal.metadata.title).toBe("string");
        expect(typeof proposal.metadata.summary).toBe("string");
        expect(typeof proposal.metadata.description).toBe("string");
        expect(Array.isArray(proposal.metadata.resources)).toBe(true);
        for (let i = 0; i < proposal.metadata.resources.length; i++) {
          const resource = proposal.metadata.resources[i];
          expect(typeof resource.name).toBe("string");
          expect(typeof resource.url).toBe("string");
        }
        if (proposal.metadata.media) {
          if (proposal.metadata.media.header) {
            expect(typeof proposal.metadata.media.header).toBe("string");
          }
          if (proposal.metadata.media.logo) {
            expect(typeof proposal.metadata.media.logo).toBe("string");
          }
        }
        expect(proposal.startDate instanceof Date).toBe(true);
        expect(proposal.endDate instanceof Date).toBe(true);
        expect(proposal.creationDate instanceof Date).toBe(true);
        expect(Array.isArray(proposal.actions)).toBe(true);
        // actions
        for (let i = 0; i < proposal.actions.length; i++) {
          const action = proposal.actions[i];
          expect(action.data instanceof Uint8Array).toBe(true);
          expect(typeof action.to).toBe("string");
          expect(typeof action.value).toBe("bigint");
        }
        // result
        expect(typeof proposal.result.yes).toBe("bigint");
        expect(typeof proposal.result.no).toBe("bigint");
        expect(typeof proposal.result.abstain).toBe("bigint");
        // setttings
        expect(typeof proposal.settings.duration).toBe("number");
        expect(typeof proposal.settings.minSupport).toBe("number");
        expect(typeof proposal.settings.minTurnout).toBe("number");
        expect(
          proposal.settings.minSupport >= 0 &&
            proposal.settings.minSupport <= 1,
        ).toBe(true);
        expect(
          proposal.settings.minTurnout >= 0 &&
            proposal.settings.minTurnout <= 1,
        ).toBe(true);
        // token
        expect(typeof proposal.token.name).toBe("string");
        expect(typeof proposal.token.symbol).toBe("string");
        expect(typeof proposal.token.decimals).toBe("number");
        expect(typeof proposal.token.address).toBe("string");
        expect(proposal.token.address).toMatch(/^0x[A-Fa-f0-9]{40}$/i);
        expect(typeof proposal.usedVotingWeight).toBe("bigint");
        expect(typeof proposal.totalVotingWeight).toBe("bigint");
        expect(Array.isArray(proposal.votes)).toBe(true);
        for (let i = 0; i < proposal.votes.length; i++) {
          const vote = proposal.votes[i];
          expect(typeof vote.address).toBe("string");
          expect(vote.address).toMatch(/^0x[A-Fa-f0-9]{40}$/i);
          expect(typeof vote.vote).toBe("number");
          expect(typeof vote.weight).toBe("bigint");
        }
      }
    });
    it("Should fetch the given proposal and fail because the proposal does not exist", async () => {
      const ctx = new Context(contextParams);
      const ctxPlugin = ContextPlugin.fromContext(ctx)
      const client = new ClientErc20(ctxPlugin);

      const proposalId = "0x1234567890123456789012345678901234567890_0x0";
      const proposal = await client.methods.getProposal(proposalId);

      expect(proposal === null).toBe(true);
    });
    it("Should get a list of proposals filtered by the given criteria", async () => {
      const ctx = new Context(contextParams);
      const ctxPlugin = ContextPlugin.fromContext(ctx)
      const client = new ClientErc20(ctxPlugin);
      const limit = 5;
      const params: IProposalQueryParams = {
        limit,
        sortBy: ProposalSortBy.CREATED_AT,
        direction: SortDirection.ASC,
      };
      const proposals = await client.methods.getProposals(params);

      expect(Array.isArray(proposals)).toBe(true);
      expect(proposals.length <= limit).toBe(true);
      for (let i = 0; i < proposals.length; i++) {
        const proposal = proposals[i];
        expect(typeof proposal.id).toBe("string");
        expect(proposal.id).toMatch(/^0x[A-Fa-f0-9]{40}_0x[A-Fa-f0-9]{1,}$/i);
        expect(typeof proposal.dao.address).toBe("string");
        expect(proposal.dao.address).toMatch(/^0x[A-Fa-f0-9]{40}$/i);
        expect(typeof proposal.dao.name).toBe("string");
        expect(typeof proposal.creatorAddress).toBe("string");
        expect(proposal.creatorAddress).toMatch(/^0x[A-Fa-f0-9]{40}$/i);
        expect(typeof proposal.metadata.title).toBe("string");
        expect(typeof proposal.metadata.summary).toBe("string");
        expect(proposal.startDate instanceof Date).toBe(true);
        expect(proposal.endDate instanceof Date).toBe(true);
        // result
        expect(typeof proposal.result.yes).toBe("bigint");
        expect(typeof proposal.result.no).toBe("bigint");
        expect(typeof proposal.result.abstain).toBe("bigint");
        // token
        expect(typeof proposal.token.name).toBe("string");
        expect(typeof proposal.token.symbol).toBe("string");
        expect(typeof proposal.token.decimals).toBe("number");
        expect(typeof proposal.token.address).toBe("string");
        expect(proposal.token.address).toMatch(/^0x[A-Fa-f0-9]{40}$/i);
      }
    });
    it("Should get a list of proposals from a specific dao", async () => {
      const ctx = new Context(contextParams);
      const ctxPlugin = ContextPlugin.fromContext(ctx)
      const client = new ClientErc20(ctxPlugin);
      const limit = 5;
      const address = "0xe0eb147d59f964a79cffc3736d5c620c4cb9c778";
      const params: IProposalQueryParams = {
        limit,
        sortBy: ProposalSortBy.CREATED_AT,
        direction: SortDirection.ASC,
        daoAddressOrEns: address,
      };
      const proposals = await client.methods.getProposals(params);

      expect(Array.isArray(proposals)).toBe(true);
      expect(proposals.length > 0 && proposals.length <= limit).toBe(true);
    });
    it("Should get a list of proposals from a dao that has no proposals", async () => {
      const ctx = new Context(contextParams);
      const ctxPlugin = ContextPlugin.fromContext(ctx)
      const client = new ClientErc20(ctxPlugin);
      const limit = 5;
      const address = "0x1234567890123456789012345678901234567890";
      const params: IProposalQueryParams = {
        limit,
        sortBy: ProposalSortBy.CREATED_AT,
        direction: SortDirection.ASC,
        daoAddressOrEns: address,
      };
      const proposals = await client.methods.getProposals(params);

      expect(Array.isArray(proposals)).toBe(true);
      expect(proposals.length === 0).toBe(true);
    });
    it("Should get a list of proposals from an invalid address", async () => {
      const ctx = new Context(contextParams);
      const ctxPlugin = ContextPlugin.fromContext(ctx)
      const client = new ClientErc20(ctxPlugin);
      const limit = 5;
      const address = "0xn0tv4l1d";
      const params: IProposalQueryParams = {
        limit,
        sortBy: ProposalSortBy.CREATED_AT,
        direction: SortDirection.ASC,
        daoAddressOrEns: address,
      };
      await expect(() => client.methods.getProposals(params)).rejects.toThrow(
        new InvalidAddressOrEnsError(),
      );
    });
    it("Should get the settings of a plugin given a plugin instance address", async () => {
      const ctx = new Context(contextParams);
      const ctxPlugin = ContextPlugin.fromContext(ctx)
      const client = new ClientErc20(ctxPlugin);

      const pluginAddress: string =
        "0xb7bf1249ddf62e7196f21c4a12f9ef39e09c1632";
      const settings = await client.methods.getSettings(pluginAddress);
      expect(settings === null).toBe(false);
      if (settings) {
        expect(typeof settings.minDuration).toBe("number");
        expect(typeof settings.minSupport).toBe("number");
        expect(typeof settings.minTurnout).toBe("number");
      }
    });
    it("Should get the token details of a plugin given a plugin instance address", async () => {
      const ctx = new Context(contextParams);
      const ctxPlugin = ContextPlugin.fromContext(ctx)
      const client = new ClientErc20(ctxPlugin);

      const pluginAddress: string =
        "0xb7bf1249ddf62e7196f21c4a12f9ef39e09c1632";
      const token = await client.methods.getToken(pluginAddress);
      expect(typeof token?.address).toBe("string");
      expect(typeof token?.decimals).toBe("number");
      expect(typeof token?.symbol).toBe("string");
      expect(typeof token?.name).toBe("string");
    });
    it("Should return null token details for nonexistent plugin addresses", async () => {
      const ctx = new Context(contextParams);
      const ctxPlugin = ContextPlugin.fromContext(ctx)
      const client = new ClientErc20(ctxPlugin);

      const pluginAddress: string =
        "0x1234567890123456789012345678901234567890";
      const token = await client.methods.getToken(pluginAddress);
      expect(token).toBe(null);
    });
  });
});
