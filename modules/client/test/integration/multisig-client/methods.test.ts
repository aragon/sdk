// @ts-ignore
declare const describe, it, beforeAll, afterAll, expect;

// mocks need to be at the top of the imports
import { mockedIPFSClient } from "../../mocks/aragon-sdk-ipfs";

import * as ganacheSetup from "../../helpers/ganache-setup";
import * as deployContracts from "../../helpers/deployContracts";

import {
  ApproveMultisigProposalParams,
  ApproveProposalStep,
  CanApproveParams,
  Context,
  ContextPlugin,
  CreateMultisigProposalParams,
  IProposalQueryParams,
  MultisigClient,
  ProposalCreationSteps,
  ProposalMetadata,
  ProposalSortBy,
  SortDirection,
} from "../../../src";
import { GraphQLError, InvalidAddressOrEnsError } from "@aragon/sdk-common";
import {
  contextParamsLocalChain,
  contextParamsMainnet,
  TEST_INVALID_ADDRESS,
  TEST_MULTISIG_DAO_ADDRESS,
  TEST_MULTISIG_PLUGIN_ADDRESS,
  TEST_MULTISIG_PROPOSAL_ID,
  TEST_NON_EXISTING_ADDRESS,
  TEST_WALLET_ADDRESS,
} from "../constants";
import { Server } from "ganache";
// import { advanceBlocks } from "../../helpers/advance-blocks";
import { CanExecuteParams, ExecuteProposalStep } from "../../../src";
import { buildMultisigDAO } from "../../helpers/build-daos";
import { advanceBlocks } from "../../helpers/advance-blocks";

