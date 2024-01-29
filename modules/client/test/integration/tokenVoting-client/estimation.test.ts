// mocks need to be at the top of the imports
import * as mockedGraphqlRequest from "../../mocks/graphql-request";
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
  SUBGRAPH_PLUGIN_INSTALLATION,
} from "../constants";
import * as deployContracts from "../../helpers/deployContracts";
import { Context } from "@aragon/sdk-client-common";
import { buildTokenVotingDAO } from "../../helpers/build-daos";
import { createTokenVotingPluginBuild } from "../../helpers/create-plugin-build";
import {
  contracts,
  NetworkDeployment,
  SupportedVersions,
} from "@aragon/osx-commons-configs";

describe("Token Voting Client", () => {
  describe("Estimation Module", () => {
    let deployment: deployContracts.Deployment;
    beforeAll(async () => {
      deployment = await deployContracts.deploy();
      contextParamsLocalChain.DAOFactory = deployment.daoFactory.address;
      contextParamsLocalChain.TokenVotingRepoProxy =
        deployment.tokenVotingRepo.address;
      contextParamsLocalChain.PluginSetupProcessor =
        deployment.pluginSetupProcessor.address;
      contextParamsLocalChain.ENSRegistry = deployment.ensRegistry.address;
      contracts.local = {
        [SupportedVersions.V1_3_0]: {
          TokenVotingRepoProxy: { address: ADDRESS_ONE },
        } as NetworkDeployment,
      };
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
    it("Should estimate the gas fees for preparing an update", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const client = new TokenVotingClient(ctx);
      const { dao, plugin, tokenAddress } = await buildTokenVotingDAO(
        deployment.tokenVotingRepo.address,
      );

      await createTokenVotingPluginBuild(1, deployment.tokenVotingRepo.address);

      const mockedClient = mockedGraphqlRequest.getMockedInstance(
        client.graphql.getClient(),
      );
      const installation = SUBGRAPH_PLUGIN_INSTALLATION;
      installation.appliedPreparation.pluginRepo.id =
        deployment.tokenVotingRepo.address;
      installation.appliedPreparation.helpers = [tokenAddress];
      mockedClient.request.mockResolvedValueOnce({
        iplugin: { installations: [installation] },
      });

      const estimation = await client.estimation.prepareUpdate({
        pluginAddress: plugin,
        daoAddressOrEns: dao,
        newVersion: {
          build: 2,
          release: 1,
        },
      });

      expect(typeof estimation).toEqual("object");
      expect(typeof estimation.average).toEqual("bigint");
      expect(typeof estimation.max).toEqual("bigint");
      expect(estimation.max).toBeGreaterThan(BigInt(0));
      expect(estimation.max).toBeGreaterThan(estimation.average);
    });
  });
});
