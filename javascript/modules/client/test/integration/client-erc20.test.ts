// @ts-ignore
declare const describe, it, beforeAll, afterAll, expect, test;

import { JsonRpcProvider } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";
import { ClientErc20, ContextPlugin, ContextPluginParams, Client } from "../../src";
import * as ganacheSetup from "../../../../helpers/ganache-setup";
import * as deployContracts from "../../../../helpers/deployContracts";
import { Client as IpfsClient } from "@aragon/sdk-ipfs";
import { GraphQLClient } from "graphql-request";

import {
  ExecuteProposalStep,
  ICreateProposalParams,
  IErc20PluginInstall,
  IProposalQueryParams,
  ProposalCreationSteps,
  VoteValues,
  VoteProposalStep,
  IVoteProposalParams,
  IExecuteProposalParams,
  IPluginSettings,
} from "../../src/internal/interfaces/plugins";
import { AddressZero } from "@ethersproject/constants";

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
    }
  ],
};
const grapqhlEndpoints = {
  working: [
    { url: "https://api.thegraph.com/subgraphs/name/aragon/aragon-zaragoza-rinkeby" }
  ],
  failing: [{ url: "https://bad-url-gateway.io/" }],
};

const TEST_WALLET =
  "0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e";

const contextParams: ContextPluginParams = {
  network: "mainnet",
  signer: new Wallet(TEST_WALLET),
  daoFactoryAddress: "0x0123456789012345678901234567890123456789",
  web3Providers: web3endpoints.working,
  pluginAddress: "0x2345678901234567890123456789012345678901",
  ipfsNodes: ipfsEndpoints.working,
  graphqlNodes: grapqhlEndpoints.working
};

const contextParamsLocalChain: ContextPluginParams = {
  network: 31337,
  signer: new Wallet(TEST_WALLET),
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
  graphqlNodes: [{ url: "https://api.thegraph.com/subgraphs/name/aragon/aragon-zaragoza-rinkeby" }]
};

