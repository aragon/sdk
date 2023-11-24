import * as mockedGraphqlRequest from "../../mocks/graphql-request";
import "../../mocks/aragon-sdk-ipfs";

import {
  AddresslistVotingClient,
  AddresslistVotingPluginInstall,
  Client,
  CreateDaoParams,
  DepositParams,
  SetAllowanceParams,
} from "../../../src";
import {
  contextParamsLocalChain,
  SUBGRAPH_PLUGIN_INSTALLATION,
} from "../constants";
import * as deployContracts from "../../helpers/deployContracts";
import { deployErc20 } from "../../helpers/deploy-erc20";
import { Context, TokenType } from "@aragon/sdk-client-common";
import { deployErc1155 } from "../../helpers/deploy-erc1155";
import { deployErc721 } from "../../helpers/deploy-erc721";
import { buildMultisigDAO } from "../../helpers/build-daos";
import { createMultisigPluginBuild } from "../../helpers/create-plugin-build";

let daoAddress = "0x1234567890123456789012345678901234567890";
describe("Client", () => {
  let deployment: deployContracts.Deployment;
  describe("Estimation module", () => {

    beforeAll(async () => {
      deployment = await deployContracts.deploy();
      contextParamsLocalChain.daoFactoryAddress = deployment.daoFactory.address;
      contextParamsLocalChain.pluginSetupProcessorAddress =
        deployment.pluginSetupProcessor.address;
      contextParamsLocalChain.ensRegistryAddress =
        deployment.ensRegistry.address;
    });

    it("Should estimate gas fees for creating a DAO", async () => {
      const context = new Context(contextParamsLocalChain);
      const client = new Client(context);

      const daoName = "TokenVotingDAO-" + Math.floor(Math.random() * 9999) +
        1;

      const pluginParams: AddresslistVotingPluginInstall = {
        votingSettings: {
          minDuration: 3600,
          minParticipation: 0.5,
          supportThreshold: 0.5,
        },
        addresses: [
          "0x1234567890123456789012345678901234567890",
          "0x0987654321098765432109876543210987654321",
        ],
      };

      const addresslistVotingPlugin = AddresslistVotingClient.encoding
        .getPluginInstallItem(pluginParams, "local");
      addresslistVotingPlugin.id = deployment.addresslistVotingRepo.address;

      const daoCreationParams: CreateDaoParams = {
        metadataUri: `ipfs://QmeJ4kRW21RRgjywi9ydvY44kfx71x2WbRq7ik5xh5zBZK`,
        ensSubdomain: daoName.toLowerCase().replace(" ", "-"),
        plugins: [
          addresslistVotingPlugin,
        ],
      };

      const gasFeesEstimation = await client.estimation.createDao(
        daoCreationParams,
      );

      expect(typeof gasFeesEstimation).toEqual("object");
      expect(typeof gasFeesEstimation.average).toEqual("bigint");
      expect(typeof gasFeesEstimation.max).toEqual("bigint");
      expect(gasFeesEstimation.max).toBeGreaterThan(BigInt(0));
      expect(gasFeesEstimation.max).toBeGreaterThan(gasFeesEstimation.average);
    });
    it("Should estimate gas fees for making a deposit", async () => {
      const context = new Context(contextParamsLocalChain);
      const client = new Client(context);

      const depositParams: DepositParams = {
        type: TokenType.ERC20,
        daoAddressOrEns: daoAddress,
        tokenAddress: "0x1234567890123456789012345678901234567890",
        amount: BigInt(1234),
      };

      const gasFeesEstimation = await client.estimation.deposit(depositParams);

      expect(typeof gasFeesEstimation).toEqual("object");
      expect(typeof gasFeesEstimation.average).toEqual("bigint");
      expect(typeof gasFeesEstimation.max).toEqual("bigint");
      expect(gasFeesEstimation.max).toBeGreaterThan(BigInt(0));
      expect(gasFeesEstimation.max).toBeGreaterThan(gasFeesEstimation.average);
    });
    it("Should estimate gas fees for making an erc721 deposit", async () => {
      const context = new Context(contextParamsLocalChain);
      const client = new Client(context);

      const tokenContract = await deployErc721();
      const depositParams: DepositParams = {
        type: TokenType.ERC721,
        daoAddressOrEns: daoAddress,
        tokenAddress: tokenContract.address,
        tokenId: BigInt(0),
      };

      const gasFeesEstimation = await client.estimation.deposit(depositParams);

      expect(typeof gasFeesEstimation).toEqual("object");
      expect(typeof gasFeesEstimation.average).toEqual("bigint");
      expect(typeof gasFeesEstimation.max).toEqual("bigint");
      expect(gasFeesEstimation.max).toBeGreaterThan(BigInt(0));
      expect(gasFeesEstimation.max).toBeGreaterThan(gasFeesEstimation.average);
    });
    it("Should estimate gas fees for making an erc1155 deposit", async () => {
      const context = new Context(contextParamsLocalChain);
      const client = new Client(context);

      const tokenContract = await deployErc1155();
      const depositParams: DepositParams = {
        type: TokenType.ERC1155,
        daoAddressOrEns: daoAddress,
        tokenAddress: tokenContract.address,
        amounts: [BigInt(1)],
        tokenIds: [BigInt(0)],
      };

      const gasFeesEstimation = await client.estimation.deposit(depositParams);

      expect(typeof gasFeesEstimation).toEqual("object");
      expect(typeof gasFeesEstimation.average).toEqual("bigint");
      expect(typeof gasFeesEstimation.max).toEqual("bigint");
      expect(gasFeesEstimation.max).toBeGreaterThan(BigInt(0));
      expect(gasFeesEstimation.max).toBeGreaterThan(gasFeesEstimation.average);
    });
    it("Should estimate gas fees for making an erc1155 batch deposit", async () => {
      const context = new Context(contextParamsLocalChain);
      const client = new Client(context);
      const tokenContract = await deployErc1155();
      const depositParams: DepositParams = {
        type: TokenType.ERC1155,
        daoAddressOrEns: daoAddress,
        tokenAddress: tokenContract.address,
        amounts: [BigInt(1), BigInt(2)],
        tokenIds: [BigInt(0), BigInt(0)],
      };

      const gasFeesEstimation = await client.estimation.deposit(depositParams);

      expect(typeof gasFeesEstimation).toEqual("object");
      expect(typeof gasFeesEstimation.average).toEqual("bigint");
      expect(typeof gasFeesEstimation.max).toEqual("bigint");
      expect(gasFeesEstimation.max).toBeGreaterThan(BigInt(0));
      expect(gasFeesEstimation.max).toBeGreaterThan(gasFeesEstimation.average);
    });

    it("Should estimate gas fees updating allowance", async () => {
      const context = new Context(contextParamsLocalChain);
      const client = new Client(context);

      const tokenContract = await deployErc20();

      const depositParams: SetAllowanceParams = {
        spender: daoAddress,
        amount: BigInt(1234),
        tokenAddress: tokenContract.address,
      };

      const gasFeesEstimation = await client.estimation.setAllowance(
        depositParams,
      );

      expect(typeof gasFeesEstimation).toEqual("object");
      expect(typeof gasFeesEstimation.average).toEqual("bigint");
      expect(typeof gasFeesEstimation.max).toEqual("bigint");
      expect(gasFeesEstimation.max).toBeGreaterThan(BigInt(0));
      expect(gasFeesEstimation.max).toBeGreaterThan(gasFeesEstimation.average);
    });
    it("Should estimate the gas fees for preparing an update", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const client = new Client(ctx);
      const { dao, plugin } = await buildMultisigDAO(
        deployment.multisigRepo.address,
      );

      await createMultisigPluginBuild(1, deployment.multisigRepo.address);
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

      const estimation = await client.estimation.prepareUpdate({
        pluginAddress: plugin,
        pluginRepo: deployment.multisigRepo.address,
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
