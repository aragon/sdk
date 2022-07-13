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
import { ContractFactory } from "@ethersproject/contracts";
// import { TestERC20__factory } from "@aragon/core-contracts-ethers";

// @ts-ignore  TODO: Remove this comment
const IPFS_API_KEY = process.env.IPFS_API_KEY ||
  Buffer.from(
    "YjQ3N1JoRUNmOHM4c2RNN1hya0xCczJ3SGM0a0NNd3BiY0ZDNTVLdCAg==",
    "base64",
  ).toString().trim();

const web3endpoints = {
  working: [
    "https://mainnet.infura.io/v3/94d2e8caf1bc4c4884af830d96f927ca",
    "https://cloudflare-eth.com/",
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
    test.todo("Should estimate gas fees for creating a DAO");
    // it("Should estimate gas fees for creating a DAO", async () => {
    //   const context = new Context(contextParamsLocalChain);
    //   const client = new Client(context);

    //   const daoCreationParams: ICreateParams = {
    //     daoConfig: {
    //       name: "ERC20VotingDAO_" + Math.floor(Math.random() * 9999) + 1,
    //       metadata: "0x1234",
    //     },
    //     plugins: [
    //       { id: "0x1234", data: "0x1234" },
    //     ],
    //     gsnForwarder: Wallet.createRandom().address,
    //   };

    //   const gasFeesEstimation = await client.estimation.create(
    //     daoCreationParams,
    //   );

    //   expect(typeof gasFeesEstimation).toEqual("object");
    //   expect(typeof gasFeesEstimation.average).toEqual("bigint");
    //   expect(typeof gasFeesEstimation.max).toEqual("bigint");
    //   expect(typeof gasFeesEstimation.max).toBeGreaterThan(BigInt(0));
    //   expect(gasFeesEstimation.max).toBeGreaterThan(gasFeesEstimation.average);
    // });

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
        daoAddress: "0x1234567890123456789012345678901234567890",
        amount: BigInt(1234),
      };

      expect(
        (await client.web3.getProvider().getBalance(depositParams.daoAddress))
          .toString(),
      ).toBe("0");

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

      expect(
        (await client.web3.getProvider().getBalance(depositParams.daoAddress))
          .toString(),
      ).toBe("1234");
    });

    test.todo("Should allow to deposit ERC20");

    it("Should allow to deposit ERC20", async () => {
      const context = new Context(contextParamsLocalChain);
      const client = new Client(context);

      // TODO: Deploy ERC20 + mint tokens
      const tokenContract = await deployErc20(client);

      const depositParams: IDepositParams = {
        daoAddress: "0x2345678901234567890123456789012345678901",
        amount: BigInt(5),
        tokenAddress: tokenContract.address,
        reference: "My reference",
      };

      expect(
        (await tokenContract.functions.balanceOf(depositParams.daoAddress))
          .toString(),
      ).toBe("0");

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

      expect(
        (await tokenContract.functions.balanceOf(depositParams.daoAddress))
          .toString(),
      ).toBe("5");
    });
  });
});

// HELPERS

async function deployErc20(client: Client) {
  const ercBytecode =
    "0x608060405234801561001057600080fd5b506040516103bc3803806103bc83398101604081905261002f9161007c565b60405181815233906000907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9060200160405180910390a333600090815260208190526040902055610094565b60006020828403121561008d578081fd5b5051919050565b610319806100a36000396000f3fe608060405234801561001057600080fd5b506004361061004c5760003560e01c8063313ce5671461005157806370a082311461006557806395d89b411461009c578063a9059cbb146100c5575b600080fd5b604051601281526020015b60405180910390f35b61008e610073366004610201565b6001600160a01b031660009081526020819052604090205490565b60405190815260200161005c565b604080518082018252600781526626bcaa37b5b2b760c91b6020820152905161005c919061024b565b6100d86100d3366004610222565b6100e8565b604051901515815260200161005c565b3360009081526020819052604081205482111561014b5760405162461bcd60e51b815260206004820152601a60248201527f696e73756666696369656e7420746f6b656e2062616c616e6365000000000000604482015260640160405180910390fd5b336000908152602081905260408120805484929061016a9084906102b6565b90915550506001600160a01b0383166000908152602081905260408120805484929061019790849061029e565b90915550506040518281526001600160a01b0384169033907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9060200160405180910390a350600192915050565b80356001600160a01b03811681146101fc57600080fd5b919050565b600060208284031215610212578081fd5b61021b826101e5565b9392505050565b60008060408385031215610234578081fd5b61023d836101e5565b946020939093013593505050565b6000602080835283518082850152825b818110156102775785810183015185820160400152820161025b565b818111156102885783604083870101525b50601f01601f1916929092016040019392505050565b600082198211156102b1576102b16102cd565b500190565b6000828210156102c8576102c86102cd565b500390565b634e487b7160e01b600052601160045260246000fdfea2646970667358221220d80384ce584e101c5b92e4ee9b7871262285070dbcd2d71f99601f0f4fcecd2364736f6c63430008040033";
  const erc20Abi = [
    "constructor(uint totalSupply)",
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)",
    "function transfer(address to, uint amount) returns (bool)",
    "event Transfer(address indexed from, address indexed to, uint amount)",
  ];

  const factory = new ContractFactory(
    erc20Abi,
    ercBytecode,
    client.web3.getConnectedSigner(),
  );

  // If your contract requires constructor args, you can specify them here
  const contract = await factory.deploy(100);
  return contract;
}
