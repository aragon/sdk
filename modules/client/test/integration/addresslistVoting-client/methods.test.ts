// mocks need to be at the top of the imports
import { mockedIPFSClient } from "../../mocks/aragon-sdk-ipfs";
import * as mockedGraphqlRequest from "../../mocks/graphql-request";

// @ts-ignore Needed to get the global typing for hardhat
import * as jestenv from "jest-environment-hardhat";

import * as deployContracts from "../../helpers/deployContracts";

import {
  AddresslistVotingClient,
  AddresslistVotingPluginPrepareInstallationParams,
  AddresslistVotingProposal,
  CanVoteParams,
  CreateMajorityVotingProposalParams,
  ExecuteProposalStep,
  ProposalCreationSteps,
  ProposalQueryParams,
  ProposalSortBy,
  VoteProposalParams,
  VoteProposalStep,
  VoteValues,
  VotingMode,
} from "../../../src";
import {
  ADDRESS_ONE,
  ADDRESS_TWO,
  contextParamsLocalChain,
  SUBGRAPH_PLUGIN_INSTALLATION,
  SUBGRAPH_PROPOSAL_BASE,
  SUBGRAPH_VOTERS,
  TEST_ADDRESSLIST_PROPOSAL_ID,
  TEST_INVALID_ADDRESS,
  TEST_NON_EXISTING_ADDRESS,
  TEST_TX_HASH,
  TEST_WALLET_ADDRESS,
} from "../constants";
import { mineBlock, mineBlockWithTimeOffset } from "../../helpers/block-times";
import { buildAddressListVotingDAO } from "../../helpers/build-daos";
import { JsonRpcProvider } from "@ethersproject/providers";
import {
  QueryAddresslistVotingIsMember,
  QueryAddresslistVotingMembers,
  QueryAddresslistVotingProposal,
  QueryAddresslistVotingProposals,
  QueryAddresslistVotingSettings,
} from "../../../src/addresslistVoting/internal/graphql-queries";
import {
  SubgraphAddresslistVotingProposal,
  SubgraphAddresslistVotingProposalListItem,
} from "../../../src/addresslistVoting/internal/types";
import {
  bytesToHex,
  Context,
  getExtendedProposalId,
  InvalidAddressOrEnsError,
  PrepareInstallationStep,
  PrepareUpdateStep,
  ProposalMetadata,
  ProposalStatus,
  SortDirection,
} from "@aragon/sdk-client-common";
import { PluginRepo__factory } from "@aragon/osx-ethers";
import { createAddresslistVotingPluginBuild } from "../../helpers/create-plugin-build";
import {
  contracts,
  NetworkDeployment,
  SupportedVersions,
} from "@aragon/osx-commons-configs";

