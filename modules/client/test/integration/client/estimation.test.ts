// @ts-ignore
declare const describe, it, expect, beforeAll, afterAll;

// mocks need to be at the top of the imports
import "../../mocks/aragon-sdk-ipfs";

import { Random } from "@aragon/sdk-common";
import { Client, Context, ICreateParams, IDepositParams } from "../../../src";
import { contextParamsLocalChain } from "../constants";
import * as ganacheSetup from "../../helpers/ganache-setup";
import * as deployContracts from "../../helpers/deployContracts";
import { deployErc20 } from "./methods.test";
import { Server } from "ganache";

let daoAddress = "0x1234567890123456789012345678901234567890";
describe("Client", () => {
  describe("Estimation module", () => {
    let server: Server;

    beforeAll(async () => {
      server = await ganacheSetup.start();
      const deployment = await deployContracts.deploy();
      contextParamsLocalChain.daoFactoryAddress = deployment.daoFactory.address;
    });

    afterAll(async () => {
      await server.close();
    });

    it("Should estimate gas fees for creating a DAO", async () => {
      const context = new Context(contextParamsLocalChain);
      const client = new Client(context);

      const daoName = "ERC20VotingDAO_" + Math.floor(Random.getFloat() * 9999) +
        1;

      const daoCreationParams: ICreateParams = {
        metadata: {
          name: daoName,
          description: "this is a dao",
          avatar: "https://...",
          links: [],
        },
        ensSubdomain: daoName.toLowerCase().replace(" ", "-"),
        plugins: [{ id: "0x1234", data: new Uint8Array() }],
      };

      const gasFeesEstimation = await client.estimation.create(
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

      const depositParams: IDepositParams = {
        daoAddressOrEns: daoAddress,
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

      const depositParams: IDepositParams = {
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
