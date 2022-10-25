// @ts-ignore
declare const describe, it, expect, beforeAll, afterAll;

import { ClientAddressList, Context, ContextPlugin } from "../../../src";

import {
  ICreateProposalParams,
  IExecuteProposalParams,
  IVoteProposalParams,
  VoteValues,
} from "../../../src";
import { contextParamsLocalChain } from "../constants";
import * as ganacheSetup from "../../../../../helpers/ganache-setup";
import * as deployContracts from "../../../../../helpers/deployContracts";
describe("Client Address List", () => {
  describe("Estimation module", () => {
    beforeAll(async () => {
      const server = await ganacheSetup.start();
      const daoFactory = await deployContracts.deploy(server);
      contextParamsLocalChain.daoFactoryAddress = daoFactory.address;
    });

    afterAll(async () => {
      await ganacheSetup.stop();
    });

    it("Should estimate the gas fees for creating a new proposal", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new ClientAddressList(ctxPlugin);

      const proposalParams: ICreateProposalParams = {
        pluginAddress: "0x1234567890123456789012345678901234567890",
        metadata: {
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

    it("Should estimate the gas fees for casting a vote", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new ClientAddressList(ctxPlugin);

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

    it("Should estimate the gas fees for executing a proposal", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new ClientAddressList(ctxPlugin);

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
  });
});