describe("Client", () => {
  beforeAll(async () => {
    const server = await ganacheSetup.start();
    const daoFactory = await deployContracts.deploy(server);
    contextParamsLocalChain.daoFactoryAddress = daoFactory.address;
  });

  afterAll(async () => {
    await ganacheSetup.stop()
  });

  describe("Client instances", () => {
    it("Should create a working client", async () => {
      const ctx = new ContextPlugin(contextParams);
      const client = new ClientErc20(ctx);

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
      contextParams.web3Providers = web3endpoints.failing
      contextParams.ipfsNodes = ipfsEndpoints.failing
      contextParams.graphqlNodes = grapqhlEndpoints.failing
      const ctx = new ContextPlugin(contextParams);
      const client = new ClientErc20(ctx);

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
      const context = new ContextPlugin(contextParamsLocalChain)
      const client = new ClientErc20(context)

      const proposalParams: ICreateProposalParams = {
        pluginAddress: "0x123456789012345678901234567890123456789012",
        metadata: {
          title: 'Best Proposal',
          summary: 'this is the sumnary',
          description: 'This is a very long description',
          resources: [{
            name: "Website",
            url: "https://the.website"
          }],
          media: {
            header: 'https://no.media/media.jpeg',
            logo: 'https://no.media/media.jpeg'
          }
        },
        actions: [],
        creatorVote: VoteValues.YES,
        startDate: new Date(),
        endDate: new Date(),
        executeOnPass: true
      }

      const estimation = await client.estimation.createProposal(proposalParams)

      expect(typeof estimation).toEqual("object")
      expect(typeof estimation.average).toEqual("bigint");
      expect(typeof estimation.max).toEqual("bigint");
      expect(estimation.max).toBeGreaterThan(BigInt(0));
      expect(estimation.max).toBeGreaterThan(estimation.average);

    })
    it("Should create a new proposal locally", async () => {
      const context = new ContextPlugin(contextParamsLocalChain)
      const erc20Client = new ClientErc20(context)
      const client = new Client(context)

      // generate actions
      const action = await client.encoding.withdrawAction(
        "0x1234567890123456789012345678901234567890",
        {
          recipientAddress: "0x1234567890123456789012345678901234567890",
          amount: BigInt(1),
          reference: 'test'
        })

      const proposalParams: ICreateProposalParams = {
        pluginAddress: "0x123456789012345678901234567890123456789012",
        metadata: {
          title: 'Best Proposal',
          summary: 'this is the sumnary',
          description: 'This is a very long description',
          resources: [{
            name: "Website",
            url: "https://the.website"
          }],
          media: {
            header: 'https://no.media/media.jpeg',
            logo: 'https://no.media/media.jpeg'
          }
        },
        actions: [action],
        creatorVote: VoteValues.YES,
        startDate: new Date(),
        endDate: new Date(),
        executeOnPass: true
      }

      for await (const step of erc20Client.methods.createProposal(proposalParams)) {
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
              "Unexpected proposal creation step: " + Object.keys(step).join(", "),
            );
        }
      }
    })
  });

  describe("Vote on a proposal", () => {
    it("Should estimate the gas fees for casting a vote", async () => {
      const context = new ContextPlugin(contextParamsLocalChain)
      const client = new ClientErc20(context)

      const voteParams: IVoteProposalParams = {
        pluginAddress: "0x123456789012345678901234567890123456789012",
        proposalId: '0x1234567890123456789012345678901234567890',
        vote: VoteValues.YES
      }
      const estimation = await client.estimation.voteProposal(voteParams)

      expect(typeof estimation).toEqual("object")
      expect(typeof estimation.average).toEqual("bigint");
      expect(typeof estimation.max).toEqual("bigint");
      expect(estimation.max).toBeGreaterThan(BigInt(0));
      expect(estimation.max).toBeGreaterThan(estimation.average);

    })

    it("Should vote on a proposal locally", async () => {
      const context = new ContextPlugin(contextParamsLocalChain)
      const client = new ClientErc20(context)

      const voteParams: IVoteProposalParams = {
        pluginAddress: "0x123456789012345678901234567890123456789012",
        proposalId: '0x1234567890123456789012345678901234567890',
        vote: VoteValues.YES
      }

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

    })
  })

  describe("Execute proposal", () => {
    it("Should estimate the gas fees for executing a proposal", async () => {
      const context = new ContextPlugin(contextParamsLocalChain)
      const client = new ClientErc20(context)


      const executeParams: IExecuteProposalParams = {
        pluginAddress: "0x123456789012345678901234567890123456789012",
        proposalId: '0x1234567890123456789012345678901234567890',
      }
      const estimation = await client.estimation.executeProposal(executeParams)

      expect(typeof estimation).toEqual("object")
      expect(typeof estimation.average).toEqual("bigint");
      expect(typeof estimation.max).toEqual("bigint");
      expect(estimation.max).toBeGreaterThan(BigInt(0));
      expect(estimation.max).toBeGreaterThan(estimation.average);

    })

    it("Should execute a local proposal", async () => {
      const context = new ContextPlugin(contextParamsLocalChain)
      const client = new ClientErc20(context)

      const executeParams: IExecuteProposalParams = {
        pluginAddress: "0x123456789012345678901234567890123456789012",
        proposalId: '0x1234567890123456789012345678901234567890',
      }

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
              "Unexpected execute proposal step: " + Object.keys(step).join(", "),
            );
        }
      }

    })
  })

  describe('Action generators', () => {
    it("Should create a Erc20 client and generate a install entry", async () => {
      const initParams: IErc20PluginInstall = {
        settings: {
          minDuration: 7200,
          minTurnout: 0.5,
          minSupport: 0.5
        },
        useToken: {
          address: AddressZero
        },
      };
      const erc20InstallPluginItem = ClientErc20.encoding.getPluginInstallItem(initParams);

      expect(typeof erc20InstallPluginItem).toBe("object");
      // what does this should be
      expect(erc20InstallPluginItem.data).toBeInstanceOf(Uint8Array);
    });
    it("Should encode an update plugin settings action", async () => {
      const context = new ContextPlugin(contextParamsLocalChain)
      const client = new ClientErc20(context)
      const params: IPluginSettings = {
        minDuration: 7200,
        minTurnout: 0.5,
        minSupport: 0.5
      };
      const updatePluginSettingsAction = client.encoding.updatePluginSettingsAction(params)

      expect(typeof updatePluginSettingsAction).toBe("object");
      // what does this should be
      expect(updatePluginSettingsAction.data).toBeInstanceOf(Uint8Array);
    });
  })

  describe('Action decoders', () => {
    it("Should dencode the plugin settings from an update plugin settings action", async () => {
      const context = new ContextPlugin(contextParamsLocalChain)
      const client = new ClientErc20(context)
      const params: IPluginSettings = {
        minDuration: 7200,
        minTurnout: 0.5,
        minSupport: 0.5
      };
      const updatePluginSettingsAction = client.encoding.updatePluginSettingsAction(params)
      const decodedParams: IPluginSettings = client.decoding.updatePluginSettingsAction(updatePluginSettingsAction.data)
      
      expect(decodedParams.minDuration).toBe(params.minDuration)
      expect(decodedParams.minSupport).toBe(params.minSupport)
      expect(decodedParams.minTurnout).toBe(params.minTurnout)
    });
  })

  describe('Data retrieval', () => {
    it("Should get the list of members that can vote in a proposal", async () => {
      const context = new ContextPlugin(contextParamsLocalChain);
      const client = new ClientErc20(context);

      const daoAddress = "0x1234567890123456789012345678901234567890"
      const wallets = await client.methods.getMembers(daoAddress)

      expect(Array.isArray(wallets)).toBe(true);
      expect(wallets.length).toBeGreaterThan(0);
      expect(typeof wallets[0]).toBe('string');
      expect(wallets[0]).toMatch(/^0x[A-Fa-f0-9]{40}$/i);
    })
    it("Should fetch the given proposal", async () => {
      const context = new ContextPlugin(contextParamsLocalChain);
      const client = new ClientErc20(context);

      const proposalId = "0x1234567890123456789012345678901234567890_0x55"
      const proposal = await client.methods.getProposal(proposalId)

      expect(typeof proposal).toBe('object');
      expect(proposal.id).toBe(proposalId);
      expect(proposal.id).toMatch(/^0x[A-Fa-f0-9]{40}_0x[A-Fa-f0-9]{1,}$/i);
    })
    it("Should get a list of proposals filtered by the given criteria", async () => {
      const context = new ContextPlugin(contextParamsLocalChain);
      const client = new ClientErc20(context);
      const limit = 5
      const params: IProposalQueryParams = {
        limit
      }
      const proposals = await client.methods.getProposals(params)

      expect(Array.isArray(proposals)).toBe(true)
      expect(proposals.length <= limit).toBe(true)
    })
    it("Should get the settings of a plugin given a plugin instance address", async () => {
      const context = new ContextPlugin(contextParamsLocalChain);
      const client = new ClientErc20(context);

      const pluginAddress: string = "0x12345678901234567890º1234567890123456789012"
      const proposals = await client.methods.getSettings(pluginAddress)

      expect(typeof proposals.minDuration).toBe('number')
      expect(typeof proposals.minSupport).toBe('number')
      expect(typeof proposals.minTurnout).toBe('number')
    })
  })

})