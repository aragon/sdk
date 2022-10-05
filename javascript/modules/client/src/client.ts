import {
  AssetBalance,
  DaoCreationSteps,
  DaoCreationStepValue,
  DaoDepositSteps,
  DaoDepositStepValue,
  DaoDetails,
  DaoListItem,
  DaoSortBy,
  IClient,
  ICreateParams,
  IDaoQueryParams,
  IDepositParams,
  IFreezePermissionDecodedParams,
  IFreezePermissionParams,
  IGrantPermissionDecodedParams,
  IGrantPermissionParams,
  IMetadata,
  IRevokePermissionDecodedParams,
  IRevokePermissionParams,
  ITransferQueryParams,
  IWithdrawParams,
  SubgraphBalance,
  SubgraphDao,
  SubgraphDaoListItem,
  SubgraphTransferListItem,
  SubgraphTransferTypeMap,
  Transfer,
  TransferSortBy,
} from "./internal/interfaces/client";
import {
  DAO__factory,
  DAOFactory,
  DAOFactory__factory,
} from "@aragon/core-contracts-ethers";
import { BigNumber } from "@ethersproject/bignumber";
import { AddressZero } from "@ethersproject/constants";
import {
  Contract,
  ContractReceipt,
  ContractTransaction,
} from "@ethersproject/contracts";
import { ClientCore } from "./internal/core";
import {
  DaoAction,
  DaoRole,
  IInterfaceParams,
  SortDirection,
} from "./internal/interfaces/common";
import { pack } from "@ethersproject/solidity";

import {
  bytesToHex,
  GraphQLError,
  InvalidAddressOrEnsError,
  NoProviderError,
  Random,
  strip0x,
} from "@aragon/sdk-common";
import { erc20ContractAbi } from "./internal/abi/erc20";
import { Signer } from "@ethersproject/abstract-signer";
import {
  decodeFreezeActionData,
  decodeGrantActionData,
  decodeRevokeActionData,
  decodeUpdateMetadataAction,
  decodeWithdrawActionData,
  encodeFreezeAction,
  encodeGrantActionData,
  encodeRevokeActionData,
  encodeUpdateMetadataAction,
  encodeWithdrawActionData,
  getFunctionFragment,
} from "./internal/encoding/client";
import { delay } from "./internal/temp-mock";
import { isAddress } from "@ethersproject/address";
import { QueryBalances } from "./internal/graphql-queries/balances";
import { QueryDao, QueryDaos } from "./internal/graphql-queries";
import {
  toAssetBalance,
  toDaoDetails,
  toDaoListItem,
  toTransfer,
} from "./internal/utils/client";
import { QueryTransfers } from "./internal/graphql-queries/transfer";


/**
 * Provider a generic client with high level methods to manage and interact with DAO's
 */
export class Client extends ClientCore implements IClient {
  //// HIGH LEVEL HANDLERS

  /** Contains all the generic high level methods to interact with a DAO */
  methods = {
    /**
     * Creates a DAO with the given settings and plugins
     *
     * @param {ICreateParams} params
     * @return {*}  {AsyncGenerator<DaoCreationStepValue>}
     * @memberof Client
     */
    create: (params: ICreateParams) => this._createDao(params),
    /**
     * Deposits ether or an ERC20 token into the DAO
     *
     * @param {IDepositParams} params
     * @return {*}  {AsyncGenerator<DaoDepositStepValue>}
     * @memberof Client
     */
    deposit: (params: IDepositParams) => this._deposit(params),
    /**
     * Retrieves the asset balances of the given DAO, by default, ETH, DAI, USDC and USDT on Mainnet
     *
     * @param {string} daoAddressOrEns
     * @param {string[]} tokenAddresses
     * @return {*}  {Promise<AssetBalance[]>}
     * @memberof Client
     */
    getBalances: (
      daoAddressOrEns: string,
      tokenAddresses: string[] = [],
    ): Promise<AssetBalance[] | null> =>
      this._getBalances(daoAddressOrEns, tokenAddresses),
    /**
     * Retrieves the list of asset transfers to and from the given DAO (by default, from ETH, DAI, USDC and USDT, on Mainnet)
     *
     * @param {ITransferQueryParams} params
     * @return {*}  {Promise<Transfer[]>}
     * @memberof Client
     */
    getTransfers: (params: ITransferQueryParams): Promise<Transfer[] | null> =>
      this._getTransfers(params),
    /**
     * Retrieves metadata for DAO with given identifier (address or ens domain)
     *
     * @param {string} daoAddressOrEns
     * @return {*}  {Promise<IAssetTransfers>}
     * @memberof Client
     */
    getDao: (daoAddressOrEns: string): Promise<DaoDetails | null> =>
      this._getDao(daoAddressOrEns),
    /**
     * Retrieves metadata for DAO with given identifier (address or ens domain)
     *
     * @param {IDaoQueryParams} params
     * @return {*}  {Promise<DaoDetails[]>}
     * @memberof Client
     */
    getDaos: (params?: IDaoQueryParams): Promise<DaoListItem[]> =>
      this._getDaos(params ?? {}),

    /**
     * Checks whether a role is granted by the current DAO's ACL settings
     *
     * @param {string} where
     * @param {string} who
     * @param {DaoRole} role
     * @param {Uint8Array} data
     * @return {*}
     * @memberof Client
     */
    hasPermission: (
      where: string,
      who: string,
      role: DaoRole,
      data: Uint8Array,
    ) => this._hasPermission(where, who, role, data),
  };

