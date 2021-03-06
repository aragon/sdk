// @ts-ignore
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
import { ContractFactory } from "@ethersproject/contracts";
import { erc20ContractAbi } from "../../src/internal/abi/erc20";
import { DAOFactory__factory, Registry__factory } from "@aragon/core-contracts-ethers";

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
  ipfsNodes: [
    {
      url: "https://testing-ipfs-0.aragon.network/api/v0",
      headers: {
        "X-API-KEY": IPFS_API_KEY || "",
      },
    },
  ],
  graphqlURLs: ["https://api.thegraph.com/subgraphs/name/aragon/aragon-zaragoza-rinkeby"]
};

const contextParamsLocalChain: ContextParams = {
  network: 31337,
  signer: new Wallet(TEST_WALLET),
  dao: "0x1234567890123456789012345678901234567890",
  daoFactoryAddress: "0xf8065dD2dAE72D4A8e74D8BB0c8252F3A9acE7f9",
  web3Providers: ["http://localhost:8545"],
  ipfsNodes: [
    {
      url: "http://localhost:5001",
    },
    {
      url: "http://localhost:5002",
    },
    {
      url: "http://localhost:5003",
    },
  ],
  graphqlURLs: ["https://api.thegraph.com/subgraphs/name/aragon/aragon-zaragoza-rinkeby"]
};