describe("Client Address List", () => {
  let deployment: deployContracts.Deployment;
  let repoAddr: string;
  let provider: JsonRpcProvider;

  beforeAll(async () => {
    deployment = await deployContracts.deploy();
    contextParamsLocalChain.DAOFactory = deployment.daoFactory.address;
    contextParamsLocalChain.PluginSetupProcessor =
      deployment.pluginSetupProcessor.address;
    contextParamsLocalChain.MultisigRepoProxy = deployment.multisigRepo.address;
    contextParamsLocalChain.AdminRepoProxy = "";
    contextParamsLocalChain.AddresslistVotingRepoProxy =
      deployment.addresslistVotingRepo.address;
    contextParamsLocalChain.TokenVotingRepoProxy =
      deployment.tokenVotingRepo.address;
    contextParamsLocalChain.MultisigSetup =
      deployment.multisigPluginSetup.address;
    contextParamsLocalChain.AdminSetup = "";
    contextParamsLocalChain.AddresslistVotingSetup =
      deployment.addresslistVotingPluginSetup.address;
    contextParamsLocalChain.TokenVotingSetup =
      deployment.tokenVotingPluginSetup.address;
    contextParamsLocalChain.ENSRegistry = deployment.ensRegistry.address;
    repoAddr = deployment.addresslistVotingRepo.address;

    contracts.local = {
      [SupportedVersions.V1_3_0]: {
        AddresslistVotingRepoProxy: {
          address: deployment.addresslistVotingRepo.address,
        },
      } as NetworkDeployment,
    };
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
    const endDate = new Date(0);

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
    const voteParams: VoteProposalParams = {
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
      const client = new AddresslistVotingClient(ctx);

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
      const client = new AddresslistVotingClient(ctx);

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
      const client = new AddresslistVotingClient(ctx);

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
      const client = new AddresslistVotingClient(ctx);

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

  describe("Plugin installation", () => {
    it("Should prepare the installation of a token voting plugin", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const client = new AddresslistVotingClient(ctx);
      const { dao } = await buildAddressListVotingDAO(
        repoAddr,
        VotingMode.VOTE_REPLACEMENT,
      );
      const installationParams:
        AddresslistVotingPluginPrepareInstallationParams = {
          settings: {
            votingSettings: {
              supportThreshold: 0.5,
              minParticipation: 0.5,
              minDuration: 7200,
              minProposerVotingPower: BigInt(1),
              votingMode: VotingMode.STANDARD,
            },
            addresses: [TEST_WALLET_ADDRESS],
          },
          daoAddressOrEns: dao,
        };
      const steps = client.methods.prepareInstallation(installationParams);
      for await (const step of steps) {
        switch (step.key) {
          case PrepareInstallationStep.PREPARING:
            expect(typeof step.txHash).toBe("string");
            expect(step.txHash).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
            break;
          case PrepareInstallationStep.DONE:
            expect(typeof step.pluginAddress).toBe("string");
            expect(step.pluginAddress).toMatch(/^0x[A-Fa-f0-9]{40}$/i);
            expect(typeof step.pluginRepo).toBe("string");
            expect(step.pluginRepo).toMatch(/^0x[A-Fa-f0-9]{40}$/i);
            expect(Array.isArray(step.helpers)).toBe(true);
            for (const helper of step.helpers) {
              expect(typeof helper).toBe("string");
            }
            expect(Array.isArray(step.permissions)).toBe(true);
            for (const permission of step.permissions) {
              expect(typeof permission.condition).toBe("string");
              if (permission.condition) {
                expect(permission.condition).toMatch(/^0x[A-Fa-f0-9]{40}$/i);
              }
              expect(typeof permission.operation).toBe("number");
              expect(typeof permission.where).toBe("string");
              expect(permission.where).toMatch(/^0x[A-Fa-f0-9]{40}$/i);
              expect(typeof permission.who).toBe("string");
              expect(permission.who).toMatch(/^0x[A-Fa-f0-9]{40}$/i);
            }
            expect(typeof step.versionTag.build).toBe("number");
            expect(typeof step.versionTag.release).toBe("number");
            break;
        }
      }
    });
  });

  describe("Plugin update", () => {
    it("Should update prepare a plugin update for a tokenVotingPlugin", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const client = new AddresslistVotingClient(ctx);

      const { dao, plugin } = await buildAddressListVotingDAO(
        repoAddr,
      );
      const release = 1;
      await createAddresslistVotingPluginBuild(
        release,
        deployment.addresslistVotingRepo.address,
      );

      const pluginSetupInstance = PluginRepo__factory.connect(
        deployment.addresslistVotingRepo.address,
        client.web3.getConnectedSigner(),
      );
      const version = await pluginSetupInstance["getLatestVersion(uint8)"](
        release,
      );

      expect(version.tag.release).toBe(release);
      expect(version.tag.build).toBe(2);

      const mockedClient = mockedGraphqlRequest.getMockedInstance(
        client.graphql.getClient(),
      );
      const installation = SUBGRAPH_PLUGIN_INSTALLATION;
      installation.appliedPreparation.pluginRepo.id =
        deployment.addresslistVotingRepo.address;
      installation.appliedPreparation.helpers = [];
      mockedClient.request.mockResolvedValueOnce({
        iplugin: { installations: [installation] },
      });
      const steps = client.methods.prepareUpdate(
        {
          daoAddressOrEns: dao,
          pluginAddress: plugin,
          newVersion: {
            release: 1,
            build: 2,
          },
        },
      );
      for await (const step of steps) {
        switch (step.key) {
          case PrepareUpdateStep.PREPARING:
            expect(typeof step.txHash).toBe("string");
            expect(step.txHash).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
            break;
          case PrepareUpdateStep.DONE:
            expect(typeof step.pluginAddress).toBe("string");
            expect(step.pluginAddress).toBe(plugin);
            expect(step.initData instanceof Uint8Array).toBe(true);
            expect(step.pluginAddress).toMatch(/^0x[A-Fa-f0-9]{40}$/i);
            expect(typeof step.pluginRepo).toBe("string");
            expect(step.pluginRepo).toBe(
              deployment.addresslistVotingRepo.address,
            );
            expect(step.pluginRepo).toMatch(/^0x[A-Fa-f0-9]{40}$/i);
            expect(typeof step.versionTag.build).toBe("number");
            expect(step.versionTag.build).toBe(2);
            expect(typeof step.versionTag.release).toBe("number");
            expect(step.versionTag.release).toBe(1);
            for (const permission of step.permissions) {
              if (permission.condition) {
                expect(typeof permission.condition).toBe("string");
                expect(permission.condition).toMatch(
                  /^0x[A-Fa-f0-9]{40}$/i,
                );
              }
              expect(typeof permission.operation).toBe("number");
              expect(typeof permission.where).toBe("string");
              expect(permission.where).toMatch(/^0x[A-Fa-f0-9]{40}$/i);
              expect(typeof permission.who).toBe("string");
              expect(permission.who).toMatch(/^0x[A-Fa-f0-9]{40}$/i);
            }
            break;
          default:
            throw new Error(
              "Unexpected DAO prepare update step: " +
                JSON.stringify(step, null, 2),
            );
        }
      }
    });
  });

  describe("Can execute", () => {
    it("Should check if an user can execute a standard voting proposal", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const client = new AddresslistVotingClient(ctx);

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
      const client = new AddresslistVotingClient(ctx);

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
      const client = new AddresslistVotingClient(ctx);

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
      const client = new AddresslistVotingClient(ctx);

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
      const client = new AddresslistVotingClient(ctx);

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
      const client = new AddresslistVotingClient(ctx);

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

  describe("isMember", () => {
    it("Should check if an address is a member of a DAO and return true", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const client = new AddresslistVotingClient(ctx);

      const mockedClient = mockedGraphqlRequest.getMockedInstance(
        client.graphql.getClient(),
      );
      mockedClient.request.mockResolvedValueOnce({
        addresslistVotingVoter: {
          id: `${ADDRESS_ONE}_${ADDRESS_TWO}`,
        },
      });
      const isMember = await client.methods.isMember({
        pluginAddress: ADDRESS_ONE,
        address: ADDRESS_TWO,
      });
      expect(isMember).toBe(true);
      expect(mockedClient.request).toHaveBeenLastCalledWith(
        QueryAddresslistVotingIsMember,
        {
          id: `${ADDRESS_ONE}_${ADDRESS_TWO}`,
          blockHeight: null,
        },
      );
    });
    it("Should check if an address is a member in a specified block number of a DAO and return true", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const client = new AddresslistVotingClient(ctx);

      const mockedClient = mockedGraphqlRequest.getMockedInstance(
        client.graphql.getClient(),
      );
      mockedClient.request.mockResolvedValueOnce({
        addresslistVotingVoter: {
          id: `${ADDRESS_ONE}_${ADDRESS_TWO}`,
        },
      });
      const blockNumber = 123456;
      const isMember = await client.methods.isMember({
        pluginAddress: ADDRESS_ONE,
        address: ADDRESS_TWO,
        blockNumber,
      });
      expect(isMember).toBe(true);
      expect(mockedClient.request).toHaveBeenLastCalledWith(
        QueryAddresslistVotingIsMember,
        {
          id: `${ADDRESS_ONE}_${ADDRESS_TWO}`,
          blockHeight: {
            number: blockNumber,
          },
        },
      );
    });
    it("Should check if an address is a member of a DAO and return false", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const client = new AddresslistVotingClient(ctx);

      const mockedClient = mockedGraphqlRequest.getMockedInstance(
        client.graphql.getClient(),
      );
      mockedClient.request.mockResolvedValueOnce({
        addresslistVotingVoter: null,
      });
      const isMember = await client.methods.isMember({
        pluginAddress: ADDRESS_ONE,
        address: ADDRESS_TWO,
      });
      expect(isMember).toBe(false);
      expect(mockedClient.request).toHaveBeenLastCalledWith(
        QueryAddresslistVotingIsMember,
        {
          id: `${ADDRESS_ONE}_${ADDRESS_TWO}`,
          blockHeight: null,
        },
      );
    });
  });

  describe("Data retrieval", () => {
    it("Should get the list of members that can vote in a proposal", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const client = new AddresslistVotingClient(ctx);

      const mockedClient = mockedGraphqlRequest.getMockedInstance(
        client.graphql.getClient(),
      );
      mockedClient.request.mockResolvedValueOnce({
        addresslistVotingVoters: [
          {
            address: ADDRESS_ONE,
          },
        ],
      });

      const wallets = await client.methods.getMembers(
        {
          pluginAddress: ADDRESS_ONE,
          blockNumber: 123456,
        },
      );

      expect(wallets.length).toBe(1);
      expect(wallets[0]).toBe(ADDRESS_ONE);
      expect(mockedClient.request).toHaveBeenLastCalledWith(
        QueryAddresslistVotingMembers,
        {
          where: { plugin: ADDRESS_ONE },
          block: {
            number: 123456,
          },
          direction: "asc",
          limit: 10,
          skip: 0,
          sortBy: "address",
        },
      );
    });
    it("Should fetch the given proposal", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const client = new AddresslistVotingClient(ctx);

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

      const subgraphProposal: SubgraphAddresslistVotingProposal = {
        createdAt: Math.round(Date.now() / 1000).toString(),
        supportThreshold: "1000000",
        minVotingPower: "20",
        voters: SUBGRAPH_VOTERS,
        totalVotingPower: "3000000",
        votingMode: VotingMode.EARLY_EXECUTION,
        creationBlockNumber: "40",
        executionDate: Math.round(Date.now() / 1000).toString(),
        executionBlockNumber: "50",
        executionTxHash: TEST_TX_HASH,
        earlyExecutable: false,
        ...SUBGRAPH_PROPOSAL_BASE,
      };

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

      expect(proposal.status).toBe("Defeated");
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
        address: subgraphProposal.voters[0].voter.address,
      });
      expect(proposal.votes[1]).toMatchObject({
        vote: 3,
        voteReplaced: subgraphProposal.voters[1].voteReplaced,
        address: subgraphProposal.voters[1].voter.address,
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

      // check function call
      expect(mockedClient.request).lastCalledWith(
        QueryAddresslistVotingProposal,
        {
          proposalId: getExtendedProposalId(proposalId),
        },
      );
    });
    it("Should fetch the given proposal and fail because the proposal does not exist", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const client = new AddresslistVotingClient(ctx);

      const mockedClient = mockedGraphqlRequest.getMockedInstance(
        client.graphql.getClient(),
      );

      mockedClient.request.mockResolvedValueOnce({
        addresslistVotingProposal: null,
      });

      const proposalId = TEST_NON_EXISTING_ADDRESS + "_0x0";
      const proposal = await client.methods.getProposal(proposalId);

      expect(proposal === null).toBe(true);
      // check function calls
      expect(mockedClient.request).lastCalledWith(
        QueryAddresslistVotingProposal,
        {
          proposalId: getExtendedProposalId(proposalId),
        },
      );
    });
    it("Should get a list of proposals filtered by the given criteria", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const client = new AddresslistVotingClient(ctx);
      const limit = 5;
      const status = ProposalStatus.DEFEATED;
      const params: ProposalQueryParams = {
        limit,
        sortBy: ProposalSortBy.CREATED_AT,
        direction: SortDirection.ASC,
        status,
      };

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

      const defaultCatImplementation = mockedIPFSClient.cat
        .getMockImplementation();
      mockedIPFSClient.cat.mockResolvedValue(
        Buffer.from(
          JSON.stringify(ipfsMetadata),
        ),
      );

      const mockedClient = mockedGraphqlRequest.getMockedInstance(
        client.graphql.getClient(),
      );

      const subgraphProposal: SubgraphAddresslistVotingProposalListItem = {
        ...SUBGRAPH_PROPOSAL_BASE,
        voters: SUBGRAPH_VOTERS,
        earlyExecutable: false,
      };

      mockedClient.request.mockResolvedValueOnce({
        addresslistVotingProposals: [subgraphProposal],
      });

      const dateGetTimeSpy = jest.spyOn(Date.prototype, "getTime");
      const now = Date.now();
      const nowFilter = Math.round(now / 1000).toString();
      dateGetTimeSpy.mockReturnValueOnce(now);
      const proposals = await client.methods.getProposals(params);
      dateGetTimeSpy.mockRestore();

      expect(Array.isArray(proposals)).toBe(true);
      expect(proposals.length).toBe(1);
      expect(proposals[0].id).toBe(SUBGRAPH_PROPOSAL_BASE.id);
      expect(proposals[0].dao.address).toBe(SUBGRAPH_PROPOSAL_BASE.dao.id);
      expect(proposals[0].dao.name).toBe(SUBGRAPH_PROPOSAL_BASE.dao.subdomain);
      expect(proposals[0].creatorAddress).toBe(SUBGRAPH_PROPOSAL_BASE.creator);
      expect(proposals[0].metadata.title).toBe(ipfsMetadata.title);
      expect(proposals[0].metadata.summary).toBe(ipfsMetadata.summary);
      for (const [index, action] of proposals[0].actions.entries()) {
        expect(action.value).toBe(
          BigInt(SUBGRAPH_PROPOSAL_BASE.actions[index].value),
        );
        expect(action.to).toBe(SUBGRAPH_PROPOSAL_BASE.actions[index].to);
        expect(bytesToHex(action.data)).toBe(
          SUBGRAPH_PROPOSAL_BASE.actions[index].data.toLowerCase(),
        );
      }
      expect(proposals[0].startDate.getTime()).toBe(
        parseInt(SUBGRAPH_PROPOSAL_BASE.startDate) * 1000,
      );
      expect(proposals[0].endDate.getTime()).toBe(
        parseInt(SUBGRAPH_PROPOSAL_BASE.endDate) * 1000,
      );
      expect(proposals[0].status).toBe("Defeated");
      // result
      expect(proposals[0].result.yes).toBe(
        parseInt(SUBGRAPH_PROPOSAL_BASE.yes),
      );
      expect(proposals[0].result.no).toBe(parseInt(SUBGRAPH_PROPOSAL_BASE.no));
      expect(proposals[0].result.abstain).toBe(
        parseInt(SUBGRAPH_PROPOSAL_BASE.abstain),
      );
      expect(proposals[0].votes[0]).toMatchObject({
        vote: 2,
        voteReplaced: subgraphProposal.voters[0].voteReplaced,
        address: subgraphProposal.voters[0].voter.address,
      });
      expect(proposals[0].votes[1]).toMatchObject({
        vote: 3,
        voteReplaced: subgraphProposal.voters[1].voteReplaced,
        address: subgraphProposal.voters[1].voter.address,
      });

      expect(mockedClient.request).toHaveBeenCalledWith(
        QueryAddresslistVotingProposals,
        {
          where: {
            potentiallyExecutable: false,
            endDate_lt: nowFilter,
            executed: false,
          },
          skip: 0,
          limit: params.limit,
          direction: params.direction,
          sortBy: params.sortBy,
        },
      );

      mockedIPFSClient.cat.mockImplementation(defaultCatImplementation);
    });
    it("Should get a list of proposals from a specific dao", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const client = new AddresslistVotingClient(ctx);
      const limit = 5;
      const address = ADDRESS_ONE;
      const params: ProposalQueryParams = {
        limit,
        sortBy: ProposalSortBy.CREATED_AT,
        direction: SortDirection.ASC,
        daoAddressOrEns: address,
      };

      const mockedClient = mockedGraphqlRequest.getMockedInstance(
        client.graphql.getClient(),
      );

      mockedClient.request.mockResolvedValueOnce({
        addresslistVotingProposals: [],
      });

      await client.methods.getProposals(params);

      expect(mockedClient.request).toHaveBeenCalledWith(
        QueryAddresslistVotingProposals,
        {
          where: {
            dao: params.daoAddressOrEns,
          },
          skip: 0,
          limit: params.limit,
          direction: params.direction,
          sortBy: params.sortBy,
        },
      );
    });
    it("Should get a list of proposals from an invalid address", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const client = new AddresslistVotingClient(ctx);
      const limit = 5;
      const address = TEST_INVALID_ADDRESS;
      const params: ProposalQueryParams = {
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
      const ctx = new Context(contextParamsLocalChain);
      const client = new AddresslistVotingClient(ctx);
      const pluginAddress: string = ADDRESS_ONE;
      const mockedClient = mockedGraphqlRequest.getMockedInstance(
        client.graphql.getClient(),
      );

      mockedClient.request.mockResolvedValueOnce({
        addresslistVotingPlugin: {
          minDuration: "10",
          minProposerVotingPower: "200000",
          minParticipation: "300000",
          supportThreshold: "400000",
          votingMode: VotingMode.STANDARD,
        },
      });

      const settings = await client.methods.getVotingSettings(pluginAddress);

      expect(settings!.minDuration).toBe(10);
      expect(settings!.minParticipation).toBe(0.3);
      expect(settings!.supportThreshold).toBe(0.4);
      expect(settings!.minProposerVotingPower).toBe(BigInt(200000));
      expect(mockedClient.request).toHaveBeenCalledWith(
        QueryAddresslistVotingSettings,
        {
          address: ADDRESS_ONE,
          block: null,
        },
      );
    });
  });
});