describe("Client Multisig", () => {
  let deployment: deployContracts.Deployment;
  let server: Server;

  beforeAll(async () => {
    server = await ganacheSetup.start();
    deployment = await deployContracts.deploy();
    contextParamsLocalChain.daoFactoryAddress = deployment.daoFactory.address;
  });

  afterAll(async () => {
    await server.close();
  });

  async function buildDao() {
    const repoAddr = deployment.multisigRepo.address;
    const result = await buildMultisigDAO(repoAddr);
    await advanceBlocks(server.provider, 10);
    return result;
  }

  async function buildProposal(
    pluginAddress: string,
    multisigClient: MultisigClient,
  ): Promise<number> {
    // generate actions
    const action = multisigClient.encoding.updateMultisigVotingSettings(
      {
        pluginAddress,
        votingSettings: {
          minApprovals: 1,
          onlyListed: true,
        },
      },
    );

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
    const ipfsUri = await multisigClient.methods.pinMetadata(metadata);
    const endDate = new Date(Date.now() + 1000 * 60);
    const proposalParams: CreateMultisigProposalParams = {
      pluginAddress,
      metadataUri: ipfsUri,
      actions: [action],
      failSafeActions: [false],
      endDate,
    };

    for await (
      const step of multisigClient.methods.createProposal(
        proposalParams,
      )
    ) {
      switch (step.key) {
        case ProposalCreationSteps.CREATING:
          expect(typeof step.txHash).toBe("string");
          expect(step.txHash).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
          break;
        case ProposalCreationSteps.DONE:
          expect(typeof step.proposalId).toBe("bigint");
          return step.proposalId;
          // TODO
          // update with new proposal id when contracts are ready
          // expect(typeof step.proposalId).toBe("string");
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
  async function approveProposal(
    proposalId: number,
    pluginAddress: string,
    client: MultisigClient,
  ) {
    const approveParams: ApproveMultisigProposalParams = {
      proposalId,
      pluginAddress,
      tryExecution: false,
    };
    for await (const step of client.methods.approveProposal(approveParams)) {
      switch (step.key) {
        case ApproveProposalStep.APPROVING:
          expect(typeof step.txHash).toBe("string");
          expect(step.txHash).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
          break;
        case ApproveProposalStep.DONE:
          break;
        default:
          throw new Error(
            "Unexpected approve proposal step: " +
              Object.keys(step).join(", "),
          );
      }
    }
  }

  describe("Proposal Creation", () => {
    it("Should create a new proposal locally", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const multisigClient = new MultisigClient(ctxPlugin);

      const { plugin: pluginAddress } = await buildDao();

      await buildProposal(pluginAddress, multisigClient);
    });
  });

  describe("Can approve", () => {
    it("Should check if an user can approve in a multisig instance", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new MultisigClient(ctxPlugin);
      // const address = await client.web3.getSigner()?.getAddress();

      const { plugin: pluginAddress } = await buildDao();

      const proposalId = await buildProposal(pluginAddress, client);
      const canApproveParams: CanApproveParams = {
        proposalId,
        addressOrEns: TEST_WALLET_ADDRESS,
        pluginAddress,
      };
      // positive
      let canApprove = await client.methods.canApprove(canApproveParams);
      expect(typeof canApprove).toBe("boolean");
      expect(canApprove).toBe(true);

      // negative
      canApproveParams.addressOrEns =
        "0x0000000000000000000000000000000000000000";
      canApprove = await client.methods.canApprove(canApproveParams);
      expect(typeof canApprove).toBe("boolean");
      expect(canApprove).toBe(false);
    });
  });

  describe("Approve proposal", () => {
    it("Should approve a local proposal", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new MultisigClient(ctxPlugin);

      const { plugin: pluginAddress } = await buildDao();

      const proposalId = await buildProposal(pluginAddress, client);
      await approveProposal(proposalId, pluginAddress, client);
    });
  });

  describe("Can execute", () => {
    it("Should check if an user can execute in a multisig instance", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new MultisigClient(ctxPlugin);

      const { plugin: pluginAddress } = await buildDao();

      const proposalId = await buildProposal(pluginAddress, client);
      const canExecuteParams: CanExecuteParams = {
        proposalId,
        pluginAddress,
      };
      let canExecute = await client.methods.canExecute(canExecuteParams);
      expect(typeof canExecute).toBe("boolean");
      expect(canExecute).toBe(false);

      // now approve
      await approveProposal(proposalId, pluginAddress, client);

      canExecute = await client.methods.canExecute(canExecuteParams);
      expect(typeof canExecute).toBe("boolean");
      expect(canExecute).toBe(true);
    });
  });

  describe("Execute proposal", () => {
    it("Should execute a local proposal", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new MultisigClient(ctxPlugin);

      const { plugin: pluginAddress } = await buildDao();

      const proposalId = await buildProposal(pluginAddress, client);
      await approveProposal(proposalId, pluginAddress, client);

      for await (
        const step of client.methods.executeProposal(
          {
            pluginAddress,
            proposalId,
          },
        )
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
    it("Should get the voting settings of the plugin", async () => {
      const ctx = new Context(contextParamsMainnet);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new MultisigClient(ctxPlugin);

      const settings = await client.methods.getVotingSettings(
        TEST_MULTISIG_PLUGIN_ADDRESS,
      );
      expect(typeof settings).toBe("object");
      expect(typeof settings.minApprovals).toBe("number");
      expect(typeof settings.onlyListed).toBe("boolean");
    });

    it("Should get members of the multisig", async () => {
      const ctx = new Context(contextParamsMainnet);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new MultisigClient(ctxPlugin);

      const wallets = await client.methods.getMembers(
        TEST_MULTISIG_PLUGIN_ADDRESS,
      );
      expect(Array.isArray(wallets)).toBe(true);
      expect(wallets.length).toBeGreaterThan(0);
      expect(typeof wallets[0]).toBe("string");
      expect(wallets[0]).toMatch(/^0x[A-Fa-f0-9]{40}$/i);
    });

    it("Should fetch the given proposal", async () => {
      const ctx = new Context(contextParamsMainnet);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new MultisigClient(ctxPlugin);

      const proposalId = TEST_MULTISIG_PROPOSAL_ID;

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
      if (!proposal) {
        throw new GraphQLError("multisig proposal");
      }
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
      for (const resource of proposal.metadata.resources) {
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
      expect(proposal.creationDate instanceof Date).toBe(true);
      expect(proposal.startDate instanceof Date).toBe(true);
      expect(proposal.endDate instanceof Date).toBe(true);
      expect(Array.isArray(proposal.actions)).toBe(true);
      // actions
      for (const action of proposal.actions) {
        expect(action.data instanceof Uint8Array).toBe(true);
        expect(typeof action.to).toBe("string");
        expect(typeof action.value).toBe("bigint");
      }
      for (const approval of proposal.approvals) {
        expect(typeof approval).toBe("string");
        expect(approval).toMatch(/^0x[A-Fa-f0-9]{40}_0x[A-Fa-f0-9]{40}$/i);
      }
      if (proposal.executionTxHash) {
        expect(proposal.executionTxHash).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
      }
    });
    it("Should fetch the given proposal and fail because the proposal does not exist", async () => {
      const ctx = new Context(contextParamsMainnet);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new MultisigClient(ctxPlugin);

      const proposalId = TEST_NON_EXISTING_ADDRESS + "_0x1";
      const proposal = await client.methods.getProposal(proposalId);

      expect(proposal === null).toBe(true);
    });
    it("Should get a list of proposals filtered by the given criteria", async () => {
      const ctx = new Context(contextParamsMainnet);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new MultisigClient(ctxPlugin);
      const limit = 5;
      const params: IProposalQueryParams = {
        limit,
        sortBy: ProposalSortBy.CREATED_AT,
        direction: SortDirection.ASC,
      };
      const proposals = await client.methods.getProposals(params);

      expect(Array.isArray(proposals)).toBe(true);
      expect(proposals.length <= limit).toBe(true);
      for (const proposal of proposals) {
        expect(typeof proposal.id).toBe("string");
        expect(proposal.id).toMatch(/^0x[A-Fa-f0-9]{40}_0x[A-Fa-f0-9]{1,}$/i);
        expect(typeof proposal.dao.address).toBe("string");
        expect(proposal.dao.address).toMatch(/^0x[A-Fa-f0-9]{40}$/i);
        expect(typeof proposal.dao.name).toBe("string");
        expect(typeof proposal.creatorAddress).toBe("string");
        expect(proposal.creatorAddress).toMatch(/^0x[A-Fa-f0-9]{40}$/i);
        expect(typeof proposal.metadata.title).toBe("string");
        expect(typeof proposal.metadata.summary).toBe("string");
        expect(typeof proposal.approvals).toBe("number");
        expect(proposal.approvals >= 0).toBe(true);
      }
    });
    it("Should get a list of proposals from a specific dao", async () => {
      const ctx = new Context(contextParamsMainnet);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new MultisigClient(ctxPlugin);
      const limit = 5;
      const address = TEST_MULTISIG_DAO_ADDRESS;
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
      const client = new MultisigClient(ctxPlugin);
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
      const client = new MultisigClient(ctxPlugin);
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
  });
});
