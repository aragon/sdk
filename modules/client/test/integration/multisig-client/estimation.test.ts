// mocks need to be at the top of the imports
import * as mockedGraphqlRequest from "../../mocks/graphql-request";
import "../../mocks/aragon-sdk-ipfs";

import {
  ApproveMultisigProposalParams,
  CreateMultisigProposalParams,
  MultisigClient,
} from "../../../src";
import {
  contextParamsLocalChain,
  SUBGRAPH_PLUGIN_INSTALLATION,
  TEST_WALLET_ADDRESS,
} from "../constants";
import * as deployContracts from "../../helpers/deployContracts";
import { Context } from "@aragon/sdk-client-common";
import { buildMultisigDAO } from "../../helpers/build-daos";
import { createMultisigPluginBuild } from "../../helpers/create-plugin-build";

describe("Client Multisig", () => {
  describe("Estimation module", () => {
    let pluginAddress: string;
    let deployment: deployContracts.Deployment;

    beforeAll(async () => {
      deployment = await deployContracts.deploy();
      contextParamsLocalChain.daoFactoryAddress = deployment.daoFactory.address;
      contextParamsLocalChain.multisigRepoAddress =
        deployment.multisigRepo.address;
      contextParamsLocalChain.pluginSetupProcessorAddress =
        deployment.pluginSetupProcessor.address;
      contextParamsLocalChain.ensRegistryAddress =
        deployment.ensRegistry.address;
      const daoCreation = await deployContracts.createMultisigDAO(
        deployment,
        "test-multisig-dao",
        [TEST_WALLET_ADDRESS],
      );
      pluginAddress = daoCreation.pluginAddrs[0];
      // advance to get past the voting checkpoint
    });

    it("Should estimate the gas fees for creating a new proposal", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const multisigClient = new MultisigClient(ctx);
      // generate actions
      const action = await multisigClient.encoding.updateMultisigVotingSettings(
        {
          pluginAddress,
          votingSettings: {
            minApprovals: 1,
            onlyListed: true,
          },
        },
      );
      const proposalParams: CreateMultisigProposalParams = {
        pluginAddress: "0x1234567890123456789012345678901234567890",
        metadataUri: "ipfs://QmeJ4kRW21RRgjywi9ydvY44kfx71x2WbRq7ik5xh5zBZK",
        actions: [action],
        failSafeActions: [false],
        startDate: new Date(),
        endDate: new Date(),
      };

      const estimation = await multisigClient.estimation.createProposal(
        proposalParams,
      );

      expect(typeof estimation).toEqual("object");
      expect(typeof estimation.average).toEqual("bigint");
      expect(typeof estimation.max).toEqual("bigint");
      expect(estimation.max).toBeGreaterThan(BigInt(0));
      expect(estimation.max).toBeGreaterThan(estimation.average);
    });

    it("Should estimate the gas fees for approving a proposal", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const client = new MultisigClient(ctx);

      const approveParams: ApproveMultisigProposalParams = {
        proposalId: "0x1234567890123456789012345678901234567890_0x0",
        tryExecution: true,
      };

      const estimation = await client.estimation.approveProposal(approveParams);

      expect(typeof estimation).toEqual("object");
      expect(typeof estimation.average).toEqual("bigint");
      expect(typeof estimation.max).toEqual("bigint");
      expect(estimation.max).toBeGreaterThan(BigInt(0));
      expect(estimation.max).toBeGreaterThan(estimation.average);
    });

    it("Should estimate the gas fees for executing a proposal", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const client = new MultisigClient(ctx);
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
      const client = new MultisigClient(ctx);

      const { dao, plugin } = await buildMultisigDAO(
        deployment.multisigRepo.address,
      );
      const mockedClient = mockedGraphqlRequest.getMockedInstance(
        client.graphql.getClient(),
      );
      const installation = SUBGRAPH_PLUGIN_INSTALLATION;
      installation.appliedPreparation.pluginRepo.id =
        deployment.multisigRepo.address;
      installation.appliedPreparation.helpers = [];
      mockedClient.request.mockResolvedValueOnce({
        iplugin: { installations: [installation] },
      });

      await createMultisigPluginBuild(1, deployment.multisigRepo.address);

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
