// @ts-ignore
declare const describe, it, beforeAll, afterAll, expect, test, fail;

// mocks need to be at the top of the imports
import { mockedIPFSClient } from "../../mocks/aragon-sdk-ipfs";

import * as ganacheSetup from "../../helpers/ganache-setup";
import * as deployContracts from "../../helpers/deployContracts";
import {
  contextParams,
  contextParamsLocalChain,
  TEST_DAO_ADDRESS,
  TEST_INVALID_ADDRESS,
  TEST_NO_BALANCES_DAO_ADDRESS,
  TEST_NON_EXISTING_ADDRESS,
  // TEST_WALLET,
} from "../constants";
import {
  Client,
  Context,
  DaoCreationSteps,
  DaoDepositSteps,
  DaoSortBy,
  ICreateParams,
  IDaoQueryParams,
  IDepositParams,
  IHasPermissionParams,
  ITransferQueryParams,
  Permissions,
  SortDirection,
  TokenType,
  TransferSortBy,
  TransferType,
} from "../../../src";
import {
  InvalidAddressOrEnsError,
  MissingExecPermissionError,
  Random,
} from "@aragon/sdk-common";
import { ContractFactory } from "@ethersproject/contracts";
import { erc20ContractAbi } from "../../../src/internal/abi/erc20";
import { isAddress } from "@ethersproject/address";
import { Server } from "ganache";
import { toUtf8Bytes } from "@ethersproject/strings";
import { defaultAbiCoder } from "@ethersproject/abi";
import { PluginSetupProcessor__factory } from "@aragon/core-contracts-ethers";

