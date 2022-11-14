import { DAO, DAO__factory } from "@aragon/core-contracts-ethers";
import { JsonRpcProvider, Provider } from "@ethersproject/providers";
import { Server } from "ganache";
import {
  createAllowlistDAO,
  deploy,
  Deployment,
} from "../../helpers/deployContracts";
import { start } from "../../helpers/ganache-setup";
import {
  AllowlistVoting,
  AllowlistVotingContextPlugin,
  Steps,
} from "../../../src/allowlistVoting";
import { Signer } from "@ethersproject/abstract-signer";
import { Wallet } from "@ethersproject/wallet";
import { id } from "@ethersproject/hash";

describe("AllowlistVoting", () => {
  describe("Methods", () => {
    let server: Server;
    let deployments: Deployment;
    let allowlistVoting: AllowlistVoting;
    let daoAddr: string;
    let signer: Signer;
    let provider: JsonRpcProvider;

    beforeAll(async () => {
      server = await start();
      deployments = await deploy();
    });

    beforeEach(async () => {
      provider = new JsonRpcProvider("http://127.0.0.1:8545");
      signer = provider.getSigner();

      let createDaoReturns = await createAllowlistDAO(
        deployments,
        Math.round(Math.random() * 2000).toString(16),
        [await signer.getAddress()]
      );
      const context = new AllowlistVotingContextPlugin({
        pluginAddress: createDaoReturns.pluginAddrs[0],
        daoFactoryAddress: deployments.daoFactory.address,
        web3Providers: [provider],
        signer: signer,
      });

      allowlistVoting = new AllowlistVoting(context);
      daoAddr = createDaoReturns.daoAddr;
    });

    afterAll(async () => {
      await server.close();
    });

    it("should add users", async () => {
      await becomeRoot(
        allowlistVoting,
        daoAddr,
        allowlistVoting.pluginInstance.address,
        await signer.getAddress()
      );
      const randomUsers: string[] = [];
      randomUsers.push(Wallet.createRandom().address);
      randomUsers.push(Wallet.createRandom().address);
      randomUsers.push(Wallet.createRandom().address);
      const dao = getDAOInstance(daoAddr, signer);
      await dao.grant(
        allowlistVoting.pluginInstance.address,
        await signer.getAddress(),
        id("MODIFY_ALLOWLIST_PERMISSION")
      );

      const call = await allowlistVoting.methods.addAllowedUsers(randomUsers);
      const pendingStep = await call.next();
      const doneStep = await call.next();

      expect(pendingStep.value.key).toBe(Steps.PENDING);
      expect(await validateTXHash(provider, pendingStep.value.txHash)).toBe(
        true
      );

      expect(doneStep.value.key).toBe(Steps.DONE);
      await advanceBlocks(provider, 5);
      const blockNumber = await provider.getBlockNumber();
      for (const user of randomUsers) {
        expect(
          await allowlistVoting.methods.isAllowed(user, blockNumber - 1)
        ).toBe(true);
      }
    });

    it("should return the correct user count", async () => {
      await advanceBlocks(provider, 5);
      let blockNumber = await provider.getBlockNumber();
      let count = await allowlistVoting.methods.allowedUserCount(
        blockNumber - 1
      );
      expect(count.toNumber()).toBe(1);

      await becomeRoot(
        allowlistVoting,
        daoAddr,
        allowlistVoting.pluginInstance.address,
        await signer.getAddress()
      );
      const randomUsers: string[] = [];
      randomUsers.push(Wallet.createRandom().address);
      randomUsers.push(Wallet.createRandom().address);
      randomUsers.push(Wallet.createRandom().address);
      const dao = getDAOInstance(daoAddr, signer);
      await dao.grant(
        allowlistVoting.pluginInstance.address,
        await signer.getAddress(),
        id("MODIFY_ALLOWLIST_PERMISSION")
      );

      const call = await allowlistVoting.methods.addAllowedUsers(randomUsers);
      await call.next();
      await call.next();

      await advanceBlocks(provider, 5);

      blockNumber = await provider.getBlockNumber();
      count = await allowlistVoting.methods.allowedUserCount(blockNumber - 1);
      expect(count.toNumber()).toBe(4);
    });

    it("should return the correct canExecute", async () => {
      const voteId = await createProposal(allowlistVoting);
      expect(await allowlistVoting.methods.canExecute(voteId)).toBe(true);
      const execute = await allowlistVoting.methods.execute(voteId);
      await execute.next();
      await execute.next();
      expect(await allowlistVoting.methods.canExecute(voteId)).toBe(false);
    });

    it("should return the correct canVote", async () => {
      const voteId = await createProposal(allowlistVoting);
      const signerAddress = await signer.getAddress();
      expect(await allowlistVoting.methods.canVote(voteId, signerAddress)).toBe(
        true
      );
      const execute = await allowlistVoting.methods.execute(voteId);
      await execute.next();
      await execute.next();
      expect(await allowlistVoting.methods.canVote(voteId, signerAddress)).toBe(
        false
      );
    });

    it("should create a proposal", async () => {
      const generator = allowlistVoting.methods.createProposal(
        "0x000001",
        [
          {
            data: "0x",
            to: daoAddr,
            value: 0,
          },
        ],
        0,
        Math.round(Date.now() / 1000) + 3600,
        false,
        1
      );

      for await (const step of generator) {
        switch (step.key) {
          case Steps.PENDING:
            expect(await validateTXHash(provider, step.txHash)).toBe(true);
            break;
          case Steps.DONE:
            expect(step.voteId).not.toBeNaN();
            expect(step.voteId).toBe(0);
            break;
        }
      }
    });

    it("should execute", async () => {
      const voteId = await createProposal(allowlistVoting);
      const generator = allowlistVoting.methods.execute(voteId);
      const pendingStep = await generator.next();
      const doneStep = await generator.next();

      expect(pendingStep.value.key).toBe(Steps.PENDING);
      expect(await validateTXHash(provider, pendingStep.value.txHash)).toBe(
        true
      );
      expect(doneStep.value.key).toBe(Steps.DONE);
    });

    it("should return the correct vote", async () => {
      const toAddr = Wallet.createRandom().address;
      const startDate = Date.now();
      const endDate = startDate + 3600;
      const voteId = await createProposal(
        allowlistVoting,
        toAddr,
        startDate,
        endDate
      );
      await advanceBlocks(provider, 2);
      const vote = await allowlistVoting.methods.getVote(voteId);
      expect(vote.id).toBe(voteId);
      expect(vote.open).toBe(false);
      expect(vote.executed).toBe(false);
      expect(vote.startDate.toString()).toBe(startDate.toString());
      expect(vote.endDate.toString()).toBe(endDate.toString());
      expect(vote.yes.toString()).toBe("0");
      expect(vote.no.toString()).toBe("0");
      expect(vote.abstain.toString()).toBe("0");
    });

    it("should allow to vote", async () => {
      await advanceBlocks(provider, 2);
      const voteId = await createProposal(allowlistVoting);

      const voterAddr = await signer.getAddress();
      let vote = await allowlistVoting.methods.getVoteOption(voteId, voterAddr);
      expect(vote).toBe(2);

      const voting = await allowlistVoting.methods.vote(voteId, 3, false);
      await voting.next();
      await voting.next();

      vote = await allowlistVoting.methods.getVoteOption(voteId, voterAddr);
      expect(vote).toBe(3);
    });

    it("should remove allowed Users", async () => {
      await advanceBlocks(provider, 5);
      await provider.getBlockNumber();
      await becomeRoot(
        allowlistVoting,
        daoAddr,
        allowlistVoting.pluginInstance.address,
        await signer.getAddress()
      );
      const randomUsers: string[] = [];
      randomUsers.push(Wallet.createRandom().address);
      randomUsers.push(Wallet.createRandom().address);
      randomUsers.push(Wallet.createRandom().address);
      const dao = getDAOInstance(daoAddr, signer);
      await dao.grant(
        allowlistVoting.pluginInstance.address,
        await signer.getAddress(),
        id("MODIFY_ALLOWLIST_PERMISSION")
      );

      const call = await allowlistVoting.methods.addAllowedUsers(randomUsers);
      await call.next();
      await call.next();

      await advanceBlocks(provider, 5);

      let blockNumber = await provider.getBlockNumber();

      expect(
        await allowlistVoting.methods.isAllowed(randomUsers[0], blockNumber - 1)
      ).toBe(true);

      const removeCall = await allowlistVoting.methods.removeAllowedUsers([
        randomUsers[0],
      ]);
      await removeCall.next();
      await removeCall.next();

      await advanceBlocks(provider, 5);

      blockNumber = await provider.getBlockNumber();

      expect(
        await allowlistVoting.methods.isAllowed(randomUsers[0], blockNumber - 1)
      ).toBe(false);
    });

    it("should change the configuration", async () => {
      await becomeRoot(
        allowlistVoting,
        daoAddr,
        allowlistVoting.pluginInstance.address,
        await signer.getAddress()
      );

      const dao = getDAOInstance(daoAddr, signer);
      await dao.grant(
        allowlistVoting.pluginInstance.address,
        await signer.getAddress(),
        id("SET_CONFIGURATION_PERMISSION")
      );

      const steps = await allowlistVoting.methods.setConfiguration(20, 30, 40);
      await steps.next();
      await steps.next();

      expect(
        (await allowlistVoting.methods.participationRequiredPct()).toNumber()
      ).toBe(20);
      expect(
        (await allowlistVoting.methods.supportRequiredPct()).toNumber()
      ).toBe(30);
      expect((await allowlistVoting.methods.minDuration()).toNumber()).toBe(40);
    });
  });
});

