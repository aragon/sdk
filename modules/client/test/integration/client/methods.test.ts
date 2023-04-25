// mocks need to be at the top of the imports
import { mockedIPFSClient } from "../../mocks/aragon-sdk-ipfs";
import * as mockedGraphqlRequest from "../../mocks/graphql-request";

import * as ganacheSetup from "../../helpers/ganache-setup";
import * as deployContracts from "../../helpers/deployContracts";
import {
  ADDRESS_ONE,
  ADDRESS_THREE,
  ADDRESS_TWO,
  contextParamsLocalChain,
  IPFS_CID,
  TEST_DAO_ADDRESS,
  TEST_INVALID_ADDRESS,
  TEST_MULTISIG_PROPOSAL_ID,
  TEST_NO_BALANCES_DAO_ADDRESS,
  TEST_NON_EXISTING_ADDRESS,
  TEST_TX_HASH,
  // TEST_WALLET,
} from "../constants";
import {
  AddresslistVotingClient,
  Client,
  Context,
  CreateDaoParams,
  DaoCreationSteps,
  DaoDepositSteps,
  DaoSortBy,
  DepositParams,
  IAddresslistVotingPluginInstall,
  IDaoQueryParams,
  IHasPermissionParams,
  ITransferQueryParams,
  Permissions,
  SortDirection,
  SupportedNetworksArray,
  TokenType,
  TransferSortBy,
  TransferType,
  UpdateAllowanceParams,
  VotingMode,
} from "../../../src";
import { MissingExecPermissionError } from "@aragon/sdk-common";
import { Server } from "ganache";
import {
  AssetBalanceSortBy,
  SubgraphBalance,
  SubgraphDao,
  SubgraphPluginTypeName,
  SubgraphTransferListItem,
  SubgraphTransferType,
} from "../../../src/interfaces";
import { QueryDao, QueryDaos } from "../../../src/internal/graphql-queries/dao";
import {
  QueryTokenBalances,
  QueryTokenTransfers,
} from "../../../src/internal/graphql-queries";
import { GraphQLClient } from "graphql-request";
import { AddressZero } from "@ethersproject/constants";
import { deployErc20 } from "../../helpers/deploy-erc20";

