// @ts-ignore
declare const describe, it, expect, beforeAll, afterAll;

// mocks need to be at the top of the imports
import "../../mocks/aragon-sdk-ipfs";

import {
  CreateMajorityVotingProposalParams,
  TokenVotingClient,
  VoteProposalParams,
  VoteValues,
} from "../../../src";

import {
  ADDRESS_ONE,
  ADDRESS_TWO,
  contextParamsLocalChain,
} from "../constants";
import * as ganacheSetup from "../../helpers/ganache-setup";
import * as deployContracts from "../../helpers/deployContracts";
import { Server } from "ganache";
import { Context } from "@aragon/sdk-client-common";

describe("Token Voting Client", () => {
  describe("Estimation Module", () => {
    let server: Server;

    beforeAll(async () => {
      server = await ganacheSetup.start();
      const deployment = await deployContracts.deploy();
      contextParamsLocalChain.daoFactoryAddress = deployment.daoFactory.address;
      contextParamsLocalChain.ensRegistryAddress =
        deployment.ensRegistry.address;
    });

    afterAll(async () => {
      await server.close();
    });

    it("Should estimate the gas fees for creating a new proposal", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const client = new TokenVotingClient(ctx);

      const proposalParams: CreateMajorityVotingProposalParams = {
        pluginAddress: "0x1234567890123456789012345678901234567890",
        metadataUri: "ipfs://QmeJ4kRW21RRgjywi9ydvY44kfx71x2WbRq7ik5xh5zBZK",
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
      const client = new TokenVotingClient(ctx);

      const voteParams: VoteProposalParams = {
        proposalId: "0x1234567890123456789012345678901234567890_0x0",
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
      const client = new TokenVotingClient(ctx);

      const estimation = await client.estimation.executeProposal(
        "0x1234567890123456789012345678901234567890_0x0",
      );

      expect(typeof estimation).toEqual("object");
      expect(typeof estimation.average).toEqual("bigint");
      expect(typeof estimation.max).toEqual("bigint");
      expect(estimation.max).toBeGreaterThan(BigInt(0));
      expect(estimation.max).toBeGreaterThan(estimation.average);
    });

    it("Should estimate the gas fees for delegating voting power", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const client = new TokenVotingClient(ctx);

      const estimation = await client.estimation.delegateTokens(
        {
          tokenAddress: ADDRESS_ONE,
          delegatee: ADDRESS_TWO,
        },
      );

      expect(typeof estimation).toEqual("object");
      expect(typeof estimation.average).toEqual("bigint");
      expect(typeof estimation.max).toEqual("bigint");
      expect(estimation.max).toBeGreaterThan(BigInt(0));
      expect(estimation.max).toBeGreaterThan(estimation.average);
    });

    it("Should estimate the gas fees for undelegating voting power", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const client = new TokenVotingClient(ctx);

      const estimation = await client.estimation.undelegateTokens(ADDRESS_ONE);

      expect(typeof estimation).toEqual("object");
      expect(typeof estimation.average).toEqual("bigint");
      expect(typeof estimation.max).toEqual("bigint");
      expect(estimation.max).toBeGreaterThan(BigInt(0));
      expect(estimation.max).toBeGreaterThan(estimation.average);
    });
  });
});
