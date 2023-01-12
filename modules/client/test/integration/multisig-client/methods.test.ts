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
  Client,
  Context,
  ContextPlugin,
  CreateMultisigProposalParams,
  IProposalQueryParams,
  MultisigClient,
  ProposalCreationSteps,
  ProposalMetadata,
  ProposalSortBy,
  ProposalStatus,
  SortDirection,
} from "../../../src";
import { GraphQLError, InvalidAddressOrEnsError } from "@aragon/sdk-common";
import {
  contextParams,
  contextParamsLocalChain,
  TEST_INVALID_ADDRESS,
  TEST_MULTISIG_DAO_ADDRESS,
  TEST_MULTISIG_PLUGIN_ADDRESS,
  TEST_MULTISIG_PROPOSAL_ID,
  TEST_NON_EXISTING_ADDRESS,
  TEST_WALLET_ADDRESS,
} from "../constants";
import { EthereumProvider, Server } from "ganache";
import { CanExecuteParams, ExecuteProposalStep } from "../../../dist";

describe("Client Multisig", () => {
  let pluginAddress: string;
  let server: Server;

  beforeAll(async () => {
    server = await ganacheSetup.start();
    const deployment = await deployContracts.deploy();
    contextParamsLocalChain.daoFactoryAddress = deployment.daoFactory.address;
    const daoCreation = await deployContracts.createMultisigDAO(
      deployment,
      "testDAO",
      [TEST_WALLET_ADDRESS],
    );
    pluginAddress = daoCreation.pluginAddrs[0];
    // advance to get past the voting checkpoint
    await advanceBlocks(server.provider, 10);
  });

  afterAll(async () => {
    await server.close();
  });

  describe("Proposal Creation", () => {
    it("Should create a new proposal locally", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const multisigClient = new MultisigClient(ctxPlugin);
      const client = new Client(ctx);

      // generate actions
      const action = await client.encoding.withdrawAction(pluginAddress, {
        recipientAddress: "0x1234567890123456789012345678901234567890",
        amount: BigInt(1),
        reference: "test",
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

      const ipfsUri = await multisigClient.methods.pinMetadata(metadata);

      const proposalParams: CreateMultisigProposalParams = {
        pluginAddress,
        metadataUri: ipfsUri,
        actions: [action],
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
    });
  });

  describe("Approve proposal", () => {
    it("Should approve a local proposal", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new MultisigClient(ctxPlugin);

      const approveParams: ApproveMultisigProposalParams = {
        proposalId:
          "0x1234567890123456789012345678901234567890000000000000000000000001",
        tryExecution: true,
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
    });
  });

  describe("Can approve", () => {
    it("Should check if an user can approve in a multisig instance", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new MultisigClient(ctxPlugin);
      const address = await client.web3.getSigner()?.getAddress()
      const canApproveParams: CanApproveParams = {
        proposalId: BigInt(0),
        addressOrEns: address!,
        pluginAddress
      };
      const canApprove = await client.methods.canApprove(
        canApproveParams,
      );
      expect(typeof canApprove).toBe("boolean");
      expect(canApprove).toBe(true);
    });
  });
  describe("Execute proposal", () => {
    it("Should execute a local proposal", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new MultisigClient(ctxPlugin);

      for await (
        const step of client.methods.executeProposal(
          "0x1234567890123456789012345678901234567890000000000000000000000001",
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
  describe("Can execute", () => {
    it("Should check if an user can approve in a multisig instance", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new MultisigClient(ctxPlugin);
      const canExecuteParams: CanExecuteParams = {
        proposalId: BigInt(0),
        pluginAddress,
      };
      const canExecute = await client.methods.canExecute(
        canExecuteParams,
      );
      expect(typeof canExecute).toBe("boolean");
    });
  });

  describe("Data retrieval", () => {
    it("Should get the settings of the plugin", async () => {
      const ctx = new Context(contextParams);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new MultisigClient(ctxPlugin);

      const settings = await client.methods.getPluginSettings(
        TEST_MULTISIG_PLUGIN_ADDRESS,
      );
      expect(typeof settings).toBe("object");
      expect(typeof settings.votingSettings.minApprovals).toBe("number");
      expect(typeof settings.votingSettings.onlyListed).toBe("boolean")
    });
    it("Should fetch the given proposal", async () => {
      const ctx = new Context(contextParams);
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
    });
    it("Should fetch the given proposal and fail because the proposal does not exist", async () => {
      const ctx = new Context(contextParams);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new MultisigClient(ctxPlugin);

      const proposalId = TEST_NON_EXISTING_ADDRESS + "_0x1";
      const proposal = await client.methods.getProposal(proposalId);

      expect(proposal === null).toBe(true);
    });
    it("Should get a list of proposals filtered by the given criteria", async () => {
      const ctx = new Context(contextParams);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new MultisigClient(ctxPlugin);
      const limit = 5;
      const status = ProposalStatus.EXECUTED;
      const params: IProposalQueryParams = {
        limit,
        sortBy: ProposalSortBy.CREATED_AT,
        direction: SortDirection.ASC,
        status,
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
        expect(proposal.status).toBe(status);
      }
    });
    it("Should get a list of proposals from a specific dao", async () => {
      const ctx = new Context(contextParams);
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
      const ctx = new Context(contextParams);
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
      const ctx = new Context(contextParams);
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

async function advanceBlocks(
  provider: EthereumProvider,
  amountOfBlocks: number,
) {
  for (let i = 0; i < amountOfBlocks; i++) {
    await provider.send("evm_mine", []);
  }
}