describe("Client", () => {
  beforeAll(async () => {
    const server = await ganacheSetup.start();
    const daoFactory = await deployContracts.deploy(server);
    contextParamsLocalChain.daoFactoryAddress = daoFactory.address;
    /* TODO: REMOVE ME */
    const daoAddress = await createLegacyDao(contextParamsLocalChain)
    contextParamsLocalChain.dao = daoAddress;
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
      expect(web3Status).toEqual(true);
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
              "Unexpected DAO creation step: " + JSON.stringify(step, null, 2),
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
        daoAddress: contextParamsLocalChain.dao,
        amount: BigInt(1234),
      };

      const provider = client.web3.getProvider();
      if (!provider) throw new Error("No provider");

      expect(
        (await provider.getBalance(depositParams.daoAddress))
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
              "Unexpected DAO deposit step: " + JSON.stringify(step, null, 2),
            );
        }
      }

      expect(
        (await provider.getBalance(depositParams.daoAddress))
          .toString(),
      ).toBe("1234");
    });

    it("Should allow to deposit ERC20 (no prior allowance)", async () => {
      const context = new Context(contextParamsLocalChain);
      const client = new Client(context);

      const tokenContract = await deployErc20(client);

      const depositParams: IDepositParams = {
        daoAddress: contextParamsLocalChain.dao,
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
          case DaoDepositSteps.UPDATING_ALLOWANCE:
            expect(typeof step.txHash).toBe("string");
            expect(step.txHash).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
            break;
          case DaoDepositSteps.UPDATED_ALLOWANCE:
            expect(typeof step.allowance).toBe("bigint");
            expect(step.allowance).toBe(BigInt(5));
            break;
          case DaoDepositSteps.DEPOSITING:
            expect(typeof step.txHash).toBe("string");
            expect(step.txHash).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
            break;
          case DaoDepositSteps.DONE:
            expect(typeof step.amount).toBe("bigint");
            expect(step.amount).toBe(BigInt(5));
            break;
          default:
            throw new Error(
              "Unexpected DAO deposit step: " + JSON.stringify(step, null, 2),
            );
        }
      }

      expect(
        (await tokenContract.functions.balanceOf(depositParams.daoAddress))
          .toString(),
      ).toBe("5");
    });

    it("Should allow to deposit ERC20 (with existing allowance)", async () => {
      const context = new Context(contextParamsLocalChain);
      const client = new Client(context);

      const tokenContract = await deployErc20(client);

      const depositParams: IDepositParams = {
        daoAddress: contextParamsLocalChain.dao,
        amount: BigInt(7),
        tokenAddress: tokenContract.address,
        reference: "My reference",
      };

      expect(
        (await tokenContract.functions.balanceOf(depositParams.daoAddress))
          .toString(),
      ).toBe("0");

      // Prior allowance
      expect(
        (await tokenContract.functions.allowance(
          await client.web3.getSigner()?.getAddress(),
          depositParams.daoAddress,
        )).toString(),
      ).toBe("0");

      await tokenContract.functions.approve(depositParams.daoAddress, 10)
        .then((tx) => tx.wait());

      expect(
        (await tokenContract.functions.allowance(
          await client.web3.getSigner()?.getAddress(),
          depositParams.daoAddress,
        )).toString(),
      ).toBe("10");

      // Deposit
      for await (const step of client.methods.deposit(depositParams)) {
        switch (step.key) {
          case DaoDepositSteps.CHECKED_ALLOWANCE:
            expect(typeof step.allowance).toBe("bigint");
            expect(step.allowance).toBe(BigInt(10));
            break;
          case DaoDepositSteps.DEPOSITING:
            expect(typeof step.txHash).toBe("string");
            expect(step.txHash).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
            break;
          case DaoDepositSteps.DONE:
            expect(typeof step.amount).toBe("bigint");
            expect(step.amount).toBe(BigInt(7));
            break;
          default:
            throw new Error(
              "Unexpected DAO deposit step: " + JSON.stringify(step, null, 2),
            );
        }
      }

      expect(
        (await tokenContract.functions.balanceOf(depositParams.daoAddress))
          .toString(),
      ).toBe("7");
    });
  });
  describe("GraphQL Client", () => {
    it("Should detect all invalid graphql endpoints", async () => {
      const ctx = new Context(
        {
          ...contextParamsLocalChain,
          graphqlURLs: [
            "https://the.wrong/url",
            "https://the.wrong/url",
            "https://the.wrong/url"
          ]
        });
      const client = new Client(ctx)
      const isUp = await client.graphql.isUp()
      expect(isUp).toBe(false);
      await expect(client.graphql.ensureOnline()).rejects.toThrow("No graphql nodes available")
    })
    it("Should create a valid graphql client", async () => {
      const ctx = new Context(
        {
          ...contextParamsLocalChain,
          graphqlURLs: [
            "https://the.wrong/url",
            "https://the.wrong/url",
            "https://api.thegraph.com/subgraphs/name/aragon/aragon-zaragoza-rinkeby",
            "https://the.wrong/url",
            "https://the.wrong/url",
            "https://the.wrong/url",
            "https://the.wrong/url",
            "https://the.wrong/url",
            "https://the.wrong/url"
          ]
        });
      const client = new Client(ctx)
      await client.graphql.ensureOnline()
      const isUp = await client.graphql.isUp()
      expect(isUp).toBe(true);
    })
    test.todo("Should get a DAO's metadata with a specific address")// , async () => {
    //   const ctx = new Context(contextParams);
    //   const client = new Client(ctx)
    //   client.methods.getMetadata(contextParams.dao)
    // })

    test.todo("Should get the transfers of a dao")// , async () => {
    //   const ctx = new Context(contextParamsLocalChain);
    //   const client = new Client(ctx)
    //   const daoAddress = '0x04d9a0f3f7cf5f9f1220775d48478adfacceff61'
    //   const res = await client.methods.getTransfers(daoAddress)
    //   expect(Array.isArray(res.deposits)).toBe(true)
    //   expect(Array.isArray(res.withdrawals)).toBe(true)
    // })
    test.todo("Should return an empty array when getting the transfers of a DAO that does not exist")//, async () => {
    //   const ctx = new Context(contextParamsLocalChain);
    //   const client = new Client(ctx)
    //   const res = await client.methods.getTransfers(contextParamsLocalChain.dao)
    //   expect(res.length).toBe(0)
    // })
    test.todo("Should fail if the given ENS is invalid")// async () => {
    // const ctx = new Context(contextParamsLocalChain);
    // const client = new Client(ctx)
    // // will fail when tested on local chain
    // await expect(client.methods.getTransfers("the.dao")).rejects.toThrow(
    //   "Invalid ENS name"
    // );
  })
});

// HELPERS

