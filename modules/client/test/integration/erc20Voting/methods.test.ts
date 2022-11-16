import { DAO, DAO__factory } from "@aragon/core-contracts-ethers";
import { JsonRpcProvider, Provider } from "@ethersproject/providers";
import { Server } from "ganache";
import {
  createERC20DAO,
  deploy,
  Deployment,
} from "../../helpers/deployContracts";
import { start } from "../../helpers/ganache-setup";
import { ERC20Voting, Steps } from "../../../src/erc20Voting";
import { Signer } from "@ethersproject/abstract-signer";
import { Wallet } from "@ethersproject/wallet";
import { id } from "@ethersproject/hash";
import { arrayify } from "@ethersproject/bytes";
import { Context } from "../../../src/client-common";

describe("ERC20Voting", () => {
  describe("Methods", () => {
    let server: Server;
    let deployments: Deployment;
    let erc20Voting: ERC20Voting;
    let daoAddr: string;
    let signer: Signer;
    let provider: JsonRpcProvider;
    let pluginAddr: string;

    beforeAll(async () => {
      server = await start();
      deployments = await deploy();
    });

    beforeEach(async () => {
      provider = new JsonRpcProvider("http://127.0.0.1:8545");
      signer = provider.getSigner();

      let createDaoReturns = await createERC20DAO(
        deployments,
        Math.round(Math.random() * 2000).toString(16),
        [await signer.getAddress()]
      );

      pluginAddr = createDaoReturns.pluginAddrs[0];

      const context = new Context({
        daoFactoryAddress: deployments.daoFactory.address,
        web3Providers: [provider],
        signer: signer,
      });

      erc20Voting = new ERC20Voting(context);
      daoAddr = createDaoReturns.daoAddr;
    });

    afterAll(async () => {
      await server.close();
    });

    it("should return the correct canExecute", async () => {
      const proposalId = await createProposal(erc20Voting, pluginAddr);
      expect(await erc20Voting.methods.canExecute(pluginAddr, proposalId)).toBe(
        true
      );
      const execute = await erc20Voting.methods.execute(pluginAddr, proposalId);
      await execute.next();
      await execute.next();
      expect(await erc20Voting.methods.canExecute(pluginAddr, proposalId)).toBe(
        false
      );
    });

    it("should return the correct canVote", async () => {
      const proposalId = await createProposal(erc20Voting, pluginAddr);
      const signerAddress = await signer.getAddress();
      // helps to get stable test results
      await advanceBlocks(provider, 50);
      expect(
        await erc20Voting.methods.canVote(pluginAddr, proposalId, signerAddress)
      ).toBe(true);
      const execute = await erc20Voting.methods.execute(pluginAddr, proposalId);
      await execute.next();
      await execute.next();
      expect(
        await erc20Voting.methods.canVote(pluginAddr, proposalId, signerAddress)
      ).toBe(false);
    });

    it("should create a proposal", async () => {
      const generator = erc20Voting.methods.createProposal({
        pluginAddr,
        _proposalMetadata: arrayify("0x000001"),
        _actions: [
          {
            data: arrayify("0x"),
            to: daoAddr,
            value: BigInt(0),
          },
        ],
        _startDate: 0,
        _endDate: Math.round(Date.now() / 1000) + 3600,
        _executeIfDecided: false,
        _choice: 1,
      });

      for await (const step of generator) {
        switch (step.key) {
          case Steps.PENDING:
            expect(await validateTXHash(provider, step.txHash)).toBe(true);
            break;
          case Steps.DONE:
            expect(step.proposalId).not.toBeNaN();
            expect(step.proposalId).toBe(0);
            break;
        }
      }
    });

    it("should execute", async () => {
      const proposalId = await createProposal(erc20Voting, pluginAddr);
      const generator = erc20Voting.methods.execute(pluginAddr, proposalId);
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
      const proposalId = await createProposal(
        erc20Voting,
        pluginAddr,
        toAddr,
        startDate,
        endDate
      );
      await advanceBlocks(provider, 2);
      const proposal = await erc20Voting.methods.getProposal(
        pluginAddr,
        proposalId
      );
      expect(proposal.id).toBe(proposalId);
      expect(proposal.open).toBe(false);
      expect(proposal.executed).toBe(false);
      expect(proposal.startDate.toString()).toBe(startDate.toString());
      expect(proposal.endDate.toString()).toBe(endDate.toString());
      expect(proposal.yes.toString()).toBe("0");
      expect(proposal.no.toString()).toBe("0");
      expect(proposal.abstain.toString()).toBe("0");
    });

    it("should allow to vote", async () => {
      await advanceBlocks(provider, 2);
      const proposalId = await createProposal(erc20Voting, pluginAddr);

      const voterAddr = await signer.getAddress();
      let vote = await erc20Voting.methods.getVoteOption(
        pluginAddr,
        proposalId,
        voterAddr
      );
      expect(vote).toBe(2);

      // makes test more stable
      await advanceBlocks(provider, 10);
      const voting = await erc20Voting.methods.vote({
        pluginAddr,
        _proposalId: proposalId,
        _choice: 3,
        _executesIfDecided: false,
      });
      await voting.next();
      await voting.next();

      vote = await erc20Voting.methods.getVoteOption(
        pluginAddr,
        proposalId,
        voterAddr
      );
      expect(vote).toBe(3);
    });

    it("should change the configuration", async () => {
      await becomeRoot(
        erc20Voting,
        pluginAddr,
        daoAddr,
        pluginAddr,
        await signer.getAddress()
      );

      const dao = getDAOInstance(daoAddr, signer);
      await dao.grant(
        pluginAddr,
        await signer.getAddress(),
        id("SET_CONFIGURATION_PERMISSION")
      );

      const steps = await erc20Voting.methods.setConfiguration({
        pluginAddr,
        _participationRequiredPct: 20,
        _supportRequiredPct: 30,
        _minDuration: 40,
      });
      await steps.next();
      await steps.next();

      expect(
        await erc20Voting.methods.participationRequiredPct(pluginAddr)
      ).toBe(20);
      expect(await erc20Voting.methods.supportRequiredPct(pluginAddr)).toBe(30);
      expect(await erc20Voting.methods.minDuration(pluginAddr)).toBe(40);
    });
  });
});

