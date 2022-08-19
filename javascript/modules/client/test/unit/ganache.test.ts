declare const describe, it, beforeAll, afterAll, expect, test;

import { JsonRpcProvider, Networkish } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";
import {
  Client,
  Context,
  ContextParams,
  DaoCreationSteps,
  DaoDepositSteps,
  ICreateParams,
  IDepositParams,
} from "../../src";
import * as ganacheSetup from "../../../../helpers/ganache-setup";
import * as deployContracts from "../../../../helpers/deployContracts";

describe("Client", () => {
  beforeAll(async () => {
    const server = await ganacheSetup.start();
    const daoFactory = await deployContracts.deploy(server);
    console.log(daoFactory.address)
  });

  afterAll(async () => {
    await ganacheSetup.stop();
  });
  it("Should Pass", async () => {
    const a = 1
    expect(a === 1).toBe(true)
  });
});