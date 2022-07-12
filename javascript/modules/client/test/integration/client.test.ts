// @ts-ignore
declare const describe, it, beforeAll, afterAll, expect, test;

import { JsonRpcProvider } from "@ethersproject/providers";
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
// import { TestERC20__factory } from "@aragon/core-contracts-ethers";

// @ts-ignore  TODO: Remove this comment
const IPFS_API_KEY = process.env.IPFS_API_KEY ||
  Buffer.from(
    "YjQ3N1JoRUNmOHM4c2RNN1hya0xCczJ3SGM0a0NNd3BiY0ZDNTVLdCAg==",
    "base64",
  ).toString().trim();

const web3endpoints = {
  working: [
    "https://cloudflare-eth.com/",
    "https://mainnet.infura.io/v3/94d2e8caf1bc4c4884af830d96f927ca",
  ],
  failing: ["https://bad-url-gateway.io/"],
};

const TEST_WALLET =
  "0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e";

const contextParams: ContextParams = {
  network: "mainnet",
  signer: new Wallet(TEST_WALLET),
  dao: "0x1234567890123456789012345678901234567890",
  daoFactoryAddress: "0x0123456789012345678901234567890123456789",
  web3Providers: web3endpoints.working,
  // NOTE: Backing off ipfs-http-client until the UI framework supports it
  // ipfsNodes: [
  //   {
  //     url: "https://testing-ipfs-0.aragon.network",
  //     headers: {
  //       "X-API-KEY": IPFS_API_KEY || "",
  //     },
  //   },
  // ],
};

const contextParamsLocalChain: ContextParams = {
  network: 31337,
  signer: new Wallet(TEST_WALLET),
  dao: "0x1234567890123456789012345678901234567890",
  daoFactoryAddress: "0xf8065dD2dAE72D4A8e74D8BB0c8252F3A9acE7f9",
  web3Providers: ["http://localhost:8545"],
  // NOTE: Backing off ipfs-http-client until the UI framework supports it
  // ipfsNodes: [
  //   {
  //     url: "http:localhost:5001",
  //   },
  //   {
  //     url: "http:localhost:5002",
  //   },
  //   {
  //     url: "http:localhost:5003",
  //   },
  // ],
};

