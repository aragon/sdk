// @ts-ignore
declare const describe, it, beforeAll, afterAll, expect;

// mocks need to be at the top of the imports
import { mockedIPFSClient } from "../../mocks/aragon-sdk-ipfs";

import * as ganacheSetup from "../../helpers/ganache-setup";
import * as deployContracts from "../../helpers/deployContracts";

import {
  AddresslistVotingClient,
  Client,
  Context,
  ContextPlugin,
  DaoCreationSteps,
  ExecuteProposalStep,
  ICanVoteParams,
  ICreateProposalParams,
  IExecuteProposalParams,
  IProposalQueryParams,
  IVoteProposalParams,
  ProposalCreationSteps,
  ProposalMetadata,
  ProposalSortBy,
  ProposalStatus,
  SortDirection,
  VoteProposalStep,
  VoteValues,
  VotingMode,
} from "../../../src";
import { InvalidAddressOrEnsError } from "@aragon/sdk-common";
import {
  contextParams,
  contextParamsLocalChain,
  TEST_ADDRESSLIST_DAO_ADDDRESS,
  TEST_ADDRESSLIST_PLUGIN_ADDRESS,
  TEST_ADDRESSLIST_PROPOSAL_ID,
  TEST_INVALID_ADDRESS,
  TEST_NON_EXISTING_ADDRESS,
  TEST_WALLET_ADDRESS,
} from "../constants";
import { EthereumProvider, Server } from "ganache";
import { AddressZero } from "@ethersproject/constants";