function deployErc20(client: Client) {
  const ercBytecode =
    "0x608060405234801561001057600080fd5b5068056bc75e2d63100000600160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208190555068056bc75e2d63100000600081905550610d828061007d6000396000f3fe608060405234801561001057600080fd5b50600436106100935760003560e01c8063313ce56711610066578063313ce5671461013457806370a082311461015257806395d89b4114610182578063a9059cbb146101a0578063dd62ed3e146101d057610093565b806306fdde0314610098578063095ea7b3146100b657806318160ddd146100e657806323b872dd14610104575b600080fd5b6100a0610200565b6040516100ad9190610ac1565b60405180910390f35b6100d060048036038101906100cb91906109ba565b610239565b6040516100dd9190610aa6565b60405180910390f35b6100ee61032b565b6040516100fb9190610b23565b60405180910390f35b61011e60048036038101906101199190610967565b610331565b60405161012b9190610aa6565b60405180910390f35b61013c610623565b6040516101499190610b3e565b60405180910390f35b61016c600480360381019061016791906108fa565b610628565b6040516101799190610b23565b60405180910390f35b61018a610671565b6040516101979190610ac1565b60405180910390f35b6101ba60048036038101906101b591906109ba565b6106aa565b6040516101c79190610aa6565b60405180910390f35b6101ea60048036038101906101e59190610927565b610849565b6040516101f79190610b23565b60405180910390f35b6040518060400160405280600581526020017f546f6b656e00000000000000000000000000000000000000000000000000000081525081565b600081600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508273ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925846040516103199190610b23565b60405180910390a36001905092915050565b60005481565b600081600260008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205410156103f2576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016103e990610ae3565b60405180910390fd5b81600160008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020541015610474576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161046b90610b03565b60405180910390fd5b81600160008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008282546104c39190610bcb565b9250508190555081600160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008282546105199190610b75565b9250508190555081600260008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008282546105ac9190610bcb565b925050819055508273ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef846040516106109190610b23565b60405180910390a3600190509392505050565b601281565b6000600160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050919050565b6040518060400160405280600381526020017f544f4b000000000000000000000000000000000000000000000000000000000081525081565b600081600160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054101561072e576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161072590610b03565b60405180910390fd5b81600160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825461077d9190610bcb565b9250508190555081600160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008282546107d39190610b75565b925050819055508273ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef846040516108379190610b23565b60405180910390a36001905092915050565b6000600260008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905092915050565b6000813590506108df81610d1e565b92915050565b6000813590506108f481610d35565b92915050565b6000602082840312156109105761090f610cb6565b5b600061091e848285016108d0565b91505092915050565b6000806040838503121561093e5761093d610cb6565b5b600061094c858286016108d0565b925050602061095d858286016108d0565b9150509250929050565b6000806000606084860312156109805761097f610cb6565b5b600061098e868287016108d0565b935050602061099f868287016108d0565b92505060406109b0868287016108e5565b9150509250925092565b600080604083850312156109d1576109d0610cb6565b5b60006109df858286016108d0565b92505060206109f0858286016108e5565b9150509250929050565b610a0381610c11565b82525050565b6000610a1482610b59565b610a1e8185610b64565b9350610a2e818560208601610c54565b610a3781610cbb565b840191505092915050565b6000610a4f601683610b64565b9150610a5a82610ccc565b602082019050919050565b6000610a72601483610b64565b9150610a7d82610cf5565b602082019050919050565b610a9181610c3d565b82525050565b610aa081610c47565b82525050565b6000602082019050610abb60008301846109fa565b92915050565b60006020820190508181036000830152610adb8184610a09565b905092915050565b60006020820190508181036000830152610afc81610a42565b9050919050565b60006020820190508181036000830152610b1c81610a65565b9050919050565b6000602082019050610b386000830184610a88565b92915050565b6000602082019050610b536000830184610a97565b92915050565b600081519050919050565b600082825260208201905092915050565b6000610b8082610c3d565b9150610b8b83610c3d565b9250827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff03821115610bc057610bbf610c87565b5b828201905092915050565b6000610bd682610c3d565b9150610be183610c3d565b925082821015610bf457610bf3610c87565b5b828203905092915050565b6000610c0a82610c1d565b9050919050565b60008115159050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000819050919050565b600060ff82169050919050565b60005b83811015610c72578082015181840152602081019050610c57565b83811115610c81576000848401525b50505050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b600080fd5b6000601f19601f8301169050919050565b7f496e73756666696369656e7420616c6c6f77616e636500000000000000000000600082015250565b7f496e73756666696369656e742062616c616e6365000000000000000000000000600082015250565b610d2781610bff565b8114610d3257600080fd5b50565b610d3e81610c3d565b8114610d4957600080fd5b5056fea26469706673582212205e600dc9189ad70cc4361b1af1ad82c2d22a08e0a2d00a9de6ce1c7f496787e664736f6c63430008070033";

  const factory = new ContractFactory(
    erc20ContractAbi,
    ercBytecode,
    client.web3.getConnectedSigner(),
  );

  // If your contract requires constructor args, you can specify them here
  return factory.deploy();
}

