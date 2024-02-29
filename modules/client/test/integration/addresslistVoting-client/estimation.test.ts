// mocks need to be at the top of the imports
import * as mockedGraphqlRequest from "../../mocks/graphql-request";
import "../../mocks/aragon-sdk-ipfs";

import {
  AddresslistVotingClient,
  CreateMajorityVotingProposalParams,
  VoteProposalParams,
  VoteValues,
} from "../../../src";
import {
  ADDRESS_ONE,
  contextParamsLocalChain,
  SUBGRAPH_PLUGIN_INSTALLATION,
} from "../constants";
import * as deployContracts from "../../helpers/deployContracts";
import { Context } from "@aragon/sdk-client-common";
import { buildAddressListVotingDAO } from "../../helpers/build-daos";
import { createAddresslistVotingPluginBuild } from "../../helpers/create-plugin-build";
import {
  contracts,
  NetworkDeployment,
  SupportedVersions,
} from "@aragon/osx-commons-configs";

describe("Client Address List", () => {
  describe("Estimation module", () => {
    let deployment: deployContracts.Deployment;

    beforeAll(async () => {
      deployment = await deployContracts.deploy();
      contextParamsLocalChain.DAOFactory = deployment.daoFactory.address;
      contextParamsLocalChain.PluginSetupProcessor =
        deployment.pluginSetupProcessor.address;
      contextParamsLocalChain.AddresslistVotingRepoProxy =
        deployment.addresslistVotingRepo.address;
      contextParamsLocalChain.ENSRegistry = deployment.ensRegistry.address;
      contracts.local = {
        [SupportedVersions.V1_3_0]: {
          AddresslistVotingRepoProxy: { address: ADDRESS_ONE },
        } as NetworkDeployment,
      };
    });

    it("Should estimate the gas fees for creating a new proposal", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const client = new AddresslistVotingClient(ctx);

      const proposalParams: CreateMajorityVotingProposalParams = {
        pluginAddress: "0x1234567890123456789012345678901234567890",
        metadataUri: "ipfs://QmeJ4kRW21RRgjywi9ydvY44kfx71x2WbRq7ik5xh5zBZK",
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
      const client = new AddresslistVotingClient(ctx);

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
      const client = new AddresslistVotingClient(ctx);

      const estimation = await client.estimation.executeProposal(
        "0x1234567890123456789012345678901234567890_0x0",
      );

      expect(typeof estimation).toEqual("object");
      expect(typeof estimation.average).toEqual("bigint");
      expect(typeof estimation.max).toEqual("bigint");
      expect(estimation.max).toBeGreaterThan(BigInt(0));
      expect(estimation.max).toBeGreaterThan(estimation.average);
    });

    it("Should estimate the gas fees for preparing an update", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const client = new AddresslistVotingClient(ctx);

      const { dao, plugin } = await buildAddressListVotingDAO(
        deployment.addresslistVotingRepo.address,
      );

      await createAddresslistVotingPluginBuild(
        1,
        deployment.addresslistVotingRepo.address,
      );
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
