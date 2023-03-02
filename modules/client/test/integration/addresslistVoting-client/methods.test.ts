// mocks need to be at the top of the imports
import { mockedIPFSClient } from "../../mocks/aragon-sdk-ipfs";
import * as mockedGraphqlRequest from "../../mocks/graphql-request";

import * as ganacheSetup from "../../helpers/ganache-setup";
import * as deployContracts from "../../helpers/deployContracts";

import {
  AddresslistVotingClient,
  CanVoteParams,
  Context,
  ContextPlugin,
  CreateMajorityVotingProposalParams,
  ExecuteProposalStep,
  IProposalQueryParams,
  IVoteProposalParams,
  ProposalCreationSteps,
  ProposalMetadata,
  ProposalSortBy,
  ProposalStatus,
  SortDirection,
  SubgraphAction,
  SubgraphVoteValues,
  VoteProposalStep,
  VoteValues,
  VotingMode,
} from "../../../src";
import { InvalidAddressOrEnsError } from "@aragon/sdk-common";
import {
  ADDRESS_ONE,
  ADDRESS_TWO,
  contextParamsLocalChain,
  contextParamsMainnet,
  IPFS_CID,
  TEST_ADDRESSLIST_DAO_ADDDRESS,
  TEST_ADDRESSLIST_PLUGIN_ADDRESS,
  TEST_ADDRESSLIST_PROPOSAL_ID,
  TEST_INVALID_ADDRESS,
  TEST_NON_EXISTING_ADDRESS,
  TEST_TX_HASH,
  TEST_WALLET_ADDRESS,
} from "../constants";
import { Server } from "ganache";
import {
  mineBlock,
  mineBlockWithTimeOffset,
  restoreBlockTime,
} from "../../helpers/block-times";
import { buildAddressListVotingDAO } from "../../helpers/build-daos";
import { JsonRpcProvider } from "@ethersproject/providers";
import { QueryAddresslistVotingMembers } from "../../../src/addresslistVoting/internal/graphql-queries";
import {
  AddresslistVotingProposal,
  SubgraphAddresslistVotingProposal,
  SubgraphAddresslistVotingVoterListItem,
} from "../../../src/addresslistVoting/interfaces";