async function createProposal(
  erc20Voting: ERC20Voting,
  pluginAddr: string,
  to: string = Wallet.createRandom().address,
  startDate: number = 0,
  endDate: number = 0
): Promise<number> {
  const generator = erc20Voting.methods.createProposal({
    pluginAddr,
    _proposalMetadata: arrayify("0x00"),
    _actions: [
      {
        data: arrayify("0x00"),
        to,
        value: BigInt(0),
      },
    ],
    _startDate: startDate,
    _endDate: endDate,
    _executeIfDecided: false,
    _choice: 2,
  });

  for await (const step of generator) {
    switch (step.key) {
      case Steps.DONE:
        return step.proposalId;
    }
  }
  return 0;
}

async function becomeRoot(
  erc20Voting: ERC20Voting,
  pluginAddr: string,
  daoAddr: string,
  where: string,
  who: string
): Promise<void> {
  const encodedGrant = getDAOInterface().encodeFunctionData("grant", [
    where,
    who,
    id("ROOT_PERMISSION"),
  ]);
  const voteGenerator = erc20Voting.methods.createProposal({
    pluginAddr,
    _proposalMetadata: arrayify("0x00"),
    _actions: [
      {
        to: daoAddr,
        data: arrayify(encodedGrant),
        value: BigInt(0),
      },
    ],
    _startDate: 0,
    _endDate: 0,
    _executeIfDecided: true,
    _choice: 2,
  });

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