jest.spyOn(SupportedNetworksArray, "includes").mockReturnValue(true);
jest.spyOn(Context.prototype, "network", "get").mockReturnValue(
  { chainId: 5, name: "goerli" },
);
describe("Client", () => {
  let daoAddress: string;
  let deployment: deployContracts.Deployment;

  describe("Methods Module tests", () => {
    let server: Server;

    beforeAll(async () => {
      server = await ganacheSetup.start();
      deployment = await deployContracts.deploy();
      contextParamsLocalChain.daoFactoryAddress = deployment.daoFactory.address;
      contextParamsLocalChain.ensRegistryAddress =
        deployment.ensRegistry.address;
      const daoCreation = await deployContracts.createTokenVotingDAO(
        deployment,
        "test-tokenvoting-dao",
        VotingMode.STANDARD,
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

        const daoName = "AddresslistVoting DAO-" +
          Math.floor(Math.random() * 9999) + 1;
        // pin metadata
        const ipfsUri = await client.methods.pinMetadata({
          name: daoName,
          description: "this is a dao",
          avatar: "https://...",
          links: [],
        });
        const pluginParams: IAddresslistVotingPluginInstall = {
          votingSettings: {
            minDuration: 3600,
            minParticipation: 0.5,
            supportThreshold: 0.5,
          },
          addresses: [
            "0x1234567890123456789012345678901234567890",
            "0x0987654321098765432109876543210987654321",
          ],
        };

        const addresslistVotingPlugin = AddresslistVotingClient.encoding
          .getPluginInstallItem(pluginParams);
        addresslistVotingPlugin.id = deployment.addresslistVotingRepo.address;

        const daoCreationParams: CreateDaoParams = {
          metadataUri: ipfsUri,
          ensSubdomain: daoName.toLowerCase().replace(" ", "-"),
          plugins: [
            addresslistVotingPlugin,
          ],
        };

        for await (const step of client.methods.createDao(daoCreationParams)) {
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
        const context = new Context(contextParamsLocalChain);
        const client = new Client(context);

        const daoName = "AddresslistVoting DAO-" +
          Math.floor(Math.random() * 9999) + 1;

        const daoCreationParams: CreateDaoParams = {
          metadataUri: "ipfs://QmeJ4kRW21RRgjywi9ydvY44kfx71x2WbRq7ik5xh5zBZK",
          ensSubdomain: daoName.toLowerCase().replace(" ", "-"),
          plugins: [],
        };

        await expect(client.methods.createDao(daoCreationParams).next()).rejects
          .toMatchObject(new MissingExecPermissionError());
      });
    });

    describe("DAO deposit", () => {
      it("Should allow to deposit ERC20 (no prior allowance)", async () => {
        const context = new Context(contextParamsLocalChain);
        const client = new Client(context);

        const tokenContract = await deployErc20(client);
        const amount = BigInt("1000000000000000000");
        const depositParams: DepositParams = {
          type: TokenType.ERC20,
          daoAddressOrEns: daoAddress,
          amount,
          tokenAddress: tokenContract.address,
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
      it("Should ensure allowance for an ERC20 token", async () => {
        const context = new Context(contextParamsLocalChain);
        const client = new Client(context);
        const tokenContract = await deployErc20(client);
        const amount = BigInt("1000000000000000000");
        const updateAllowanceParams: UpdateAllowanceParams = {
          daoAddressOrEns: daoAddress,
          amount,
          tokenAddress: tokenContract.address,
        };

        for await (
          const step of client.methods.updateAllowance(updateAllowanceParams)
        ) {
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
            default:
              throw new Error(
                "Unexpected DAO ensure allowance step: " +
                  JSON.stringify(step, null, 2),
              );
          }
        }

        expect(
          (
            await tokenContract.functions.allowance(
              client.web3.getSigner()?.getAddress(),
              daoAddress,
            )
          ).toString(),
        ).toBe(amount.toString());
      });

      it("Should allow to deposit ERC20 (with existing allowance)", async () => {
        const context = new Context(contextParamsLocalChain);
        const client = new Client(context);

        const tokenContract = await deployErc20(client);

        const depositParams: DepositParams = {
          type: TokenType.ERC20,
          daoAddressOrEns: daoAddress,
          amount: BigInt(7),
          tokenAddress: tokenContract.address,
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
        const ctx = new Context(contextParamsLocalChain);
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

        const mockedClient = mockedGraphqlRequest.getMockedInstance(
          client.graphql.getClient(),
        );
        const subgraphDao: SubgraphDao = {
          createdAt: Math.round(Date.now() / 1000).toString(),
          id: TEST_DAO_ADDRESS,
          subdomain: "test",
          metadata: `ipfs://${IPFS_CID}`,
          plugins: [{
            id: ADDRESS_ONE,
            __typename: SubgraphPluginTypeName.MULTISIG,
          }],
        };
        mockedClient.request.mockResolvedValueOnce({
          dao: subgraphDao,
        });

        const dao = await client.methods.getDao(daoAddress);
        expect(dao!.address).toBe(subgraphDao.id);
        expect(dao!.ensDomain).toBe(`${subgraphDao.subdomain}.dao.eth`);
        expect(dao!.creationDate).toMatchObject(
          new Date(parseInt(subgraphDao.createdAt) * 1000),
        );

        expect(dao!.plugins.length).toBe(1);
        expect(dao!.plugins[0].instanceAddress).toBe(
          ADDRESS_ONE,
        );
        expect(dao!.plugins[0].id).toBe("multisig.plugin.dao.eth");
        expect(dao!.plugins[0].version).toBe("0.0.1");

        expect(dao!.metadata.name).toBe("Name");
        expect(dao!.metadata.description).toBe("Description");
        expect(dao!.metadata.links.length).toBe(0);
        expect(dao!.metadata.avatar).toBe(undefined);

        expect(mockedClient.request).toHaveBeenCalledWith(QueryDao, {
          address: daoAddress,
        });
      });
      it("Should get a DAO's metadata of an non existent dao and receive null", async () => {
        const ctx = new Context(contextParamsLocalChain);
        const client = new Client(ctx);
        const daoAddress = TEST_NON_EXISTING_ADDRESS;
        const mockedClient = mockedGraphqlRequest.getMockedInstance(
          client.graphql.getClient(),
        );
        mockedClient.request.mockResolvedValueOnce({ dao: null });

        const dao = await client.methods.getDao(daoAddress);
        expect(dao === null).toBe(true);
      });

      it("Should get a DAO's metadata of an invalid dao address and throw an error", async () => {
        const ctx = new Context(contextParamsLocalChain);
        const client = new Client(ctx);
        const daoAddress = TEST_INVALID_ADDRESS;
        await expect(() => client.methods.getDao(daoAddress)).rejects.toThrow();
      });

      it("Should retrieve a list of Metadata details of DAO's, based on the given search params", async () => {
        const context = new Context(contextParamsLocalChain);
        const client = new Client(context);
        const limit = 3;
        const params: IDaoQueryParams = {
          limit,
          skip: 0,
          direction: SortDirection.ASC,
          sortBy: DaoSortBy.SUBDOMAIN,
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
        const subgraphDao: SubgraphDao = {
          createdAt: Math.round(Date.now() / 1000).toString(),
          id: TEST_DAO_ADDRESS,
          subdomain: "test",
          metadata: `ipfs://${IPFS_CID}`,
          plugins: [{
            id: ADDRESS_ONE,
            __typename: SubgraphPluginTypeName.MULTISIG,
          }],
        };
        const mockedClient = mockedGraphqlRequest.getMockedInstance(
          client.graphql.getClient(),
        );
        mockedClient.request.mockResolvedValueOnce({
          daos: [subgraphDao],
        });

        const daos = await client.methods.getDaos(params);
        expect(daos.length).toBe(1);
        expect(daos[0].address).toBe(subgraphDao.id);
        expect(daos[0].ensDomain).toBe(`${subgraphDao.subdomain}.dao.eth`);

        expect(daos[0].plugins.length).toBe(1);
        expect(daos[0].plugins[0].instanceAddress).toBe(
          ADDRESS_ONE,
        );
        expect(daos[0].plugins[0].id).toBe("multisig.plugin.dao.eth");
        expect(daos[0].plugins[0].version).toBe("0.0.1");

        expect(daos[0].metadata.name).toBe("Name");
        expect(daos[0].metadata.description).toBe("Description");
        expect(daos[0].metadata.avatar).toBe(undefined);

        expect(mockedClient.request).toHaveBeenCalledWith(QueryDaos, {
          ...params,
        });

        mockedIPFSClient.cat.mockImplementation(defaultImplementation);
      });

      it("Should get DAOs balances", async () => {
        const ctx = new Context(contextParamsLocalChain);
        const client = new Client(ctx);
        const daoAddress = TEST_DAO_ADDRESS;

        const mockedClient = mockedGraphqlRequest.getMockedInstance(
          client.graphql.getClient(),
        );
        const subgraphBalanceNative: SubgraphBalance = {
          __typename: "NativeBalance",
          token: {
            id: ADDRESS_ONE,
            name: "TestToken",
            symbol: "TST",
            decimals: 18,
          },
          balance: "50",
          lastUpdated: Math.round(Date.now() / 1000).toString(),
        };
        const subgraphBalanceERC20: SubgraphBalance = {
          __typename: "ERC20Balance",
          token: {
            id: ADDRESS_TWO,
            name: "TestToken",
            symbol: "TST",
            decimals: 18,
          },
          balance: "50",
          lastUpdated: Math.round(Date.now() / 1000).toString(),
        };
        const subgraphBalanceERC721: SubgraphBalance = {
          __typename: "ERC721Balance",
          token: {
            id: ADDRESS_THREE,
            name: "TestToken",
            symbol: "TST",
            decimals: 18,
          },
          balance: "50",
          lastUpdated: Math.round(Date.now() / 1000).toString(),
        };
        mockedClient.request.mockResolvedValueOnce({
          tokenBalances: [
            subgraphBalanceNative,
            subgraphBalanceERC721,
            subgraphBalanceERC20,
          ],
        });

        const balances = await client.methods.getDaoBalances({
          daoAddressOrEns: daoAddress,
        });
        expect(balances!.length).toBe(3);
        if (balances && balances.length > 0) {
          expect(balances[0].type).toBe(TokenType.NATIVE);
          if (balances[0].type === TokenType.NATIVE) {
            expect(balances[0].balance).toBe(
              BigInt(subgraphBalanceNative.balance),
            );
            expect(balances[0].updateDate).toMatchObject(
              new Date(parseInt(subgraphBalanceNative.lastUpdated) * 1000),
            );
          }

          expect(balances[1].type).toBe(TokenType.ERC721);
          if (balances[1].type === TokenType.ERC721) {
            expect(balances[1].name).toBe(
              subgraphBalanceERC721.token.name,
            );
            expect(balances[1].symbol).toBe(
              subgraphBalanceERC721.token.symbol,
            );
            expect(balances[1].address).toBe(
              subgraphBalanceERC721.token.id,
            );
            expect(balances[1].updateDate).toMatchObject(
              new Date(parseInt(subgraphBalanceERC721.lastUpdated) * 1000),
            );
          }

          expect(balances[2].type).toBe(TokenType.ERC20);
          if (balances[2].type === TokenType.ERC20) {
            expect(balances[2].name).toBe(
              subgraphBalanceERC20.token.name,
            );
            expect(balances[2].symbol).toBe(
              subgraphBalanceERC20.token.symbol,
            );
            expect(balances[2].address).toBe(
              subgraphBalanceERC20.token.id,
            );
            expect(balances[2].decimals).toBe(
              subgraphBalanceERC20.token.decimals,
            );
            expect(balances[2].balance).toBe(
              BigInt(subgraphBalanceERC20.balance),
            );
            expect(balances[2].updateDate).toMatchObject(
              new Date(parseInt(subgraphBalanceERC20.lastUpdated) * 1000),
            );
          }
        }

        expect(mockedClient.request).toHaveBeenCalledWith(QueryTokenBalances, {
          limit: 10,
          skip: 0,
          direction: SortDirection.ASC,
          sortBy: AssetBalanceSortBy.LAST_UPDATED,
          where: {
            dao: daoAddress,
          },
        });
      });
      it("Should get DAOs balances from a dao with no balances", async () => {
        const ctx = new Context(contextParamsLocalChain);
        const client = new Client(ctx);
        const daoAddress = TEST_NO_BALANCES_DAO_ADDRESS;
        const mockedClient = mockedGraphqlRequest.getMockedInstance(
          client.graphql.getClient(),
        );
        mockedClient.request.mockResolvedValueOnce({ tokenBalances: [] });
        const balances = await client.methods.getDaoBalances({
          daoAddressOrEns: daoAddress,
        });
        expect(Array.isArray(balances)).toBe(true);
        expect(balances?.length).toBe(0);
      });

      describe("Should get the transfers of a dao", () => {
        let client: Client,
          mockedClient: jest.Mocked<GraphQLClient>,
          params: ITransferQueryParams,
          ctx: Context;
        beforeAll(() => {
          contextParamsLocalChain.ensRegistryAddress =
            deployment.ensRegistry.address;
          ctx = new Context(contextParamsLocalChain);
          params = {
            daoAddressOrEns: TEST_DAO_ADDRESS,
            sortBy: TransferSortBy.CREATED_AT,
            limit: 10,
            skip: 0,
            direction: SortDirection.ASC,
          };
        });

        beforeEach(() => {
          client = new Client(ctx);
          mockedClient = mockedGraphqlRequest.getMockedInstance(
            client.graphql.getClient(),
          );
        });

        it("should call request correctly", async () => {
          mockedClient.request.mockResolvedValueOnce({ tokenTransfers: [] });
          await client.methods.getDaoTransfers(params);
          expect(mockedClient.request).toHaveBeenCalledWith(
            QueryTokenTransfers,
            {
              sortBy: params.sortBy,
              limit: params.limit,
              skip: params.skip,
              direction: params.direction,
              where: {
                dao: params.daoAddressOrEns,
              },
            },
          );
        });

        it("deposit native transfer", async () => {
          const subgraphTransfer: SubgraphTransferListItem = {
            __typename: "NativeTransfer",
            type: SubgraphTransferType.DEPOSIT,
            amount: "50",
            createdAt: Math.round(Date.now() / 1000).toString(),
            txHash: TEST_TX_HASH,
            from: ADDRESS_ONE,
            to: ADDRESS_TWO,
            proposal: {
              id: TEST_MULTISIG_PROPOSAL_ID,
            },
            token: {
              id: AddressZero,
              name: "TestToken",
              symbol: "TST",
              decimals: 18,
            },
          };
          mockedClient.request.mockResolvedValueOnce({
            tokenTransfers: [subgraphTransfer],
          });

          const transfers = await client.methods.getDaoTransfers(params);
          expect(transfers?.length).toBe(1);
          if (transfers && transfers.length > 0) {
            const transfer = transfers[0];
            expect(transfer.type).toBe(TransferType.DEPOSIT);
            expect(transfer.tokenType).toBe(TokenType.NATIVE);
            if (
              transfer.type === TransferType.DEPOSIT &&
              transfer.tokenType === TokenType.NATIVE
            ) {
              expect(transfer.amount).toBe(BigInt(subgraphTransfer.amount));
              expect(transfer.creationDate).toMatchObject(
                new Date(parseInt(subgraphTransfer.createdAt) * 1000),
              );
              expect(transfer.transactionId).toBe(subgraphTransfer.txHash);
              expect(transfer.from).toBe(subgraphTransfer.from);
              expect(transfer.to).toBe(subgraphTransfer.to);
            }
          }
        });

        it("deposit erc721 transfer", async () => {
          const subgraphTransfer: SubgraphTransferListItem = {
            __typename: "ERC721Transfer",
            type: SubgraphTransferType.DEPOSIT,
            amount: "50",
            createdAt: Math.round(Date.now() / 1000).toString(),
            txHash: TEST_TX_HASH,
            from: ADDRESS_ONE,
            to: ADDRESS_TWO,
            proposal: {
              id: TEST_MULTISIG_PROPOSAL_ID,
            },
            token: {
              id: AddressZero,
              name: "TestToken",
              symbol: "TST",
              decimals: 18,
            },
          };
          mockedClient.request.mockResolvedValueOnce({
            tokenTransfers: [subgraphTransfer],
          });

          const transfers = await client.methods.getDaoTransfers(params);
          expect(transfers?.length).toBe(1);
          if (transfers && transfers.length > 0) {
            const transfer = transfers[0];
            expect(transfer.type).toBe(TransferType.DEPOSIT);
            expect(transfer.tokenType).toBe(TokenType.ERC721);
            if (
              transfer.type === TransferType.DEPOSIT &&
              transfer.tokenType === TokenType.ERC721
            ) {
              expect(transfer.creationDate).toMatchObject(
                new Date(parseInt(subgraphTransfer.createdAt) * 1000),
              );
              expect(transfer.transactionId).toBe(subgraphTransfer.txHash);
              expect(transfer.from).toBe(subgraphTransfer.from);
              expect(transfer.to).toBe(subgraphTransfer.to);
              expect(transfer.token.address).toBe(subgraphTransfer.token.id);
              expect(transfer.token.name).toBe(subgraphTransfer.token.name);
              expect(transfer.token.symbol).toBe(subgraphTransfer.token.symbol);
            }
          }
        });

        it("deposit erc20 transfer", async () => {
          const subgraphTransfer: SubgraphTransferListItem = {
            __typename: "ERC20Transfer",
            type: SubgraphTransferType.DEPOSIT,
            amount: "50",
            createdAt: Math.round(Date.now() / 1000).toString(),
            txHash: TEST_TX_HASH,
            from: ADDRESS_ONE,
            to: ADDRESS_TWO,
            proposal: {
              id: TEST_MULTISIG_PROPOSAL_ID,
            },
            token: {
              id: AddressZero,
              name: "TestToken",
              symbol: "TST",
              decimals: 18,
            },
          };
          mockedClient.request.mockResolvedValueOnce({
            tokenTransfers: [subgraphTransfer],
          });

          const transfers = await client.methods.getDaoTransfers(params);
          expect(transfers?.length).toBe(1);
          if (transfers && transfers.length > 0) {
            const transfer = transfers[0];
            expect(transfer.type).toBe(TransferType.DEPOSIT);
            expect(transfer.tokenType).toBe(TokenType.ERC20);
            if (
              transfer.type === TransferType.DEPOSIT &&
              transfer.tokenType === TokenType.ERC20
            ) {
              expect(transfer.creationDate).toMatchObject(
                new Date(parseInt(subgraphTransfer.createdAt) * 1000),
              );
              expect(transfer.transactionId).toBe(subgraphTransfer.txHash);
              expect(transfer.from).toBe(subgraphTransfer.from);
              expect(transfer.to).toBe(subgraphTransfer.to);
              expect(transfer.token.address).toBe(subgraphTransfer.token.id);
              expect(transfer.token.name).toBe(subgraphTransfer.token.name);
              expect(transfer.token.symbol).toBe(subgraphTransfer.token.symbol);
              expect(transfer.amount).toBe(BigInt(subgraphTransfer.amount));
            }
          }
        });
        it("withdraw native transfer", async () => {
          const subgraphTransfer: SubgraphTransferListItem = {
            __typename: "NativeTransfer",
            type: SubgraphTransferType.WITHDRAW,
            amount: "50",
            createdAt: Math.round(Date.now() / 1000).toString(),
            txHash: TEST_TX_HASH,
            from: ADDRESS_ONE,
            to: ADDRESS_TWO,
            proposal: {
              id: TEST_MULTISIG_PROPOSAL_ID,
            },
            token: {
              id: AddressZero,
              name: "TestToken",
              symbol: "TST",
              decimals: 18,
            },
          };
          mockedClient.request.mockResolvedValueOnce({
            tokenTransfers: [subgraphTransfer],
          });

          const transfers = await client.methods.getDaoTransfers(params);
          expect(transfers?.length).toBe(1);
          if (transfers && transfers.length > 0) {
            const transfer = transfers[0];
            expect(transfer.type).toBe(TransferType.WITHDRAW);
            expect(transfer.tokenType).toBe(TokenType.NATIVE);
            if (
              transfer.type === TransferType.WITHDRAW &&
              transfer.tokenType === TokenType.NATIVE
            ) {
              expect(transfer.amount).toBe(BigInt(subgraphTransfer.amount));
              expect(transfer.creationDate).toMatchObject(
                new Date(parseInt(subgraphTransfer.createdAt) * 1000),
              );
              expect(transfer.transactionId).toBe(subgraphTransfer.txHash);
              expect(transfer.from).toBe(subgraphTransfer.from);
              expect(transfer.to).toBe(subgraphTransfer.to);
              expect(transfer.proposalId).toBe(subgraphTransfer.proposal.id);
            }
          }
        });

        it("withdraw erc721 transfer", async () => {
          const subgraphTransfer: SubgraphTransferListItem = {
            __typename: "ERC721Transfer",
            type: SubgraphTransferType.WITHDRAW,
            amount: "50",
            createdAt: Math.round(Date.now() / 1000).toString(),
            txHash: TEST_TX_HASH,
            from: ADDRESS_ONE,
            to: ADDRESS_TWO,
            proposal: {
              id: TEST_MULTISIG_PROPOSAL_ID,
            },
            token: {
              id: AddressZero,
              name: "TestToken",
              symbol: "TST",
              decimals: 18,
            },
          };
          mockedClient.request.mockResolvedValueOnce({
            tokenTransfers: [subgraphTransfer],
          });

          const transfers = await client.methods.getDaoTransfers(params);
          expect(transfers?.length).toBe(1);
          if (transfers && transfers.length > 0) {
            const transfer = transfers[0];
            expect(transfer.type).toBe(TransferType.WITHDRAW);
            expect(transfer.tokenType).toBe(TokenType.ERC721);
            if (
              transfer.type === TransferType.WITHDRAW &&
              transfer.tokenType === TokenType.ERC721
            ) {
              expect(transfer.creationDate).toMatchObject(
                new Date(parseInt(subgraphTransfer.createdAt) * 1000),
              );
              expect(transfer.transactionId).toBe(subgraphTransfer.txHash);
              expect(transfer.from).toBe(subgraphTransfer.from);
              expect(transfer.to).toBe(subgraphTransfer.to);
              expect(transfer.proposalId).toBe(subgraphTransfer.proposal.id);
              expect(transfer.token.address).toBe(subgraphTransfer.token.id);
              expect(transfer.token.name).toBe(subgraphTransfer.token.name);
              expect(transfer.token.symbol).toBe(subgraphTransfer.token.symbol);
            }
          }
        });

        it("withdraw erc20 transfer", async () => {
          const subgraphTransfer: SubgraphTransferListItem = {
            __typename: "ERC20Transfer",
            type: SubgraphTransferType.WITHDRAW,
            amount: "50",
            createdAt: Math.round(Date.now() / 1000).toString(),
            txHash: TEST_TX_HASH,
            from: ADDRESS_ONE,
            to: ADDRESS_TWO,
            proposal: {
              id: TEST_MULTISIG_PROPOSAL_ID,
            },
            token: {
              id: AddressZero,
              name: "TestToken",
              symbol: "TST",
              decimals: 18,
            },
          };
          mockedClient.request.mockResolvedValueOnce({
            tokenTransfers: [subgraphTransfer],
          });

          const transfers = await client.methods.getDaoTransfers(params);
          expect(transfers?.length).toBe(1);
          if (transfers && transfers.length > 0) {
            const transfer = transfers[0];
            expect(transfer.type).toBe(TransferType.WITHDRAW);
            expect(transfer.tokenType).toBe(TokenType.ERC20);
            if (
              transfer.type === TransferType.WITHDRAW &&
              transfer.tokenType === TokenType.ERC20
            ) {
              expect(transfer.creationDate).toMatchObject(
                new Date(parseInt(subgraphTransfer.createdAt) * 1000),
              );
              expect(transfer.transactionId).toBe(subgraphTransfer.txHash);
              expect(transfer.from).toBe(subgraphTransfer.from);
              expect(transfer.to).toBe(subgraphTransfer.to);
              expect(transfer.proposalId).toBe(subgraphTransfer.proposal.id);
              expect(transfer.token.address).toBe(subgraphTransfer.token.id);
              expect(transfer.token.name).toBe(subgraphTransfer.token.name);
              expect(transfer.token.symbol).toBe(subgraphTransfer.token.symbol);
              expect(transfer.amount).toBe(BigInt(subgraphTransfer.amount));
            }
          }
        });
      });

      test.todo(
        "Should return an empty array when getting the transfers of a DAO that does not exist",
      ); //, async () => {
      //   const ctx = new Context(contextParamsOkWithGraphqlTimeouts);
      //   const client = new Client(ctx)
      //   const res = await client.methods.getTransfers(contextParamsOkWithGraphqlTimeouts.dao)
      //   expect(res.length).toBe(0)
      // })
      test.todo("Should fail if the given ENS is invalid"); // async () => {
      // const ctx = new Context(contextParamsOkWithGraphqlTimeouts);
      // const client = new Client(ctx)
      // // will fail when tested on local chain
      // await expect(client.methods.getTransfers("the.dao")).rejects.toThrow(
      //   "Invalid ENS name"
      // );
    });
  });
});