describe("Client Address List", () => {
  let server: Server;
  let deployment: deployContracts.Deployment;

  beforeAll(async () => {
    server = await ganacheSetup.start();
    deployment = await deployContracts.deploy();
    contextParamsLocalChain.daoFactoryAddress = deployment.daoFactory.address;
  });

  afterAll(async () => {
    await server.close();
  });

  // Helpers
  async function buildDAO(votingMode: VotingMode = VotingMode.STANDARD) {
    const client = new Client(
      new Context(contextParams),
    );

    const pluginInstallItem = AddresslistVotingClient.encoding
      .getPluginInstallItem({
        addresses: [TEST_WALLET_ADDRESS],
        votingSettings: {
          minDuration: 60 * 60,
          minParticipation: 0.5,
          supportThreshold: 0.5,
          minProposerVotingPower: BigInt(0),
          votingMode,
        },
      });

    for await (
      const step of client.methods.createDao({
        ensSubdomain: "teting-" + Math.random().toString().slice(2),
        metadataUri: "ipfs://",
        plugins: [
          {
            id: deployment.addresslistVotingRepo.address,
            data: pluginInstallItem.data,
          },
        ],
        daoUri: "https://",
        trustedForwarder: AddressZero,
      })
    ) {
      switch (step.key) {
        case DaoCreationSteps.CREATING:
          break;
        case DaoCreationSteps.DONE:
          return {
            dao: step.address,
            plugin: step.pluginAddresses[0],
          };
      }
    }
    throw new Error("DAO not created");

    // TODO: Original

    // const daoCreation = await deployContracts.createAddresslistDAO(
    //   deployment,
    //   "test-token-dao-" + Math.random(),
    //   votingMode,
    //   [TEST_WALLET_ADDRESS],
    // );
    // return {
    //   dao: daoCreation.daoAddr,
    //   plugin: daoCreation.pluginAddrs[0],
    // };
  }

  async function buildProposal(
    pluginAddress: string,
    client: AddresslistVotingClient,
  ) {
    // generate actions
    const action = client.encoding.updatePluginSettingsAction(pluginAddress, {
      votingMode: VotingMode.VOTE_REPLACEMENT,
      supportThreshold: 0.5,
      minParticipation: 0.5,
      minDuration: 7200,
    });

    const metadata: ProposalMetadata = {
      title: "Best Proposal",
      summary: "this is the sumnary",
      description: "This is a very long description",
      resources: [
        {
          name: "Website",
          url: "https://the.website",
        },
      ],
      media: {
        header: "https://no.media/media.jpeg",
        logo: "https://no.media/media.jpeg",
      },
    };

    const ipfsUri = await client.methods.pinMetadata(
      metadata,
    );
    const endDate = new Date();
    endDate.setHours(endDate.getHours() + 2);

    const proposalParams: ICreateProposalParams = {
      pluginAddress,
      metadataUri: ipfsUri,
      actions: [action],
      executeOnPass: false,
      endDate,
    };

    for await (
      const step of client.methods.createProposal(
        proposalParams,
      )
    ) {
      switch (step.key) {
        case ProposalCreationSteps.CREATING:
          expect(typeof step.txHash).toBe("string");
          expect(step.txHash).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
          break;
        case ProposalCreationSteps.DONE:
          expect(typeof step.proposalId).toBe("number");
          return step.proposalId;
          // TODO fix with new proposalId format
          // expect(step.proposalId).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
          break;
        default:
          throw new Error(
            "Unexpected proposal creation step: " +
              Object.keys(step).join(", "),
          );
      }
    }
    throw new Error();
  }

  describe("Proposal Creation", () => {
    it("Should create a new proposal locally", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new AddresslistVotingClient(ctxPlugin);

      const daoEntries = await Promise.all([
        buildDAO(VotingMode.STANDARD),
        buildDAO(VotingMode.EARLY_EXECUTION),
        buildDAO(VotingMode.VOTE_REPLACEMENT),
      ]);
      await advanceBlocks(server.provider, 10);

      for (const daoEntry of daoEntries) {
        const { plugin: pluginAddress } = daoEntry;
        if (!pluginAddress) {
          throw new Error("No plugin installed");
        }

        const proposalId = await buildProposal(pluginAddress, client);
        expect(typeof proposalId).toBe("number");
      }
    });
  });
  describe("Can vote", () => {
    it("Should check if an user can vote in an Address List proposal", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new AddresslistVotingClient(ctxPlugin);

      const daoEntries = await Promise.all([
        buildDAO(VotingMode.STANDARD),
        buildDAO(VotingMode.EARLY_EXECUTION),
        buildDAO(VotingMode.VOTE_REPLACEMENT),
      ]);
      await advanceBlocks(server.provider, 10);

      for (const daoEntry of daoEntries) {
        const { plugin: pluginAddress } = daoEntry;
        if (!pluginAddress) {
          throw new Error("No plugin installed");
        }

        const proposalId = await buildProposal(pluginAddress, client);
        expect(typeof proposalId).toBe("bigint");

        const params: ICanVoteParams = {
          address: TEST_WALLET_ADDRESS,
          proposalId,
          pluginAddress,
          vote: VoteValues.YES,
        };
        const canVote = await client.methods.canVote(params);
        expect(typeof canVote).toBe("boolean");
        expect(canVote).toBe(true);
      }
    });
  });

  describe("Vote on a proposal", () => {
    it("Should vote on a proposal locally", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new AddresslistVotingClient(ctxPlugin);

      const daoEntries = await Promise.all([
        buildDAO(VotingMode.STANDARD),
        buildDAO(VotingMode.EARLY_EXECUTION),
        buildDAO(VotingMode.VOTE_REPLACEMENT),
      ]);
      await advanceBlocks(server.provider, 10);

      for (const daoEntry of daoEntries) {
        const { plugin: pluginAddress } = daoEntry;
        if (!pluginAddress) {
          throw new Error("No plugin installed");
        }

        const proposalId = await buildProposal(pluginAddress, client);
        expect(typeof proposalId).toBe("bigint");

        const voteParams: IVoteProposalParams = {
          pluginAddress,
          proposalId,
          vote: VoteValues.NO,
        };

        for await (const step of client.methods.voteProposal(voteParams)) {
          switch (step.key) {
            case VoteProposalStep.VOTING:
              expect(typeof step.txHash).toBe("string");
              expect(step.txHash).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
              break;
            case VoteProposalStep.DONE:
              break;
            default:
              throw new Error(
                "Unexpected vote proposal step: " +
                  Object.keys(step).join(", "),
              );
          }
        }
      }
    });
    it("Should replace a vote on a proposal locally", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new AddresslistVotingClient(ctxPlugin);

      const daoEntries = await Promise.all([
        buildDAO(VotingMode.STANDARD),
        buildDAO(VotingMode.EARLY_EXECUTION),
        buildDAO(VotingMode.VOTE_REPLACEMENT),
      ]);

      for (const daoEntry of daoEntries) {
        const { plugin: pluginAddress } = daoEntry;
        if (!pluginAddress) {
          throw new Error("No plugin installed");
        }

        const proposalId = await buildProposal(pluginAddress, client);
        expect(typeof proposalId).toBe("bigint");

        const voteParams: IVoteProposalParams = {
          pluginAddress,
          proposalId,
          vote: VoteValues.YES,
        };

        for await (const step of client.methods.voteProposal(voteParams)) {
          switch (step.key) {
            case VoteProposalStep.VOTING:
              expect(typeof step.txHash).toBe("string");
              expect(step.txHash).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
              break;
            case VoteProposalStep.DONE:
              break;
            default:
              throw new Error(
                "Unexpected vote proposal step: " +
                  Object.keys(step).join(", "),
              );
          }
        }
      }
    });
  });

  describe("Execute proposal", () => {
    it("Should execute a local proposal", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new AddresslistVotingClient(ctxPlugin);

      const daoEntries = await Promise.all([
        buildDAO(VotingMode.STANDARD),
        buildDAO(VotingMode.EARLY_EXECUTION),
        buildDAO(VotingMode.VOTE_REPLACEMENT),
      ]);
      await advanceBlocks(server.provider, 10);

      for (const daoEntry of daoEntries) {
        const { plugin: pluginAddress } = daoEntry;
        if (!pluginAddress) {
          throw new Error("No plugin installed");
        }

        const proposalId = await buildProposal(pluginAddress, client);
        expect(typeof proposalId).toBe("bigint");

        // Vote
        const voteParams: IVoteProposalParams = {
          pluginAddress,
          proposalId,
          vote: VoteValues.YES,
        };
        for await (const step of client.methods.voteProposal(voteParams)) {
          switch (step.key) {
            case VoteProposalStep.VOTING:
              expect(typeof step.txHash).toBe("string");
              expect(step.txHash).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
              break;
            case VoteProposalStep.DONE:
              break;
            default:
              throw new Error(
                "Unexpected vote proposal step: " +
                  Object.keys(step).join(", "),
              );
          }
        }

        // Execute
        const executeParams: IExecuteProposalParams = {
          pluginAddress,
          proposalId,
        };
        for await (
          const step of client.methods.executeProposal(executeParams)
        ) {
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
      }
    });
  });

  describe("Data retrieval", () => {
    it("Should get the list of members that can vote in a proposal", async () => {
      const ctx = new Context(contextParams);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new AddresslistVotingClient(ctxPlugin);

      const wallets = await client.methods.getMembers(
        TEST_ADDRESSLIST_PLUGIN_ADDRESS,
      );

      expect(Array.isArray(wallets)).toBe(true);
      expect(wallets.length).toBeGreaterThan(0);
      expect(typeof wallets[0]).toBe("string");
      expect(wallets[0]).toMatch(/^0x[A-Fa-f0-9]{40}$/i);
    });
    it("Should fetch the given proposal", async () => {
      const ctx = new Context(contextParams);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new AddresslistVotingClient(ctxPlugin);

      const proposalId = TEST_ADDRESSLIST_PROPOSAL_ID;

      mockedIPFSClient.cat.mockResolvedValue(
        Buffer.from(
          JSON.stringify({
            title: "Title",
            summary: "Summary",
            description: "Description",
            resources: [{
              name: "Name",
              url: "URL",
            }],
          }),
        ),
      );

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
        expect(typeof proposal.creationBlockNumber === "number").toBe(true);
        expect(proposal.executionDate instanceof Date).toBe(true);
        expect(typeof proposal.executionBlockNumber === "number").toBe(true);
        expect(Array.isArray(proposal.actions)).toBe(true);
        // actions
        for (let i = 0; i < proposal.actions.length; i++) {
          const action = proposal.actions[i];
          expect(action.data instanceof Uint8Array).toBe(true);
          expect(typeof action.to).toBe("string");
          expect(typeof action.value).toBe("bigint");
        }
        // result
        expect(typeof proposal.result.yes).toBe("number");
        expect(typeof proposal.result.no).toBe("number");
        expect(typeof proposal.result.abstain).toBe("number");
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
        expect(typeof proposal.totalVotingWeight).toBe("number");
        expect(Array.isArray(proposal.votes)).toBe(true);
        for (let i = 0; i < proposal.votes.length; i++) {
          const vote = proposal.votes[i];
          expect(typeof vote.address).toBe("string");
          expect(vote.address).toMatch(/^0x[A-Fa-f0-9]{40}$/i);
          expect(typeof vote.vote).toBe("number");
        }
        if (proposal.executionTxHash) {
          expect(proposal.executionTxHash).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
        }
      }
    });
    it("Should fetch the given proposal and fail because the proposal does not exist", async () => {
      const ctx = new Context(contextParams);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new AddresslistVotingClient(ctxPlugin);

      const proposalId = TEST_NON_EXISTING_ADDRESS + "_0x0";
      const proposal = await client.methods.getProposal(proposalId);

      expect(proposal === null).toBe(true);
    });
    it("Should get a list of proposals filtered by the given criteria", async () => {
      const ctx = new Context(contextParams);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new AddresslistVotingClient(ctxPlugin);
      const limit = 5;
      const status = ProposalStatus.DEFEATED;
      const params: IProposalQueryParams = {
        limit,
        sortBy: ProposalSortBy.CREATED_AT,
        direction: SortDirection.ASC,
        status,
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
        expect(proposal.status).toBe(status);
        // result
        expect(typeof proposal.result.yes).toBe("number");
        expect(typeof proposal.result.no).toBe("number");
        expect(typeof proposal.result.abstain).toBe("number");
      }
    });
    it("Should get a list of proposals from a specific dao", async () => {
      const ctx = new Context(contextParams);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new AddresslistVotingClient(ctxPlugin);
      const limit = 5;
      const address = TEST_ADDRESSLIST_DAO_ADDDRESS;
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
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new AddresslistVotingClient(ctxPlugin);
      const limit = 5;
      const address = TEST_NON_EXISTING_ADDRESS;
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
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new AddresslistVotingClient(ctxPlugin);
      const limit = 5;
      const address = TEST_INVALID_ADDRESS;
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
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new AddresslistVotingClient(ctxPlugin);

      const pluginAddress: string = TEST_ADDRESSLIST_PLUGIN_ADDRESS;
      const settings = await client.methods.getVotingSettings(pluginAddress);

      expect(settings === null).toBe(false);
      if (settings) {
        expect(typeof settings.minDuration).toBe("number");
        expect(typeof settings.minParticipation).toBe("number");
        expect(typeof settings.supportThreshold).toBe("number");
        expect(typeof settings.minProposerVotingPower).toBe("bigint");
        expect(settings.supportThreshold).toBeLessThanOrEqual(1);
        expect(settings.minParticipation).toBeLessThanOrEqual(1);
      }
    });
  });
});

async function advanceBlocks(
  provider: EthereumProvider,
  amountOfBlocks: number,
) {
  for (let i = 0; i < amountOfBlocks; i++) {
    await provider.send("evm_mine", []);
  }
}