  encoding = {
    /**
     * Computes the payload to be given when creating a proposal that grants a permission within a DAO
     *
     * @param {string} daoAddress
     * @param {IGrantPermissionParams} params
     * @return {*}  {Promise<DaoAction>}
     * @memberof Client
     */
    grantAction: (
      daoAddress: string,
      params: IGrantPermissionParams,
    ): DaoAction => this._buildGrantAction(daoAddress, params),
    /**
     * Computes the payload to be given when creating a proposal that revokes a permission within a DAO
     *
     * @param {string} daoAddress
     * @param {IRevokePermissionParams} params
     * @return {*}  {Promise<DaoAction>}
     * @memberof Client
     */
    revokeAction: (
      daoAddress: string,
      params: IRevokePermissionParams,
    ): DaoAction => this._buildRevokeAction(daoAddress, params),
    /**
     * Computes the payload to be given when creating a proposal that freezes a permission within a DAO
     *
     * @param {string} daoAddress
     * @param {IFreezePermissionParams} params
     * @return {*}  {Promise<DaoAction>}
     * @memberof Client
     */
    freezeAction: (
      daoAddress: string,
      params: IFreezePermissionParams,
    ): DaoAction => this._buildFreezeAction(daoAddress, params),
    /**
     * Computes the payload to be given when creating a proposal that withdraws ether or an ERC20 token from the DAO
     *
     * @param {string} daoAddresOrEns
     * @param {IWithdrawParams} params
     * @return {*}  {Promise<DaoAction>}
     * @memberof Client
     */
    withdrawAction: (
      daoAddressOrEns: string,
      params: IWithdrawParams,
    ): Promise<DaoAction> => this._buildWithdrawAction(daoAddressOrEns, params),

    /**
     * Computes the payload to be given when creating a proposal that updates the metadata the DAO
     *
     * @param {string} daoAddresOrEns
     * @param {IMetadata} params
     * @return {*}  {Promise<DaoAction>}
     * @memberof Client
     */
    updateMetadataAction: (
      daoAddressOrEns: string,
      params: IMetadata,
    ): Promise<DaoAction> =>
      this._buildUpdateMetadataAction(daoAddressOrEns, params),
  };

  decoding = {
    /**
     * Decodes the permission parameters from an encoded grant action
     *
     * @param {Uint8Array} data
     * @return {*}  {IGrantPermissionDecodedParams}
     * @memberof Client
     */
    grantAction: (data: Uint8Array): IGrantPermissionDecodedParams =>
      decodeGrantActionData(data),
    /**
     * Decodes the permission parameters from an encoded revoke action
     *
     * @param {Uint8Array} data
     * @return {*}  {IRevokePermissionDecodedParams}
     * @memberof Client
     */
    revokeAction: (data: Uint8Array): IRevokePermissionDecodedParams =>
      decodeRevokeActionData(data),
    /**
     * Decodes the freezee parameters from an encoded freeze action
     *
     * @param {Uint8Array} data
     * @return {*}  {IFreezePermissionDecodedParams}
     * @memberof Client
     */
    freezeAction: (data: Uint8Array): IFreezePermissionDecodedParams =>
      decodeFreezeActionData(data),
    /**
     * Decodes the withdraw parameters from an encoded withdraw action
     *
     * @param {Uint8Array} data
     * @return {*}  {IWithdrawParams}
     * @memberof Client
     */
    withdrawAction: (data: Uint8Array): IWithdrawParams =>
      decodeWithdrawActionData(data),

    /**
     * Decodes a dao metadata ipfs uri from an encoded update metadata action
     *
     * @param {Uint8Array} data
     * @return {*}  {string}
     * @memberof Client
     */
    updateMetadataRawAction: (data: Uint8Array): string =>
      this._decodeUpdateMetadataRawAction(data),

    /**
     * Decodes a dao metadata from an encoded update metadata raw action
     *
     * @param {Uint8Array} data
     * @return {*}  {Promise<IMetadata>}
     * @memberof Client
     */
    updateMetadataAction: (data: Uint8Array): Promise<IMetadata> =>
      this._decodeUpdateMetadataAction(data),

    /**
     * Returns the decoded function info given the encoded data of an action
     *
     * @param {Uint8Array} data
     * @return {*}  {IInterfaceParams | null}
     * @memberof Client
     */
    findInterface: (data: Uint8Array): IInterfaceParams | null =>
      this._findInterfaceParams(data),
  };

