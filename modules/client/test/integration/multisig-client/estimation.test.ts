// @ts-ignore
declare const describe, it, expect, beforeAll, afterAll;

// mocks need to be at the top of the imports
import "../../mocks/aragon-sdk-ipfs";

import {
  ApproveMultisigProposalParams,
  Client,
  Context,
  ContextPlugin,
  CreateMultisigProposalParams,
  MultisigClient,
} from "../../../src";
import { contextParamsLocalChain, TEST_WALLET_ADDRESS } from "../constants";
import * as ganacheSetup from "../../helpers/ganache-setup";
import * as deployContracts from "../../helpers/deployContracts";
import { Server } from "ganache";

describe("Client Address List", () => {
  describe("Estimation module", () => {
    let pluginAddress: string;
    let server: Server;

    beforeAll(async () => {
      server = await ganacheSetup.start();
      const deployment = await deployContracts.deploy();
      contextParamsLocalChain.daoFactoryAddress = deployment.daoFactory.address;
      const daoCreation = await deployContracts.createMultisigDAO(
        deployment,
        "testDAO",
        [TEST_WALLET_ADDRESS],
      );
      pluginAddress = daoCreation.pluginAddrs[0];
      // advance to get past the voting checkpoint
    });

    afterAll(async () => {
      await server.close();
    });
    it("Should estimate the gas fees for creating a new proposal", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const multisigClient = new MultisigClient(ctxPlugin);
      const client = new Client(ctx);

      // generate actions
      const action = await client.encoding.withdrawAction(pluginAddress, {
        recipientAddress: "0x1234567890123456789012345678901234567890",
        amount: BigInt(1),
        reference: "test",
      });
      const proposalParams: CreateMultisigProposalParams = {
        pluginAddress: "0x1234567890123456789012345678901234567890",
        metadataUri: "ipfs://QmeJ4kRW21RRgjywi9ydvY44kfx71x2WbRq7ik5xh5zBZK",
        actions: [action],
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
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new MultisigClient(ctxPlugin);

      const approveParams: ApproveMultisigProposalParams = {
        proposalId: BigInt(0),
        pluginAddress: "0x1234567890123456789012345678901234567890",
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
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new MultisigClient(ctxPlugin);
      const estimation = await client.estimation.executeProposal(
        {
          pluginAddress: "0x1234567890123456789012345678901234567890",
          proposalId: BigInt(0),
        },
      );

      expect(typeof estimation).toEqual("object");
      expect(typeof estimation.average).toEqual("bigint");
      expect(typeof estimation.max).toEqual("bigint");
      expect(estimation.max).toBeGreaterThan(BigInt(0));
      expect(estimation.max).toBeGreaterThan(estimation.average);
    });
  });
});
