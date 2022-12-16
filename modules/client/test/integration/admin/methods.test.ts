// @ts-ignore
declare const describe, it, beforeAll, afterAll, expect;

// mocks need to be at the top of the imports
import { mockedIPFSClient } from "../../mocks/aragon-sdk-ipfs";

import * as ganacheSetup from "../../helpers/ganache-setup";
import * as deployContracts from "../../helpers/deployContracts";

import {
  Client,
  AdminClient,
  Context,
  ContextPlugin,
  ExecuteProposalParams,
  ExecuteProposalStep,
  ProposalMetadata,
  ProposalSortBy,
  ProposalStatus,
  SortDirection,
} from "../../../src";
import { GraphQLError, InvalidAddressOrEnsError } from "@aragon/sdk-common";
import {
  contextParams,
  contextParamsLocalChain,
  TEST_ADMIN_ADDRESS,
  TEST_ADMIN_PROPOSAL_ID,
  TEST_INVALID_ADDRESS,
  TEST_NON_EXISTING_ADDRESS,
  TEST_WALLET_ADDRESS,
} from "../constants";
import { Server } from "ganache";
import { IAdminProposalQueryParams } from "../../../src/admin";

describe("Client Admin", () => {
  let pluginAddress: string;
  let server: Server;

  beforeAll(async () => {
    server = await ganacheSetup.start();
    const deployment = await deployContracts.deploy();
    contextParamsLocalChain.daoFactoryAddress = deployment.daoFactory.address;
    const daoCreation = await deployContracts.createAdminDAO(
      deployment,
      "testDAO",
      TEST_WALLET_ADDRESS,
    );
    pluginAddress = daoCreation.pluginAddrs[0];
  });

  afterAll(async () => {
    await server.close();
  });

  describe("Proposal Creation", () => {
    it("Should create a new proposal locally", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const adminClient = new AdminClient(ctxPlugin);
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

      const ipfsUri = await adminClient.methods.pinMetadata(metadata);

      const proposalParams: ExecuteProposalParams = {
        pluginAddress,
        metadataUri: ipfsUri,
        actions: [action],
      };

      for await (
        const step of adminClient.methods.executeProposal(
          proposalParams,
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
              "Unexpected proposal execution step: " +
                Object.keys(step).join(", "),
            );
        }
      }
    });
  });

  describe("Data retrieval", () => {
    it("Should fetch the given proposal", async () => {
      const ctx = new Context(contextParams);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new AdminClient(ctxPlugin);

      const proposalId = TEST_ADMIN_PROPOSAL_ID;

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
      if (!proposal) throw new GraphQLError("Admin proposal");
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
      expect(proposal.creationDate instanceof Date).toBe(true);
      expect(Array.isArray(proposal.actions)).toBe(true);
      expect(typeof proposal.proposalId === "bigint").toBe(true);
      expect(typeof proposal.pluginAddress === "string").toBe(true);
      expect(proposal.pluginAddress).toMatch(/^0x[A-Fa-f0-9]{40}$/i);
      expect(typeof proposal.adminAddress === "string").toBe(true);
      expect(proposal.adminAddress).toMatch(/^0x[A-Fa-f0-9]{40}$/i);
      // actions
      for (let i = 0; i < proposal.actions.length; i++) {
        const action = proposal.actions[i];
        expect(action.data instanceof Uint8Array).toBe(true);
        expect(typeof action.to).toBe("string");
        expect(typeof action.value).toBe("bigint");
      }
    });
    it("Should fetch the given proposal and fail because the proposal does not exist", async () => {
      const ctx = new Context(contextParams);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new AdminClient(ctxPlugin);

      const proposalId = TEST_NON_EXISTING_ADDRESS + "_0x0";
      const proposal = await client.methods.getProposal(proposalId);

      expect(proposal === null).toBe(true);
    });
    it("Should get a list of proposals filtered by the given criteria", async () => {
      const ctx = new Context(contextParams);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new AdminClient(ctxPlugin);
      const limit = 5;
      const status = ProposalStatus.EXECUTED;
      const params: IAdminProposalQueryParams = {
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
        expect(typeof proposal.adminAddress === "string").toBe(true);
        expect(proposal.adminAddress).toMatch(/^0x[A-Fa-f0-9]{40}$/i);
        expect(proposal.status).toBe(status);
      }
    });
    it("Should get a list of proposals from a specific admin", async () => {
      const ctx = new Context(contextParams);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new AdminClient(ctxPlugin);
      const limit = 5;
      const address = TEST_ADMIN_ADDRESS;
      const params: IAdminProposalQueryParams = {
        limit,
        sortBy: ProposalSortBy.CREATED_AT,
        direction: SortDirection.ASC,
        adminAddressOrEns: address,
      };
      const proposals = await client.methods.getProposals(params);

      expect(Array.isArray(proposals)).toBe(true);
      expect(proposals.length > 0 && proposals.length <= limit).toBe(true);
    });
    it("Should get a list of proposals from an invalid address", async () => {
      const ctx = new Context(contextParams);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new AdminClient(ctxPlugin);
      const limit = 5;
      const address = TEST_INVALID_ADDRESS;
      const params: IAdminProposalQueryParams = {
        limit,
        sortBy: ProposalSortBy.CREATED_AT,
        direction: SortDirection.ASC,
        adminAddressOrEns: address,
      };
      await expect(() => client.methods.getProposals(params)).rejects.toThrow(
        new InvalidAddressOrEnsError(),
      );
    });
  });
});