async function createProposal(
  allowlistVoting: AllowlistVoting,
  to: string = Wallet.createRandom().address,
  startDate: number = 0,
  endDate: number = 0
): Promise<number> {
  const generator = allowlistVoting.methods.createProposal(
    "0x00",
    [
      {
        data: "0x00",
        to,
        value: 0,
      },
    ],
    startDate,
    endDate,
    false,
    2
  );

  for await (const step of generator) {
    switch (step.key) {
      case Steps.DONE:
        return step.voteId;
    }
  }
  return 0;
}

async function becomeRoot(
  allowlistVoting: AllowlistVoting,
  daoAddr: string,
  where: string,
  who: string
): Promise<void> {
  const encodedGrant = getDAOInterface().encodeFunctionData("grant", [
    where,
    who,
    id("ROOT_PERMISSION"),
  ]);
  const voteGenerator = allowlistVoting.methods.createProposal(
    "0x00",
    [
      {
        to: daoAddr,
        data: encodedGrant,
        value: 0,
      },
    ],
    0,
    0,
    true,
    2
  );

  await voteGenerator.next();
  await voteGenerator.next();
}

async function validateTXHash(
  provider: Provider,
  txhash: string
): Promise<boolean> {
  const tx = await provider.getTransaction(txhash);
  return tx.hash === txhash;
}

function getDAOInstance(daoAddr: string, signer: Signer): DAO {
  return DAO__factory.connect(daoAddr, signer);
}

function getDAOInterface() {
  return DAO__factory.createInterface();
}

async function advanceBlocks(
  provider: JsonRpcProvider,
  amountOfBlocks: number
) {
  for (let i = 0; i < amountOfBlocks; i++) {
    await provider.send("evm_mine", []);
  }
}