describe("Client", () => {
  beforeAll(async () => {
    const server = await ganacheSetup.start();
    const daoFactory = await deployContracts.deploy(server);
    contextParamsLocalChain.daoFactoryAddress = daoFactory.address;
  });

  afterAll(async () => {
    await ganacheSetup.stop();
  });

  describe("Client instances", () => {
    it("Should create a working client", async () => {
      const ctx = new Context(contextParams);
      const client = new Client(ctx);

      expect(client).toBeInstanceOf(Client);
      expect(client.web3.getProvider()).toBeInstanceOf(JsonRpcProvider);
      expect(client.web3.getConnectedSigner()).toBeInstanceOf(Wallet);

      const web3Status = await client.web3.isUp();
      expect(web3Status).toEqual(false);
    });
    it("Should create a failing client", async () => {
      contextParams.web3Providers = web3endpoints.failing;
      const context = new Context(contextParams);
      const client = new Client(context);

      expect(client).toBeInstanceOf(Client);
      expect(client.web3.getProvider()).toBeInstanceOf(JsonRpcProvider);
      expect(client.web3.getConnectedSigner()).toBeInstanceOf(Wallet);

      const web3Status = await client.web3.isUp();
      expect(web3Status).toEqual(false);
    });
    it("Should create a client, fail and shift to a working endpoint", async () => {
      contextParams.web3Providers = web3endpoints.failing.concat(
        web3endpoints.working,
      );
      const context = new Context(contextParams);
      const client = new Client(context);

      await client
        .web3.isUp()
        .then((isUp) => {
          expect(isUp).toEqual(false);
          client.web3.shiftProvider();

          return client.web3.isUp();
        })
        .then((isUp) => {
          expect(isUp).toEqual(true);
        });
    });
  });

  describe("DAO Creation", () => {
    it("Should estimate gas fees for creating a DAO", async () => {
      const context = new Context(contextParamsLocalChain);
      const client = new Client(context);

      const daoCreationParams: ICreateParams = {
        daoConfig: {
          name: "ERC20VotingDAO_" + Math.floor(Math.random() * 9999) + 1,
          metadata: "0x1234",
        },
        plugins: [
          { id: "0x1234", data: "0x1234" },
        ],
        gsnForwarder: Wallet.createRandom().address,
      };

      const gasFeesEstimation = await client.estimation.create(
        daoCreationParams,
      );

      expect(typeof gasFeesEstimation).toEqual("object");
      expect(typeof gasFeesEstimation.average).toEqual("bigint");
      expect(typeof gasFeesEstimation.max).toEqual("bigint");
      expect(gasFeesEstimation.max).toBeGreaterThan(gasFeesEstimation.average);
    });

    it("Should create a DAO locally", async () => {
      const context = new Context(contextParamsLocalChain);
      const client = new Client(context);

      const daoCreationParams: ICreateParams = {
        daoConfig: {
          name: "ERC20VotingDAO_" + Math.floor(Math.random() * 9999) + 1,
          metadata: "0x1234",
        },
        plugins: [
          { id: "0x1234", data: "0x1234" },
        ],
        gsnForwarder: Wallet.createRandom().address,
      };

      for await (const step of client.methods.create(daoCreationParams)) {
        switch (step.key) {
          case DaoCreationSteps.CREATING:
            expect(typeof step.txHash).toBe("string");
            expect(step.txHash).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
            break;
          case DaoCreationSteps.DONE:
            expect(typeof step.address).toBe("string");
            expect(step.address).toMatch(/^0x[A-Fa-f0-9]{40}$/i);
            break;
          default:
            throw new Error(
              "Unexpected DAO creation step: " + Object.keys(step).join(", "),
            );
        }
      }
    });
  });

  describe("DAO deposit", () => {
    it("Should allow to deposit Ether", async () => {
      const context = new Context(contextParamsLocalChain);
      const client = new Client(context);

      const depositParams: IDepositParams = {
        daoAddress: "0x1234",
        amount: BigInt(1234),
      };

      for await (const step of client.methods.deposit(depositParams)) {
        switch (step.key) {
          case DaoDepositSteps.DEPOSITING:
            expect(typeof step.txHash).toBe("string");
            expect(step.txHash).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
            break;
          case DaoDepositSteps.DONE:
            expect(typeof step.amount).toBe("bigint");
            expect(step.amount).toBe(BigInt(1234));
            break;
          default:
            throw new Error(
              "Unexpected DAO deposit step: " + Object.keys(step).join(", "),
            );
        }
      }
    });

    test.todo("Should allow to deposit ERC20");

    it("Should allow to deposit ERC20", async () => {
      const context = new Context(contextParamsLocalChain);
      const client = new Client(context);

      // TODO: Deploy ERC20 + mint tokens

      const depositParams: IDepositParams = {
        daoAddress: "0x1234",
        amount: BigInt(1234),
        tokenAddress: "0x2345",
        reference: "My reference",
      };

      for await (const step of client.methods.deposit(depositParams)) {
        switch (step.key) {
          case DaoDepositSteps.CHECKED_ALLOWANCE:
            expect(typeof step.allowance).toBe("bigint");
            expect(step.allowance).toBe(BigInt(0));
            break;
          case DaoDepositSteps.INCREASING_ALLOWANCE:
            expect(typeof step.txHash).toBe("string");
            expect(step.txHash).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
            break;
          case DaoDepositSteps.INCREASED_ALLOWANCE:
            expect(typeof step.allowance).toBe("biting");
            expect(step.allowance).toBe(BigInt(1234));
            break;
          case DaoDepositSteps.DEPOSITING:
            expect(typeof step.txHash).toBe("string");
            expect(step.txHash).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
            break;
          case DaoDepositSteps.DONE:
            expect(typeof step.amount).toBe("bigint");
            expect(step.amount).toBe(BigInt(1234));
            break;
          default:
            throw new Error(
              "Unexpected DAO deposit step: " + Object.keys(step).join(", "),
            );
        }
      }
    });
  });
});