/* TODO: 
This code creates a dao with the legacy method
to be able to test the deposit, please remove
everything from here once the new dao creation works
*/
async function createLegacyDao(params: ContextParams) {
  if (!params.web3Providers) {
    throw new Error("A provider is needed");
  }
  if (!params.daoFactoryAddress) {
    throw new Error("A dao factory is needed");
  }
  const provider = useWeb3Providers(params.web3Providers, params.network)
  const signer = new Wallet(TEST_WALLET, provider[0])
  const daoFactoryInstance = DAOFactory__factory.connect(
    params.daoFactoryAddress,
    signer
  );

  const daoCreationParams: ICreateDaoERC20Voting = {
    daoConfig: {
      name: "ERC20VotingDAO_" + Math.floor(Math.random() * 9999) + 1,
      metadata: "0x1234",
    },
    tokenConfig: {
      addr: "0x0000000000000000000000000000000000000000",
      name:
        "TestToken" +
        (Math.random() + 1)
          .toString(36)
          .substring(4)
          .toUpperCase(),
      symbol:
        "TEST" +
        (Math.random() + 1)
          .toString(36)
          .substring(4)
          .toUpperCase(),
    },
    mintConfig: {
      receivers: [Wallet.createRandom().address, Wallet.createRandom().address],
      amounts: [BigInt(Math.floor(Math.random() * 9999) + 1), BigInt(Math.floor(Math.random() * 9999) + 1)]
    },
    votingConfig: {
      supportRequiredPct: Math.floor(Math.random() * 100) + 1,
      participationRequiredPct: Math.floor(Math.random() * 100) + 1,
      minDuration: Math.floor(Math.random() * 9999) + 1,
    },
    gsnForwarder: Wallet.createRandom().address,
  };
  const registryInstance = await daoFactoryInstance
    .registry()
    .then(registryAddress => {
      return Registry__factory.connect(registryAddress, provider[0]);
    });
  return daoFactoryInstance.newERC20VotingDAO(
    daoCreationParams.daoConfig,
    daoCreationParams.votingConfig,
    daoCreationParams.tokenConfig,
    daoCreationParams.mintConfig,
    daoCreationParams.gsnForwarder ? daoCreationParams.gsnForwarder : ""
  )
    .then(tx => tx.wait())
    .then((cr) => {
      const newDaoAddress = cr.events?.find(
        e => e.address === registryInstance.address
      )?.topics[1];
      if (!newDaoAddress)
        return Promise.reject(new Error("Could not create DAO"));

      return "0x" + newDaoAddress.slice(newDaoAddress.length - 40);
    })
}

interface ICreateDaoERC20Voting {
  daoConfig: DaoConfig;
  tokenConfig: TokenConfig;
  mintConfig: MintConfig;
  votingConfig: VotingConfig;
  gsnForwarder?: string;
}

interface DaoConfig {
  name: string;
  metadata: string;
}

interface TokenConfig {
  addr: string;
  name: string;
  symbol: string;
}

interface MintConfig {
  receivers: string[];
  amounts: bigint[];
}

interface VotingConfig {
  /** 0-100 as a percentage */
  supportRequiredPct: number;
  /** 0-100 as a percentage */
  participationRequiredPct: number;
  /** In seconds */
  minDuration: number;
}


function useWeb3Providers(
  endpoints: string | JsonRpcProvider | (string | JsonRpcProvider)[],
  network: Networkish,
): JsonRpcProvider[] {
  if (Array.isArray(endpoints)) {
    return endpoints.map((item) => {
      if (typeof item === "string") {
        const url = new URL(item);
        return new JsonRpcProvider(url.href, network);
      }
      return item;
    });
  } else if (typeof endpoints === "string") {
    const url = new URL(endpoints);
    return [new JsonRpcProvider(url.href, network)];
  } else {
    return [endpoints];
  }
}