describe("Client", () => {
  let daoAddress: string;
  let deployment: deployContracts.Deployment;

  describe("Methods Module tests", () => {
    let server: Server;

    beforeAll(async () => {
      server = await ganacheSetup.start();
      deployment = await deployContracts.deploy();
      contextParamsLocalChain.daoFactoryAddress = deployment.daoFactory.address;
      const daoCreation = await deployContracts.createAddresslistDAO(
        deployment,
        "testDAO",
      );
      daoAddress = daoCreation.daoAddr;
    });

    afterAll(async () => {
      await server.close();
    });

    describe("DAO Creation", () => {
      it("Should create a DAO locally", async () => {
        const context = new Context(contextParamsLocalChain);
        const client = new Client(context);

        const daoName = "TokenVotingDAO_" +
          Math.floor(Random.getFloat() * 9999) + 1;
        // pin metadata
        const ipfsUri = await client.methods.pinMetadata({
          name: daoName,
          description: "this is a dao",
          avatar: "https://...",
          links: [],
        });
        const fiftyPercent = BigInt(500000000000000000);
        const daoCreationParams: ICreateParams = {
          metadataUri: ipfsUri,
          ensSubdomain: daoName.toLowerCase().replace(" ", "-"),
          plugins: [
            {
              id: deployment.addressListRepo.address,
              data: toUtf8Bytes(
                defaultAbiCoder.encode(
                  ["tuple(uint8, uint64, uint64, uint64, uint256)", "address[]"],
                  [[0, fiftyPercent, fiftyPercent, 3600, 1], [
                    "0x1234567890123456789012345678901234567890",
                    "0x0987654321098765432109876543210987654321",
                  ]],
                ),
              ),
            },
          ],
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
                "Unexpected DAO creation step: " +
                  JSON.stringify(step, null, 2),
              );
          }
        }
      });

      it("should fail if no execute_permission is requested", async () => {
        const pluginSetupProcessorConnectSpy = jest.spyOn(
          PluginSetupProcessor__factory,
          "connect",
        );
        const prepareInstallationMock = jest.fn().mockResolvedValue({
          permissions: [],
        });
        // @ts-ignore Ignoring type to not mock the whole class
        pluginSetupProcessorConnectSpy.mockImplementation(() => ({
          callStatic: {
            prepareInstallation: prepareInstallationMock,
          },
        }));

        const context = new Context(contextParamsLocalChain);
        const client = new Client(context);

        const daoName = "TokenVotingDAO_" +
          Math.floor(Random.getFloat() * 9999) + 1;

        const daoCreationParams: ICreateParams = {
          metadataUri: "ipfs://QmeJ4kRW21RRgjywi9ydvY44kfx71x2WbRq7ik5xh5zBZK",
          ensSubdomain: daoName.toLowerCase().replace(" ", "-"),
          plugins: [
            {
              id: deployment.addressListRepo.address,
              data: toUtf8Bytes(
                defaultAbiCoder.encode(
                  ["uint64", "uint64", "uint64", "address[]"],
                  [1, 1, 1, []],
                ),
              ),
            },
          ],
        };

        await expect(client.methods.create(daoCreationParams).next()).rejects
          .toMatchObject(new MissingExecPermissionError());

        pluginSetupProcessorConnectSpy.mockReset();
      });
    });

    describe("DAO deposit", () => {
      it("Should allow to deposit ERC20 (no prior allowance)", async () => {
        const context = new Context(contextParamsLocalChain);
        const client = new Client(context);

        const tokenContract = await deployErc20(client);
        const amount = BigInt("1000000000000000000");
        const depositParams: IDepositParams = {
          daoAddressOrEns: daoAddress,
          amount,
          tokenAddress: tokenContract.address,
          reference: "My reference",
        };

        expect(
          (
            await tokenContract.functions.balanceOf(
              depositParams.daoAddressOrEns,
            )
          ).toString(),
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
              expect(step.allowance).toBe(amount);
              break;
            case DaoDepositSteps.DEPOSITING:
              expect(typeof step.txHash).toBe("string");
              expect(step.txHash).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
              break;
            case DaoDepositSteps.DONE:
              expect(typeof step.amount).toBe("bigint");
              expect(step.amount).toBe(amount);
              break;
            default:
              throw new Error(
                "Unexpected DAO deposit step: " + JSON.stringify(step, null, 2),
              );
          }
        }

        expect(
          (
            await tokenContract.functions.balanceOf(
              depositParams.daoAddressOrEns,
            )
          ).toString(),
        ).toBe(amount.toString());
      });

      it("Should allow to deposit ERC20 (with existing allowance)", async () => {
        const context = new Context(contextParamsLocalChain);
        const client = new Client(context);

        const tokenContract = await deployErc20(client);

        const depositParams: IDepositParams = {
          daoAddressOrEns: daoAddress,
          amount: BigInt(7),
          tokenAddress: tokenContract.address,
          reference: "My reference",
        };

        expect(
          (
            await tokenContract.functions.balanceOf(
              depositParams.daoAddressOrEns,
            )
          ).toString(),
        ).toBe("0");

        // Prior allowance
        expect(
          (
            await tokenContract.functions.allowance(
              await client.web3.getSigner()?.getAddress(),
              depositParams.daoAddressOrEns,
            )
          ).toString(),
        ).toBe("0");

        await tokenContract.functions
          .approve(depositParams.daoAddressOrEns, 10)
          .then((tx) => tx.wait());

        expect(
          (
            await tokenContract.functions.allowance(
              await client.web3.getSigner()?.getAddress(),
              depositParams.daoAddressOrEns,
            )
          ).toString(),
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
          (
            await tokenContract.functions.balanceOf(
              depositParams.daoAddressOrEns,
            )
          ).toString(),
        ).toBe("7");
      });

      it("Check if dao factory has register dao permission in the dao registry", async () => {
        const context = new Context(contextParamsLocalChain);
        const client = new Client(context);
        const params: IHasPermissionParams = {
          daoAddressOrEns: deployment.managingDaoAddress,
          who: deployment.daoFactory.address,
          where: deployment.daoRegistry.address,
          permission: Permissions.REGISTER_DAO_PERMISSION,
        };
        // this permission was granted on deployment
        // so it must be true
        const hasPermission = await client.methods.hasPermission(params);
        expect(hasPermission).toBe(true);
      });

      it("Check if an user has root permission in a dao", async () => {
        const context = new Context(contextParamsLocalChain);
        const client = new Client(context);
        const who = await contextParamsLocalChain.signer?.getAddress();
        const params: IHasPermissionParams = {
          daoAddressOrEns: daoAddress,
          who: who!,
          where: daoAddress,
          permission: Permissions.ROOT_PERMISSION,
        };

        const hasPermission = await client.methods.hasPermission(params);
        expect(hasPermission).toBe(false);
      });
    });

    describe("Data retrieval", () => {
      it("Should get a DAO's metadata with a specific address", async () => {
        const ctx = new Context(contextParams);
        const client = new Client(ctx);
        const daoAddress = TEST_DAO_ADDRESS;

        mockedIPFSClient.cat.mockResolvedValueOnce(
          Buffer.from(
            JSON.stringify({
              name: "Name",
              description: "Description",
              links: [],
            }),
          ),
        );

        const dao = await client.methods.getDao(daoAddress);
        expect(typeof dao).toBe("object");
        expect(dao === null).toBe(false);
        if (dao) {
          expect(dao.address).toBe(daoAddress);
          expect(typeof dao.address).toBe("string");
          expect(dao.address).toMatch(/^0x[A-Fa-f0-9]{40}$/i);
          expect(typeof dao.ensDomain).toBe("string");
          expect(Array.isArray(dao.plugins)).toBe(true);
          if (dao.plugins.length > 0) {
            for (const plugin of dao.plugins) {
              expect(typeof plugin.id).toBe("string");
              expect(typeof plugin.instanceAddress).toBe("string");
              expect(plugin.instanceAddress).toMatch(/^0x[A-Fa-f0-9]{40}$/i);
              expect(typeof plugin.version).toBe("string");
            }
          }
          expect(typeof dao.metadata.name).toBe("string");
          expect(typeof dao.metadata.description).toBe("string");
          expect(Array.isArray(dao.metadata.links)).toBe(true);
          if (dao.metadata.links.length > 0) {
            for (const link of dao.metadata.links) {
              expect(typeof link.name).toBe("string");
              expect(typeof link.url).toBe("string");
            }
          }
          if (dao.metadata.avatar) {
            expect(typeof dao.metadata.avatar).toBe("string");
          }
        }
      });
      it("Should get a DAO's metadata of an non existent dao and receive null", async () => {
        const ctx = new Context(contextParams);
        const client = new Client(ctx);
        const daoAddress = TEST_NON_EXISTING_ADDRESS;
        const dao = await client.methods.getDao(daoAddress);
        expect(dao === null).toBe(true);
      });

      it("Should get a DAO's metadata of an invalid dao address and throw an error", async () => {
        const ctx = new Context(contextParams);
        const client = new Client(ctx);
        const daoAddress = TEST_INVALID_ADDRESS;
        await expect(() => client.methods.getDao(daoAddress)).rejects.toThrow(
          new InvalidAddressOrEnsError(),
        );
      });

      it("Should retrieve a list of Metadata details of DAO's, based on the given search params", async () => {
        const context = new Context(contextParamsLocalChain);
        const client = new Client(context);
        const limit = 3;
        const params: IDaoQueryParams = {
          limit,
          skip: 0,
          direction: SortDirection.ASC,
          sortBy: DaoSortBy.NAME,
        };

        const defaultImplementation = mockedIPFSClient.cat
          .getMockImplementation();
        mockedIPFSClient.cat.mockResolvedValue(
          Buffer.from(
            JSON.stringify({
              name: "Name",
              description: "Description",
              links: [],
            }),
          ),
        );

        const daos = await client.methods.getDaos(params);
        expect(Array.isArray(daos)).toBe(true);
        expect(daos.length <= limit).toBe(true);
        for (let i = 0; i < daos.length; i++) {
          const dao = daos[i];
          expect(typeof dao.address).toBe("string");
          expect(dao.address).toMatch(/^0x[A-Fa-f0-9]{40}$/i);
          expect(typeof dao.ensDomain).toBe("string");
          expect(Array.isArray(dao.plugins)).toBe(true);
          for (let j = 0; j < dao.plugins.length; j++) {
            const plugin = dao.plugins[j];
            expect(typeof plugin.id).toBe("string");
            expect(typeof plugin.instanceAddress).toBe("string");
            expect(plugin.instanceAddress).toMatch(/^0x[A-Fa-f0-9]{40}$/i);
            expect(typeof plugin.version).toBe("string");
          }
          expect(typeof dao.metadata.name).toBe("string");
          if (dao.metadata.avatar) {
            expect(typeof dao.metadata.avatar).toBe("string");
          }
        }

        mockedIPFSClient.cat.mockImplementation(defaultImplementation);
      });

      it("Should get DAOs balances", async () => {
        const ctx = new Context(contextParams);
        const client = new Client(ctx);
        const daoAddress = TEST_DAO_ADDRESS;
        const balances = await client.methods.getBalances(daoAddress);
        expect(Array.isArray(balances)).toBe(true);
        expect(balances === null).toBe(false);
        if (balances) {
          expect(balances.length > 0).toBe(true);
          for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            expect(typeof balance.balance).toBe("bigint");
            expect(balance.updateDate instanceof Date).toBe(true);
            if (balance.type === "erc20") {
              expect(typeof balance.balance).toBe("bigint");
              expect(typeof balance.decimals).toBe("number");
              expect(typeof balance.address).toBe("string");
              expect(balance.address).toMatch(/^0x[A-Fa-f0-9]{40}$/i);
              expect(typeof balance.name).toBe("string");
              expect(typeof balance.symbol).toBe("string");
            }
          }
        }
      });
      it("Should get DAOs balances from a dao with no balances", async () => {
        const ctx = new Context(contextParams);
        const client = new Client(ctx);
        const daoAddress = TEST_NO_BALANCES_DAO_ADDRESS;
        const balances = await client.methods.getBalances(daoAddress);
        expect(Array.isArray(balances)).toBe(true);
        expect(balances?.length).toBe(0);
      });

      it("Should get the transfers of a dao", async () => {
        const ctx = new Context(contextParamsLocalChain);
        const client = new Client(ctx);
        const params: ITransferQueryParams = {
          daoAddressOrEns: TEST_DAO_ADDRESS,
          sortBy: TransferSortBy.CREATED_AT,
          limit: 10,
          skip: 0,
          direction: SortDirection.ASC,
        };
        const transfers = await client.methods.getTransfers(params);
        expect(Array.isArray(transfers)).toBe(true);
        if (transfers) {
          expect(transfers.length > 0).toBe(true);
          for (const transfer of transfers) {
            expect(transfer.amount).toBeGreaterThan(BigInt(0));
            expect(typeof transfer.amount).toBe("bigint");
            expect(transfer.creationDate).toBeInstanceOf(Date);
            expect(typeof transfer.reference).toBe("string");
            expect(transfer.transactionId).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
            if (transfer.tokenType === TokenType.NATIVE) {
              if (transfer.type === TransferType.DEPOSIT) {
                // ETH deposit
                expect(isAddress(transfer.from)).toBe(true);
              } else if (transfer.type === TransferType.WITHDRAW) {
                // ETH withdraw
                expect(isAddress(transfer.to)).toBe(true);
                expect(transfer.proposalId).toMatch(
                  /^0x[A-Fa-f0-9]{40}_0x[A-Fa-f0-9]{1,}$/i,
                );
              } else {
                fail("invalid transfer type");
              }
            } else if (transfer.tokenType === TokenType.ERC20) {
              expect(isAddress(transfer.token.address)).toBe(true);
              expect(typeof transfer.token.decimals).toBe("number");
              expect(typeof transfer.token.name).toBe("string");
              expect(typeof transfer.token.symbol).toBe("string");
              if (transfer.type === TransferType.DEPOSIT) {
                // ERC20 deposit
                expect(isAddress(transfer.from)).toBe(true);
              } else if (transfer.type === TransferType.WITHDRAW) {
                // ERC20 withdraw
                expect(isAddress(transfer.to)).toBe(true);
                expect(transfer.proposalId).toMatch(
                  /^0x[A-Fa-f0-9]{40}_0x[A-Fa-f0-9]{1,}$/i,
                );
              } else {
                fail("invalid transfer type");
              }
            } else {
              fail("invalid token type");
            }
          }
        } else {
          fail("no transfers");
        }
      });
      it("Should get the transfers filtered by type", async () => {
        const ctx = new Context(contextParamsLocalChain);
        const client = new Client(ctx);
        const transferType = TransferType.DEPOSIT;
        const params: ITransferQueryParams = {
          sortBy: TransferSortBy.CREATED_AT,
          limit: 10,
          skip: 0,
          direction: SortDirection.ASC,
          type: transferType,
        };
        const transfers = await client.methods.getTransfers(params);
        expect(Array.isArray(transfers)).toBe(true);
        if (transfers) {
          expect(transfers.length > 0).toBe(true);
          for (const transfer of transfers) {
            expect(transfer.type).toBe(transferType);
          }
        } else {
          fail("no transfers");
        }
      });

      test.todo(
        "Should return an empty array when getting the transfers of a DAO that does not exist",
      ); //, async () => {
      //   const ctx = new Context(contextParamsLocalChain);
      //   const client = new Client(ctx)
      //   const res = await client.methods.getTransfers(contextParamsLocalChain.dao)
      //   expect(res.length).toBe(0)
      // })
      test.todo("Should fail if the given ENS is invalid"); // async () => {
      // const ctx = new Context(contextParamsLocalChain);
      // const client = new Client(ctx)
      // // will fail when tested on local chain
      // await expect(client.methods.getTransfers("the.dao")).rejects.toThrow(
      //   "Invalid ENS name"
      // );
    });
  });
});
// HELPERS

export function deployErc20(client: Client) {
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
