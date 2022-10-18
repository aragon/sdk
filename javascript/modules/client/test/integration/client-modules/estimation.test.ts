// @ts-ignore
declare const describe, it, expect, beforeAll, afterAll;

import { Random } from "@aragon/sdk-common";
import {
  Client,
  Context,
  ICreateParams,
  IDepositParams,
} from "../../../src";
import { contextParamsLocalChain } from "../constants";
import * as ganacheSetup from "../../../../../helpers/ganache-setup";
import * as deployContracts from "../../../../../helpers/deployContracts";

let daoAddress = "0x1234567890123456789012345678901234567890";
describe("Estimation module", () => {
  beforeAll(async () => {
    const server = await ganacheSetup.start();
    const daoFactory = await deployContracts.deploy(server);
    contextParamsLocalChain.daoFactoryAddress = daoFactory.address;
  });

  afterAll(async () => {
    await ganacheSetup.stop();
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
      plugins: [
        { id: "0x1234", data: new Uint8Array([11, 11]) },
      ],
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
      daoAddress: daoAddress,
      amount: BigInt(1234),
    };

    const gasFeesEstimation = await client.estimation.deposit(
      depositParams,
    );

    expect(typeof gasFeesEstimation).toEqual("object");
    expect(typeof gasFeesEstimation.average).toEqual("bigint");
    expect(typeof gasFeesEstimation.max).toEqual("bigint");
    expect(gasFeesEstimation.max).toBeGreaterThan(BigInt(0));
    expect(gasFeesEstimation.max).toBeGreaterThan(gasFeesEstimation.average);
  });
});
