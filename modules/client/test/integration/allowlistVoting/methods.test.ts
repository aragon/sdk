import { DAO, DAO__factory } from "@aragon/core-contracts-ethers";
import { JsonRpcProvider, Provider } from "@ethersproject/providers";
import { ethers, Signer, Wallet } from "ethers";
import { Server } from "ganache";
import {
  createAllowlistDAO,
  deploy,
  Deployment,
} from "../../../../../helpers/deployContracts";
import { start } from "../../../../../helpers/ganache-setup";
import {
  AllowlistVoting,
  AllowlistVotingContextPlugin,
  Steps,
} from "../../../src/allowlistVoting";
import { ClientEncoding } from "../../../src/internal/client/encoding";

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
      provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
      signer = provider.getSigner();

      let creatDaoReturns = await createAllowlistDAO(
        deployments,
        Math.round(Math.random() * 2000).toString(16),
        [await signer.getAddress()]
      );
      const context = new AllowlistVotingContextPlugin({
        pluginAddress: creatDaoReturns.pluginAddrs[0],
        daoFactoryAddress: deployments.daoFactory.address,
        web3Providers: [provider],
        signer: signer,
      });

      allowlistVoting = new AllowlistVoting(context);
      daoAddr = creatDaoReturns.daoAddr;
    });

    afterAll(async () => {
      await server.close();
    });

    it("should add users", async () => {
      await becomeDAORoot(allowlistVoting, daoAddr, await signer.getAddress());
      const randomUsers: string[] = [];
      randomUsers.push(Wallet.createRandom().address);
      randomUsers.push(Wallet.createRandom().address);
      randomUsers.push(Wallet.createRandom().address);
      const dao = getDAOInstance(daoAddr, signer);
      await dao.grant(
        allowlistVoting.pluginInstance.address,
        await signer.getAddress(),
        ethers.utils.id("MODIFY_ALLOWLIST_PERMISSION")
      );

      const call = await allowlistVoting.methods.addAllowedUsers(randomUsers);
      const pendingStep = await call.next();
      const doneStep = await call.next();

      expect(pendingStep.value.key).toBe(Steps.PENDING);
      expect(await validateTXHash(provider, pendingStep.value.txHash)).toBe(
        true
      );

      expect(doneStep.value.key).toBe(Steps.DONE);

      for (const user of randomUsers) {
        expect(await allowlistVoting.methods.isAllowed(user, 2555)).toBe(true);
      }
    });

    it("should create a vote", async () => {
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
      const voteId = await createVote(allowlistVoting, daoAddr);
      const generator = allowlistVoting.methods.execute(voteId);
      const pendingStep = await generator.next();
      const doneStep = await generator.next();

      expect(pendingStep.value.key).toBe(Steps.PENDING);
      expect(await validateTXHash(provider, pendingStep.value.txHash)).toBe(
        true
      );
      expect(doneStep.value.key).toBe(Steps.DONE);
    });
  });
});

async function createVote(
  allowlistVoting: AllowlistVoting,
  daoAddr: string
): Promise<number> {
  const generator = allowlistVoting.methods.createVote(
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
      case Steps.DONE:
        return step.voteId;
    }
  }
  return 0;
}

async function becomeDAORoot(
  allowlistVoting: AllowlistVoting,
  daoAddr: string,
  who: string
): Promise<void> {
  const encodedGrant = ClientEncoding.grantAction(daoAddr, {
    permission: ethers.utils.id("ROOT_PERMISSION"),
    where: daoAddr,
    who,
  });
  const voteGenerator = allowlistVoting.methods.createVote(
    "0x00",
    [
      {
        to: daoAddr,
        data: encodedGrant.data || "",
        value: encodedGrant.value || 0,
      },
    ],
    0,
    Math.round(Date.now() / 1000) + 3600,
    true,
    1
  );

  await voteGenerator.next();
  const value = await voteGenerator.next();
  console.log(value.value.voteId)
  console.log(await allowlistVoting.methods.getVote(value.value.voteId));
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