  //// ESTIMATION HANDLERS

  /** Contains the gas estimation of the Ethereum transactions */
  estimation = {
    /**
     * Estimates the gas fee of creating a DAO
     *
     * @param {ICreateParams} params
     * @return {*}  {Promise<GasFeeEstimation>}
     * @memberof Client
     */
    create: (params: ICreateParams) => this._estimateCreation(params),

    /**
     * Estimates the gas fee of depositing ether or an ERC20 token into the DAO
     *
     * @param {IDepositParams} params
     * @return {*}  {Promise<GasFeeEstimation>}
     * @memberof Client
     */
    deposit: (params: IDepositParams) => this._estimateDeposit(params),
    updateAllowance: (params: IDepositParams) =>
      this._estimateUpdateAllowance(params),
  };

  //// PRIVATE METHOD IMPLEMENTATIONS
  /**
   * @private
   * @param {ICreateParams} params
   * @return {*}  {AsyncGenerator<DaoCreationStepValue>}
   * @memberof Client
   */
  private async *_createDao(
    // @ts-ignore  TODO: Remove this comment when used
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

  private async *_deposit(
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
      yield* this._ensureAllowance(
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

  private async *_ensureAllowance(
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

  private _hasPermission(
    _where: string,
    _who: string,
    _role: DaoRole,
    _data: Uint8Array,
  ) {
    // TODO: Unimplemented
    return Promise.reject();
  }

  //// PRIVATE METHOD GAS ESTIMATIONS

  // @ts-ignore  TODO: Remove this comment
  _estimateCreation(params: ICreateParams) {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new Error("A signer is needed for estimating the gas cost");
    }

    // TODO: Unimplemented
    // TODO: The new contract code is needed
    return Promise.resolve(
      this.web3.getApproximateGasFee(Random.getBigInt(BigInt(1500))),
    );
  }

  _estimateDeposit(params: IDepositParams) {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new Error("A signer is needed for estimating the gas cost");
    }

    const [daoAddress, amount, tokenAddress, reference] = unwrapDepositParams(
      params,
    );

    const daoInstance = DAO__factory.connect(daoAddress, signer);

    const override: { value?: BigNumber } = {};
    if (tokenAddress === AddressZero) {
      override.value = amount;
    }

    // TODO: If the approved ERC20 amount is not enough,
    // estimate the cose of increasing the allowance

    return daoInstance.estimateGas
      .deposit(tokenAddress, amount, reference, override)
      .then((gasLimit) => {
        return this.web3.getApproximateGasFee(gasLimit.toBigInt());
      });
  }

  _estimateUpdateAllowance(_params: IDepositParams) {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new Error("A signer is needed");
    } else if (!signer.provider) {
      throw new Error("A web3 provider is needed");
    }
    // TODO: remove this
    return Promise.resolve(
      this.web3.getApproximateGasFee(Random.getBigInt(BigInt(1500))),
    );
  }

  //// PRIVATE METHODS METADATA

  private async _getDao(daoAddressOrEns: string): Promise<DaoDetails | null> {
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

  private async _getDaos({
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

  private async _getBalances(
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
  private async _getTransfers({
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
      where = { ...where, type: SubgraphTransferTypeMap.get(type)};
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

  private _buildGrantAction(
    daoAddreess: string,
    params: IGrantPermissionParams,
  ): DaoAction {
    const signer = this.web3.getSigner();
    const { where, who } = params;
    if (!signer) {
      throw new Error("A signer is needed");
    } else if (
      !isAddress(where) || !isAddress(who) || !isAddress(daoAddreess)
    ) {
      throw new Error("Invalid address");
    }
    return {
      to: daoAddreess,
      value: BigInt(0),
      data: encodeGrantActionData(
        {
          who,
          where,
          permission: params.permission,
        },
      ),
    };
  }

  private _buildRevokeAction(
    daoAddreess: string,
    params: IRevokePermissionParams,
  ): DaoAction {
    const signer = this.web3.getSigner();
    const { where, who } = params;
    if (!signer) {
      throw new Error("A signer is needed");
    } else if (
      !isAddress(where) || !isAddress(who) || !isAddress(daoAddreess)
    ) {
      throw new Error("Invalid address");
    }
    return {
      to: daoAddreess,
      value: BigInt(0),
      data: encodeRevokeActionData(
        {
          who,
          where,
          permission: params.permission,
        },
      ),
    };
  }

  private _buildFreezeAction(
    daoAddreess: string,
    params: IFreezePermissionParams,
  ): DaoAction {
    const signer = this.web3.getSigner();
    const { where } = params;
    if (!signer) {
      throw new Error("A signer is needed");
    } else if (!isAddress(where) || !isAddress(daoAddreess)) {
      throw new Error("Invalid address");
    }
    return {
      to: daoAddreess,
      value: BigInt(0),
      data: encodeFreezeAction(
        {
          where,
          permission: params.permission,
        },
      ),
    };
  }

  private async _buildWithdrawAction(
    daoAddreessOrEns: string,
    params: IWithdrawParams,
  ): Promise<DaoAction> {
    // check ens
    let address = daoAddreessOrEns;
    if (!isAddress(daoAddreessOrEns)) {
      const resolvedAddress = await this.web3.getSigner()?.resolveName(
        daoAddreessOrEns,
      );
      if (!resolvedAddress) {
        throw new Error("invalid ens");
      }
      address = resolvedAddress;
    }

    return {
      to: address,
      value: BigInt(0),
      data: encodeWithdrawActionData(params),
    };
  }

  private async _buildUpdateMetadataAction(
    daoAddreessOrEns: string,
    params: IMetadata,
  ): Promise<DaoAction> {
    // check ens
    let address = daoAddreessOrEns;
    if (!isAddress(daoAddreessOrEns)) {
      const resolvedAddress = await this.web3.getSigner()?.resolveName(
        daoAddreessOrEns,
      );
      if (!resolvedAddress) {
        throw new Error("invalid ens");
      }
      address = resolvedAddress;
    }
    // upload metadata to IPFS
    let cid: string;
    try {
      cid = await this.ipfs.add(JSON.stringify(params));
    } catch {
      throw new Error("Could not pin the metadata on IPFS");
    }
    return {
      to: address,
      value: BigInt(0),
      data: encodeUpdateMetadataAction(cid),
    };
  }

  private async _decodeUpdateMetadataAction(
    data: Uint8Array,
  ): Promise<IMetadata> {
    const cid = decodeUpdateMetadataAction(data);
    try {
      const stringMetadata = await this.ipfs.fetchString(cid);
      return JSON.parse(stringMetadata);
    } catch {
      throw new Error("Error reading data from IPFS");
    }
  }
  private _decodeUpdateMetadataRawAction(data: Uint8Array): string {
    return "ipfs://" + decodeUpdateMetadataAction(data);
  }

  private _findInterfaceParams(data: Uint8Array): IInterfaceParams | null {
    try {
      const func = getFunctionFragment(data);
      return {
        id: func.format("minimal"),
        functionName: func.name,
        hash: bytesToHex(data, true).substring(0, 10),
      };
    } catch {
      return null;
    }
  }
}

// PRIVATE HELPERS

// @ts-ignore  TODO: Remove this comment
function unwrapCreateDaoParams(
  params: ICreateParams,
  metadataCid: string,
): [DAOFactory.DAOConfigStruct, DAOFactory.VoteConfigStruct, string, string] {
  // TODO: Serialize plugin params into a buffer
  const pluginDataBytes = "0x" +
    params.plugins
      .map((entry) => {
        const item = pack(["uint256", "bytes[]"], [entry.id, entry.data]);
        return strip0x(item);
      })
      .join("");

  return [
    {
      name: params.ensSubdomain,
      metadata: "ipfs://" + metadataCid,
    },
    {
      // TODO: Adapt the DAO creation parameters
      participationRequiredPct: BigInt(10), // BigInt(params.votingConfig.minParticipation),
      supportRequiredPct: BigInt(50), // BigInt(params.votingConfig.minSupport),
      minDuration: BigInt(50), // BigInt(params.votingConfig.minDuration),
    },
    // {
    //   addr: params.tokenConfig.address,
    //   name: params.tokenConfig.name,
    //   symbol: params.tokenConfig.symbol,
    // },
    // {
    //   receivers: params.mintConfig.map((receiver) => receiver.address),
    //   amounts: params.mintConfig.map((receiver) => receiver.balance),
    // },
    pluginDataBytes,
    AddressZero, // TODO: Remove when the new contract version is available
  ];
}

function unwrapDepositParams(
  params: IDepositParams,
): [string, BigNumber, string, string] {
  return [
    params.daoAddress,
    BigNumber.from(params.amount),
    params.tokenAddress ?? AddressZero,
    params.reference ?? "",
  ];
}
