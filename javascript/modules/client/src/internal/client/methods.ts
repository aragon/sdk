import {
  DAO__factory,
  DAOFactory__factory,
} from "@aragon/core-contracts-ethers";
import {
  GraphQLError,
  InvalidAddressOrEnsError,
  NoProviderError,
} from "@aragon/sdk-common";
import { Signer } from "@ethersproject/abstract-signer";
import { BigNumber } from "@ethersproject/bignumber";
import { AddressZero } from "@ethersproject/constants";
import { Contract, ContractTransaction } from "@ethersproject/contracts";
import { ContractReceipt } from "ethers";
import { erc20ContractAbi } from "../abi/erc20";
import {
  QueryBalances,
  QueryDao,
  QueryDaos,
  QueryTransfers,
} from "../graphql-queries";
import {
  AssetBalance,
  DaoCreationSteps,
  DaoCreationStepValue,
  DaoDepositSteps,
  DaoDepositStepValue,
  DaoDetails,
  DaoListItem,
  DaoSortBy,
  IClientMethods,
  ICreateParams,
  IDaoQueryParams,
  IDepositParams,
  ITransferQueryParams,
  SubgraphBalance,
  SubgraphDao,
  SubgraphDaoListItem,
  SubgraphTransferListItem,
  SubgraphTransferTypeMap,
  Transfer,
  TransferSortBy,
} from "../interfaces";
import {
  ClientCore,
  Context,
  DaoRole,
  delay,
  SortDirection,
} from "../../client-common";
import {
  toAssetBalance,
  toDaoDetails,
  toDaoListItem,
  toTransfer,
  unwrapDepositParams,
} from "../utils";
import { isAddress } from "@ethersproject/address";