describe("Client Address List", () => {
  let server: Server;
  let deployment: deployContracts.Deployment;
  let repoAddr: string;
  let provider: JsonRpcProvider;

  beforeAll(async () => {
    server = await ganacheSetup.start();
    deployment = await deployContracts.deploy();
    contextParamsLocalChain.daoFactoryAddress = deployment.daoFactory.address;
    repoAddr = deployment.addresslistVotingRepo.address;

    if (Array.isArray(contextParamsLocalChain.web3Providers)) {
      provider = new JsonRpcProvider(
        contextParamsLocalChain.web3Providers[0] as string,
      );
    } else {
      provider = new JsonRpcProvider(
        contextParamsLocalChain.web3Providers as any,
      );
    }
  });

  afterAll(async () => {
    await server.close();
  });

  beforeEach(() => {
    return restoreBlockTime(provider);
  });

  // Helpers
  async function buildDaos() {
    const daoEntries: Array<{ dao: string; plugin: string }> = [];
    daoEntries.push(
      await buildAddressListVotingDAO(repoAddr, VotingMode.STANDARD),
    );
    daoEntries.push(
      await buildAddressListVotingDAO(repoAddr, VotingMode.EARLY_EXECUTION),
    );
    daoEntries.push(
      await buildAddressListVotingDAO(repoAddr, VotingMode.VOTE_REPLACEMENT),
    );
    return daoEntries;
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
    const endDate = new Date(Date.now() + 60 * 60 * 1000 + 10 * 1000);

    const proposalParams: CreateMajorityVotingProposalParams = {
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
          expect(typeof step.proposalId).toBe("string");
          expect(step.proposalId).toMatch(
            /^0x[A-Fa-f0-9]{40}_0x[A-Fa-f0-9]{1,64}$/i,
          );
          return step.proposalId;
        default:
          throw new Error(
            "Unexpected proposal creation step: " +
              Object.keys(step).join(", "),
          );
      }
    }
    throw new Error();
  }

  async function voteProposal(
    proposalId: string,
    client: AddresslistVotingClient,
    voteValue: VoteValues = VoteValues.YES,
  ) {
    const voteParams: IVoteProposalParams = {
      proposalId,
      vote: voteValue,
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

  describe("Proposal Creation", () => {
    it("Should create a new proposal locally", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new AddresslistVotingClient(ctxPlugin);

      const daoEntries = await buildDaos();

      for (const daoEntry of daoEntries) {
        const { plugin: pluginAddress } = daoEntry;
        if (!pluginAddress) {
          throw new Error("No plugin installed");
        }

        const proposalId = await buildProposal(pluginAddress, client);
        expect(typeof proposalId).toBe("string");
        expect(proposalId).toMatch(/^0x[A-Fa-f0-9]{40}_0x[A-Fa-f0-9]{1,64}$/);
      }
    });
  });
  describe("Can vote", () => {
    it("Should check if an user can vote in an Address List proposal", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new AddresslistVotingClient(ctxPlugin);

      const daoEntries = await buildDaos();

      for (const daoEntry of daoEntries) {
        const { plugin: pluginAddress } = daoEntry;
        if (!pluginAddress) {
          throw new Error("No plugin installed");
        }

        const proposalId = await buildProposal(pluginAddress, client);
        expect(typeof proposalId).toBe("string");
        expect(proposalId).toMatch(/^0x[A-Fa-f0-9]{40}_0x[A-Fa-f0-9]{1,64}$/);

        const params: CanVoteParams = {
          voterAddressOrEns: TEST_WALLET_ADDRESS,
          proposalId,
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

      const daoEntries = await buildDaos();

      for (const daoEntry of daoEntries) {
        const { plugin: pluginAddress } = daoEntry;
        if (!pluginAddress) {
          throw new Error("No plugin installed");
        }

        const proposalId = await buildProposal(pluginAddress, client);
        expect(typeof proposalId).toBe("string");
        expect(proposalId).toMatch(/^0x[A-Fa-f0-9]{40}_0x[A-Fa-f0-9]{1,64}$/);

        // Vote
        await voteProposal(proposalId, client);
      }
    });
    it("Should replace a vote on a proposal locally", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new AddresslistVotingClient(ctxPlugin);

      const { plugin: pluginAddress } = await buildAddressListVotingDAO(
        repoAddr,
        VotingMode.VOTE_REPLACEMENT,
      );
      if (!pluginAddress) {
        throw new Error("No plugin installed");
      }

      const proposalId = await buildProposal(pluginAddress, client);
      expect(typeof proposalId).toBe("string");
      expect(proposalId).toMatch(/^0x[A-Fa-f0-9]{40}_0x[A-Fa-f0-9]{1,64}$/);

      // Vote YES
      await voteProposal(proposalId, client, VoteValues.YES);

      await mineBlock(provider);
      await voteProposal(proposalId, client, VoteValues.NO);
    });
  });

  describe("Can execute", () => {
    it("Should check if an user can execute a standard voting proposal", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new AddresslistVotingClient(ctxPlugin);

      const { plugin: pluginAddress } = await buildAddressListVotingDAO(
        repoAddr,
        VotingMode.STANDARD,
      );
      if (!pluginAddress) {
        throw new Error("No plugin installed");
      }

      const proposalId = await buildProposal(pluginAddress, client);
      expect(typeof proposalId).toBe("string");
      expect(proposalId).toMatch(/^0x[A-Fa-f0-9]{40}_0x[A-Fa-f0-9]{1,64}$/);

      let canExecute = await client.methods.canExecute(proposalId);
      expect(typeof canExecute).toBe("boolean");
      expect(canExecute).toBe(false);

      // now approve
      await voteProposal(proposalId, client);
      // Force date past end
      await mineBlockWithTimeOffset(provider, 2 * 60 * 60);

      canExecute = await client.methods.canExecute(proposalId);
      expect(typeof canExecute).toBe("boolean");
      expect(canExecute).toBe(true);
    });

    it("Should check if an user can execute an early execution proposal", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new AddresslistVotingClient(ctxPlugin);

      const { plugin: pluginAddress } = await buildAddressListVotingDAO(
        repoAddr,
        VotingMode.EARLY_EXECUTION,
      );
      if (!pluginAddress) {
        throw new Error("No plugin installed");
      }

      const proposalId = await buildProposal(pluginAddress, client);
      expect(typeof proposalId).toBe("string");
      expect(proposalId).toMatch(/^0x[A-Fa-f0-9]{40}_0x[A-Fa-f0-9]{1,64}$/);

      let canExecute = await client.methods.canExecute(proposalId);
      expect(typeof canExecute).toBe("boolean");
      expect(canExecute).toBe(false);

      // now approve
      await voteProposal(proposalId, client);
      // No waiting

      canExecute = await client.methods.canExecute(proposalId);
      expect(typeof canExecute).toBe("boolean");
      expect(canExecute).toBe(true);
    });

    it("Should check if an user can execute a vote replacement proposal", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new AddresslistVotingClient(ctxPlugin);

      const { plugin: pluginAddress } = await buildAddressListVotingDAO(
        repoAddr,
        VotingMode.VOTE_REPLACEMENT,
      );
      if (!pluginAddress) {
        throw new Error("No plugin installed");
      }

      const proposalId = await buildProposal(pluginAddress, client);
      expect(typeof proposalId).toBe("string");
      expect(proposalId).toMatch(/^0x[A-Fa-f0-9]{40}_0x[A-Fa-f0-9]{1,64}$/);

      let canExecute = await client.methods.canExecute(proposalId);
      expect(typeof canExecute).toBe("boolean");
      expect(canExecute).toBe(false);

      // vote no
      await voteProposal(proposalId, client, VoteValues.NO);

      canExecute = await client.methods.canExecute(proposalId);
      expect(typeof canExecute).toBe("boolean");
      expect(canExecute).toBe(false);

      // now approve
      await voteProposal(proposalId, client, VoteValues.YES);

      // Force date past end
      await mineBlockWithTimeOffset(provider, 2 * 60 * 60);

      canExecute = await client.methods.canExecute(proposalId);
      expect(typeof canExecute).toBe("boolean");
      expect(canExecute).toBe(true);
    });
  });

  describe("Execute proposal", () => {
    it("Should execute a standard voting proposal", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new AddresslistVotingClient(ctxPlugin);

      const { plugin: pluginAddress } = await buildAddressListVotingDAO(
        repoAddr,
        VotingMode.STANDARD,
      );
      if (!pluginAddress) {
        throw new Error("No plugin installed");
      }

      const proposalId = await buildProposal(pluginAddress, client);
      expect(typeof proposalId).toBe("string");
      expect(proposalId).toMatch(/^0x[A-Fa-f0-9]{40}_0x[A-Fa-f0-9]{1,64}$/);

      // Vote
      await voteProposal(proposalId, client);
      // Force date past end
      await mineBlockWithTimeOffset(provider, 2 * 60 * 60);

      // Execute
      for await (
        const step of client.methods.executeProposal(proposalId)
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
    });

    it("Should execute an early execution proposal", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new AddresslistVotingClient(ctxPlugin);

      const { plugin: pluginAddress } = await buildAddressListVotingDAO(
        repoAddr,
        VotingMode.EARLY_EXECUTION,
      );
      if (!pluginAddress) {
        throw new Error("No plugin installed");
      }

      const proposalId = await buildProposal(pluginAddress, client);
      expect(typeof proposalId).toBe("string");
      expect(proposalId).toMatch(/^0x[A-Fa-f0-9]{40}_0x[A-Fa-f0-9]{1,64}$/);

      // Vote
      await voteProposal(proposalId, client);
      // No waiting here

      // Execute
      for await (
        const step of client.methods.executeProposal(proposalId)
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
    });

    it("Should execute a vote replacement proposal", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new AddresslistVotingClient(ctxPlugin);

      const { plugin: pluginAddress } = await buildAddressListVotingDAO(
        repoAddr,
        VotingMode.VOTE_REPLACEMENT,
      );
      if (!pluginAddress) {
        throw new Error("No plugin installed");
      }

      const proposalId = await buildProposal(pluginAddress, client);
      expect(typeof proposalId).toBe("string");
      expect(proposalId).toMatch(/^0x[A-Fa-f0-9]{40}_0x[A-Fa-f0-9]{1,64}$/);

      // Vote
      await voteProposal(proposalId, client, VoteValues.NO);
      await voteProposal(proposalId, client, VoteValues.YES);
      // Force date past end
      await mineBlockWithTimeOffset(provider, 2 * 60 * 60);

      // Execute
      for await (
        const step of client.methods.executeProposal(proposalId)
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
    });
  });

  describe("Data retrieval", () => {
    it("Should get the list of members that can vote in a proposal", async () => {
      const ctx = new Context(contextParamsMainnet);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new AddresslistVotingClient(ctxPlugin);

      const mockedClient = mockedGraphqlRequest.getMockedInstance(
        client.graphql.getClient(),
      );
      mockedGraphqlRequest.mockUpCheck(mockedClient);
      mockedClient.request.mockResolvedValueOnce({
        addresslistVotingPlugin: {
          members: [{
            address: ADDRESS_ONE,
          }],
        },
      });

      const wallets = await client.methods.getMembers(
        TEST_ADDRESSLIST_PLUGIN_ADDRESS,
      );

      expect(wallets.length).toBe(1);
      expect(wallets[0]).toBe(ADDRESS_ONE);
      expect(mockedClient.request).toHaveBeenLastCalledWith(
        QueryAddresslistVotingMembers,
        { address: TEST_ADDRESSLIST_PLUGIN_ADDRESS },
      );
    });
    it.only("Should fetch the given proposal", async () => {
      const ctx = new Context(contextParamsMainnet);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new AddresslistVotingClient(ctxPlugin);

      const proposalId = TEST_ADDRESSLIST_PROPOSAL_ID;

      const ipfsMetadata = {
        title: "Title",
        summary: "Summary",
        description: "Description",
        resources: [{
          name: "Name",
          url: "URL",
        }],
        media: [{ header: "Header", logo: "Logo" }],
      };
      mockedIPFSClient.cat.mockResolvedValue(
        Buffer.from(
          JSON.stringify(ipfsMetadata),
        ),
      );
      const mockedClient = mockedGraphqlRequest.getMockedInstance(
        client.graphql.getClient(),
      );
      const actions: SubgraphAction[] = [{
        to: ADDRESS_ONE,
        value: "0",
        data: "0x",
      }, {
        to: ADDRESS_TWO,
        value: "10",
        data: "0x7E47",
      }];
      const voters: SubgraphAddresslistVotingVoterListItem[] = [
        {
          voteOption: SubgraphVoteValues.YES,
          voter: {
            address: ADDRESS_ONE,
          },
          voteReplaced: false,
        },
        {
          voteOption: SubgraphVoteValues.NO,
          voter: {
            address: ADDRESS_TWO,
          },
          voteReplaced: true,
        },
      ];
      const subgraphProposal: SubgraphAddresslistVotingProposal = {
        createdAt: Math.round(Date.now() / 1000).toString(),
        actions,
        supportThreshold: "1000000",
        minVotingPower: "20",
        voters,
        totalVotingPower: "3000000",
        votingMode: VotingMode.EARLY_EXECUTION,
        creationBlockNumber: "40",
        executionDate: Math.round(Date.now() / 1000).toString(),
        executionBlockNumber: "50",
        executionTxHash: TEST_TX_HASH,
        id: TEST_ADDRESSLIST_PROPOSAL_ID,
        dao: {
          id: TEST_ADDRESSLIST_DAO_ADDDRESS,
          subdomain: "test",
        },
        creator: TEST_WALLET_ADDRESS,
        abstain: "0",
        no: "1",
        yes: "1",
        executed: false,
        startDate: Math.round(Date.now() / 1000).toString(),
        endDate: Math.round(Date.now() / 1000).toString(),
        executable: false,
        metadata: `ipfs://${IPFS_CID}`,
      };

      mockedGraphqlRequest.mockUpCheck(mockedClient);
      mockedClient.request.mockResolvedValueOnce({
        addresslistVotingProposal: subgraphProposal,
      });

      // typecast to override null
      const proposal = await client.methods.getProposal(
        proposalId,
      ) as AddresslistVotingProposal;

      expect(proposal).not.toBe(null);

      expect(proposal.id).toBe(subgraphProposal.id);
      expect(proposal.dao.address).toBe(subgraphProposal.dao.id);
      expect(proposal.dao.name).toBe(subgraphProposal.dao.subdomain);
      expect(proposal.creatorAddress).toBe(subgraphProposal.creator);
      // check metadata
      expect(proposal.metadata.title).toBe(ipfsMetadata.title);
      expect(proposal.metadata.summary).toBe(ipfsMetadata.summary);
      expect(proposal.metadata.description).toBe(ipfsMetadata.description);
      expect(proposal.metadata.resources).toMatchObject(ipfsMetadata.resources);
      expect(proposal.metadata.media).toMatchObject(ipfsMetadata.media);

      expect(proposal.startDate instanceof Date).toBe(true);
      expect(proposal.startDate.getTime()).toBe(
        parseInt(subgraphProposal.startDate) * 1000,
      );
      expect(proposal.endDate instanceof Date).toBe(true);
      expect(proposal.endDate.getTime()).toBe(
        parseInt(subgraphProposal.endDate) * 1000,
      );
      expect(proposal.creationDate instanceof Date).toBe(true);
      expect(proposal.creationDate.getTime()).toBe(
        parseInt(subgraphProposal.createdAt) * 1000,
      );
      expect(proposal.actions).toMatchObject(proposal.actions);
      // result
      expect(proposal.result.yes).toBe(parseInt(subgraphProposal.yes));
      expect(proposal.result.no).toBe(parseInt(subgraphProposal.no));
      expect(proposal.result.abstain).toBe(parseInt(subgraphProposal.abstain));
      // setttings
      expect(typeof proposal.settings.duration).toBe("number");
      expect(typeof proposal.settings.supportThreshold).toBe("number");
      expect(typeof proposal.settings.minParticipation).toBe("number");
      expect(proposal.settings.duration).toBe(
        parseInt(subgraphProposal.endDate) -
          parseInt(subgraphProposal.startDate),
      );
      expect(proposal.settings.supportThreshold).toBe(1);
      expect(proposal.settings.minParticipation).toBe(0.000006);
      // token
      expect(proposal.totalVotingWeight).toBe(
        parseInt(subgraphProposal.totalVotingPower),
      );
      expect(proposal.votes[0]).toMatchObject({
        vote: 2,
        voteReplaced: subgraphProposal.voters[0].voteReplaced,
        address: subgraphProposal.voters[0].voter.address
      });
      expect(proposal.votes[1]).toMatchObject({
        vote: 3,
        voteReplaced: subgraphProposal.voters[1].voteReplaced,
        address: subgraphProposal.voters[1].voter.address
      });
      expect(proposal.executionTxHash).toMatch(
        subgraphProposal.executionTxHash,
      );
      expect(proposal.executionDate?.getTime()).toBe(
        parseInt(subgraphProposal.executionDate) * 1000,
      );
      expect(proposal.executionBlockNumber).toBe(
        parseInt(subgraphProposal.executionBlockNumber),
      );
    });
    it("Should fetch the given proposal and fail because the proposal does not exist", async () => {
      const ctx = new Context(contextParamsMainnet);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new AddresslistVotingClient(ctxPlugin);

      const proposalId = TEST_NON_EXISTING_ADDRESS + "_0x0";
      const proposal = await client.methods.getProposal(proposalId);

      expect(proposal === null).toBe(true);
    });
    it("Should get a list of proposals filtered by the given criteria", async () => {
      const ctx = new Context(contextParamsMainnet);
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
      const ctx = new Context(contextParamsMainnet);
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
      const ctx = new Context(contextParamsMainnet);
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
      const ctx = new Context(contextParamsMainnet);
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
      const ctx = new Context(contextParamsMainnet);
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
