// mocks need to be at the top of the imports
import "../../mocks/aragon-sdk-ipfs";

import {
  AddresslistVotingClient,
  Client,
  Context,
  CreateDaoParams,
  DepositParams,
  IAddresslistVotingPluginInstall,
  SupportedNetworksArray,
  TokenType,
  UpdateAllowanceParams,
} from "../../../src";
import { contextParamsLocalChain } from "../constants";
import * as ganacheSetup from "../../helpers/ganache-setup";
import * as deployContracts from "../../helpers/deployContracts";
import { Server } from "ganache";
import { deployErc20 } from "../../helpers/deploy-erc20";

jest.spyOn(SupportedNetworksArray, "includes").mockReturnValue(true);
jest.spyOn(Context.prototype, "network", "get").mockReturnValue(
  { chainId: 5, name: "goerli" },
);
let daoAddress = "0x1234567890123456789012345678901234567890";
describe("Client", () => {
  let deployment: deployContracts.Deployment;
  describe("Estimation module", () => {
    let server: Server;

    beforeAll(async () => {
      server = await ganacheSetup.start();
      deployment = await deployContracts.deploy();
      contextParamsLocalChain.daoFactoryAddress = deployment.daoFactory.address;
      contextParamsLocalChain.ensRegistryAddress =
        deployment.ensRegistry.address;
    });

    afterAll(async () => {
      await server.close();
    });

    it("Should estimate gas fees for creating a DAO", async () => {
      const context = new Context(contextParamsLocalChain);
      const client = new Client(context);

      const daoName = "TokenVotingDAO-" + Math.floor(Math.random() * 9999) +
        1;

      const pluginParams: IAddresslistVotingPluginInstall = {
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
        .getPluginInstallItem(pluginParams);
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

    it("Should estimate gas fees updating allowance", async () => {
      const context = new Context(contextParamsLocalChain);
      const client = new Client(context);

      const tokenContract = await deployErc20(client);

      const depositParams: UpdateAllowanceParams = {
        daoAddressOrEns: daoAddress,
        amount: BigInt(1234),
        tokenAddress: tokenContract.address,
      };

      const gasFeesEstimation = await client.estimation.updateAllowance(
        depositParams,
      );

      expect(typeof gasFeesEstimation).toEqual("object");
      expect(typeof gasFeesEstimation.average).toEqual("bigint");
      expect(typeof gasFeesEstimation.max).toEqual("bigint");
      expect(gasFeesEstimation.max).toBeGreaterThan(BigInt(0));
      expect(gasFeesEstimation.max).toBeGreaterThan(gasFeesEstimation.average);
    });
  });
});