export class ClientMethods extends ClientCore implements IClientMethods {
  constructor(context: Context) {
    super(context);
  }
  /**
   * Creates a DAO with the given settings and plugins
   *
   * @param {ICreateParams} params
   * @return {*}  {AsyncGenerator<DaoCreationStepValue>}
   * @memberof ClientMethods
   */
  public async *create(
    params: ICreateParams,
  ): AsyncGenerator<DaoCreationStepValue> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new Error("A signer is needed");
    } else if (!signer.provider) {
      throw new Error("A web3 provider is needed");
    }

    const daoFactoryInstance = DAOFactory__factory.connect(
      this.web3.getDaoFactoryAddress(),
      signer,
    );

    // @ts-ignore
    let cid = "";
    try {
      cid = await this.ipfs.add(JSON.stringify(params.metadata));
    } catch {
      throw new Error("Could not pin the metadata on IPFS");
    }

    // @ts-ignore  TODO: Remove this comment when used
    const registryAddress = await daoFactoryInstance.registry();

    // TODO: Remove mock result
    await delay(1000);
    yield {
      key: DaoCreationSteps.CREATING,
      txHash:
        "0x1298376517236498176239851762938512359817623985761239486128937461",
    };

    await delay(3000);
    yield {
      key: DaoCreationSteps.DONE,
      address: "0x6592568247592378465987126349817263958713",
    };

    // TODO: Uncomment when the new DAO factory is available

    /**
    // TODO: Use the new factory method
    const tx = await daoFactoryInstance.createDao(
      ...unwrapCreateDaoParams(params)
    );

    yield {
      key: DaoCreationSteps.CREATING,
      txHash: tx.hash,
    };
    const receipt = await tx.wait();
    const newDaoAddress = receipt.events?.find(
      e => e.address === registryAddress
    )?.topics[1];
    if (!newDaoAddress) {
      return Promise.reject(new Error("Could not create DAO"));
    }

    yield {
      key: DaoCreationSteps.DONE,
      address: "0x" + newDaoAddress.slice(newDaoAddress.length - 40),
    };
     */
  }
  /**
   * Deposits ether or an ERC20 token into the DAO
   *
   * @param {IDepositParams} params
   * @return {*}  {AsyncGenerator<DaoDepositStepValue>}
   * @memberof ClientMethods
   */
  public async *deposit(
    params: IDepositParams,
  ): AsyncGenerator<DaoDepositStepValue> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new Error("A signer is needed");
    } else if (!signer.provider) {
      throw new Error("A web3 provider is needed");
    }
    const [daoAddress, amount, tokenAddress, reference] = unwrapDepositParams(
      params,
    );

    if (tokenAddress && tokenAddress !== AddressZero) {
      // If the target is an ERC20 token, ensure that the amount can be transferred
      // Relay the yield steps to the caller as they are received
      yield* this.ensureAllowance(
        daoAddress,
        amount.toBigInt(),
        tokenAddress,
        signer,
      );
    }

    // Doing the transfer
    const daoInstance = DAO__factory.connect(daoAddress, signer);
    const override: { value?: BigNumber } = {};

    if (tokenAddress === AddressZero) {
      // Ether
      override.value = amount;
    }

    const depositTx = await daoInstance.deposit(
      tokenAddress,
      amount,
      reference,
      override,
    );
    yield { key: DaoDepositSteps.DEPOSITING, txHash: depositTx.hash };

    await depositTx.wait().then((cr) => {
      if (!cr.events?.length) {
        throw new Error("The deposit was not properly registered");
      }

      const eventAmount = cr.events?.find((e) => e?.event === "Deposited")?.args
        ?.amount;
      if (!amount.eq(eventAmount)) {
        throw new Error(
          `Deposited amount mismatch. Expected: ${amount.toBigInt()}, received: ${eventAmount.toBigInt()}`,
        );
      }
    });
    yield { key: DaoDepositSteps.DONE, amount: amount.toBigInt() };
  }

  private async *ensureAllowance(
    daoAddress: string,
    amount: bigint,
    tokenAddress: string,
    signer: Signer,
  ): AsyncGenerator<DaoDepositStepValue> {
    const tokenInstance = new Contract(tokenAddress, erc20ContractAbi, signer);

    const currentAllowance = await tokenInstance.allowance(
      await signer.getAddress(),
      daoAddress,
    );

    yield {
      key: DaoDepositSteps.CHECKED_ALLOWANCE,
      allowance: currentAllowance.toBigInt(),
    };

    if (currentAllowance.gte(amount)) return;

    const tx: ContractTransaction = await tokenInstance.approve(
      daoAddress,
      BigNumber.from(amount),
    );

    yield {
      key: DaoDepositSteps.UPDATING_ALLOWANCE,
      txHash: tx.hash,
    };

    await tx.wait().then((cr: ContractReceipt) => {
      const value = cr.events?.find((e) => e?.event === "Approval")?.args
        ?.value;
      if (!value || BigNumber.from(amount).gt(value)) {
        throw new Error("Could not update allowance");
      }
    });

    yield {
      key: DaoDepositSteps.UPDATED_ALLOWANCE,
      allowance: amount,
    };
  }
  /**
   * Checks whether a role is granted by the current DAO's ACL settings
   *
   * @param {string} _where
   * @param {string} _who
   * @param {DaoRole} _role
   * @param {Uint8Array} _data
   * @return {*}
   * @memberof ClientMethods
   */
  public hasPermission(
    _where: string,
    _who: string,
    _role: DaoRole,
    _data: Uint8Array,
  ) {
    // TODO: Unimplemented
    return Promise.reject();
  }
  /**
   * Retrieves metadata for DAO with given identifier (address or ens domain)
   *
   * @param {string} daoAddressOrEns
   * @return {*}  {(Promise<DaoDetails | null>)}
   * @memberof ClientMethods
   */
  public async getDao(daoAddressOrEns: string): Promise<DaoDetails | null> {
    let address = daoAddressOrEns;
    if (!isAddress(address)) {
      await this.web3.ensureOnline();
      const provider = this.web3.getProvider();
      if (!provider) {
        throw new NoProviderError();
      }
      const resolvedAddress = await provider.resolveName(address);
      if (!resolvedAddress) {
        throw new InvalidAddressOrEnsError();
      }
      address = resolvedAddress;
    }
    try {
      await this.graphql.ensureOnline();
      const client = this.graphql.getClient();
      const { dao }: { dao: SubgraphDao } = await client.request(QueryDao, {
        address,
      });
      if (!dao) {
        return null;
      }
      // const stringMetadata = await this.ipfs.fetchString(dao.metadata);
      // TODO
      // this is a temporal fix and should be changed by the line above
      // but the current daos in subgraph dont have a proper metadata
      const stringMetadata = await this.ipfs.fetchString(
        "QmebY8BGzWBUyVqZFMaFkFmz3JrfaDoFP5orDqzJ1uiEkr",
      );
      // TODO: Parse and validate schema
      const metadata = JSON.parse(stringMetadata);
      return toDaoDetails(dao, metadata);
    } catch (err) {
      throw new GraphQLError("DAO");
    }
  }
  /**
   * Retrieves metadata for DAO with given identifier (address or ens domain)
   *
   * @param {IDaoQueryParams} {
   *     limit = 10,
   *     skip = 0,
   *     direction = SortDirection.ASC,
   *     sortBy = DaoSortBy.CREATED_AT,
   *   }
   * @return {*}  {Promise<DaoListItem[]>}
   * @memberof ClientMethods
   */
  public async getDaos({
    limit = 10,
    skip = 0,
    direction = SortDirection.ASC,
    sortBy = DaoSortBy.CREATED_AT,
  }: IDaoQueryParams): Promise<DaoListItem[]> {
    try {
      await this.graphql.ensureOnline();
      const client = this.graphql.getClient();
      const { daos }: { daos: SubgraphDaoListItem[] } = await client.request(
        QueryDaos,
        {
          limit,
          skip,
          direction,
          sortBy,
        },
      );
      await this.ipfs.ensureOnline();
      return Promise.all(
        daos.map((dao: SubgraphDaoListItem): Promise<DaoListItem> => {
          // const stringMetadata = await this.ipfs.fetchString(dao.metadata);
          // TODO
          // this is a temporal fix and should be changed by the line above
          // but the current daos in subgraph dont have a proper metadata
          const test_cid = "QmebY8BGzWBUyVqZFMaFkFmz3JrfaDoFP5orDqzJ1uiEkr";
          return this.ipfs.fetchString(
            test_cid,
          ).then((stringMetadata) => {
            const metadata = JSON.parse(stringMetadata);
            return toDaoListItem(dao, metadata);
          });
        }),
      );
    } catch (err) {
      throw new GraphQLError("DAO");
    }
  }
  /**
   * Retrieves the asset balances of the given DAO, by default, ETH, DAI, USDC and USDT on Mainnet
   *
   * @param {string} daoAddressorEns
   * @param {string[]} _tokenAddresses
   * @return {*}  {(Promise<AssetBalance[] | null>)}
   * @memberof ClientMethods
   */
  public async getBalances(
    daoAddressorEns: string,
    _tokenAddresses: string[],
  ): Promise<AssetBalance[] | null> {
    let address = daoAddressorEns;
    if (!isAddress(address)) {
      await this.web3.ensureOnline();
      const provider = this.web3.getProvider();
      if (!provider) {
        throw new NoProviderError();
      }
      const resolvedAddress = await provider.resolveName(address);
      if (!resolvedAddress) {
        throw new InvalidAddressOrEnsError();
      }
      address = resolvedAddress;
    }
    try {
      await this.graphql.ensureOnline();
      const client = this.graphql.getClient();
      const { balances }: { balances: SubgraphBalance[] } = await client
        .request(QueryBalances, {
          address,
        });
      if (balances.length === 0) {
        return [];
      }
      // TODO
      // handle other tokens that are not ERC20 or eth
      return Promise.all(
        balances.map(
          (balance: SubgraphBalance): AssetBalance => toAssetBalance(balance),
        ),
      );
    } catch (err) {
      throw new GraphQLError("balance");
    }
  }
  /**
   * Retrieves the list of asset transfers to and from the given DAO (by default, from ETH, DAI, USDC and USDT, on Mainnet)
   *
   * @param {ITransferQueryParams} {
   *     daoAddressOrEns,
   *     type,
   *     limit = 10,
   *     skip = 0,
   *     direction = SortDirection.ASC,
   *     sortBy = TransferSortBy.CREATED_AT,
   *   }
   * @return {*}  {(Promise<Transfer[] | null>)}
   * @memberof ClientMethods
   */
  public async getTransfers({
    daoAddressOrEns,
    type,
    limit = 10,
    skip = 0,
    direction = SortDirection.ASC,
    sortBy = TransferSortBy.CREATED_AT,
  }: ITransferQueryParams): Promise<Transfer[] | null> {
    let where = {};
    let address = daoAddressOrEns;
    if (address) {
      if (!isAddress(address)) {
        await this.web3.ensureOnline();
        const provider = this.web3.getProvider();
        if (!provider) {
          throw new NoProviderError();
        }
        const resolvedAddress = await provider.resolveName(address);
        if (!resolvedAddress) {
          throw new InvalidAddressOrEnsError();
        }
        address = resolvedAddress;
      }
      where = { dao: address };
    }
    if (type) {
      where = { ...where, type: SubgraphTransferTypeMap.get(type) };
    }
    try {
      await this.graphql.ensureOnline();
      const client = this.graphql.getClient();
      const { vaultTransfers }: { vaultTransfers: SubgraphTransferListItem[] } =
        await client.request(QueryTransfers, {
          where,
          limit,
          skip,
          direction,
          sortBy,
        });
      if (!vaultTransfers) {
        return null;
      }
      return Promise.all(
        vaultTransfers.map(
          (transfer: SubgraphTransferListItem): Transfer =>
            toTransfer(transfer),
        ),
      );
    } catch {
      throw new GraphQLError("transfer");
    }
  }
}
