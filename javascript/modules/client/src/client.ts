import {
  AssetBalance,
  AssetDeposit,
  AssetWithdrawal,
  DaoCreationSteps,
  DaoCreationStepValue,
  DaoDepositSteps,
  DaoDepositStepValue,
  DaoDetails,
  IAssetTransfers,
  IClient,
  ICreateParams,
  IDaoQueryParams,
  IDepositParams,
  IMetadata,
  IWithdrawParams,
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
} from "./internal/interfaces/common";
import { pack } from "@ethersproject/solidity";

import { bytesToHex, Random, strip0x } from "@aragon/sdk-common";
import { erc20ContractAbi } from "./internal/abi/erc20";
import { Signer } from "@ethersproject/abstract-signer";
import {
  decodeUpdateMetadataAction,
  decodeWithdrawActionData,
  encodeUpdateMetadataAction,
  encodeWithdrawActionData,
} from "./internal/encoding/client";
import { getDummyDao } from "./internal/temp-mock";
import { isAddress } from "@ethersproject/address";
import { getFunctionFragment } from "./internal/encoding/common";

export { DaoCreationSteps, DaoDepositSteps };
export { ICreateParams, IDepositParams };

// This is a temporary token list, needs to remove later
const assetList: AssetBalance[] = [
  {
    type: "native",
    balance: BigInt("100000000000000000000"),
    lastUpdate: new Date(
      +new Date() - Math.floor(Random.getFloat() * 10000000000),
    ),
  },
  {
    type: "erc20",
    address: "0x9370ef1a59ad9cbaea30b92a6ae9dd82006c7ac0",
    name: "myjooje",
    symbol: "JOJ",
    decimals: 18,
    balance: BigInt("100000000000000000000"),
    lastUpdate: new Date(
      +new Date() - Math.floor(Random.getFloat() * 10000000000),
    ),
  },
  {
    type: "erc20",
    address: "0x35f7a3379b8d0613c3f753863edc85997d8d0968",
    name: "Dummy Test Token",
    symbol: "DTT",
    decimals: 18,
    balance: BigInt("100000000000000000000"),
    lastUpdate: new Date(
      +new Date() - Math.floor(Random.getFloat() * 10000000000),
    ),
  },
  {
    type: "erc20",
    address: "0xd783d0f9d8f5c956b808d641dea2038b050389d1",
    name: "Test Token",
    symbol: "TTK",
    decimals: 18,
    balance: BigInt("100000000000000000000"),
    lastUpdate: new Date(
      +new Date() - Math.floor(Random.getFloat() * 10000000000),
    ),
  },
];

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
    ): Promise<AssetBalance[]> =>
      this._getBalances(daoAddressOrEns, tokenAddresses),
    /**
     * Retrieves the list of asset transfers to and from the given DAO (by default, from ETH, DAI, USDC and USDT, on Mainnet)
     *
     * @param {string} daoAddressOrEns
     * @return {*}  {Promise<IAssetTransfers>}
     * @memberof Client
     */
    getTransfers: (daoAddressOrEns: string): Promise<IAssetTransfers> =>
      this._getTransfers(daoAddressOrEns),
    /**
     * Retrieves metadata for DAO with given identifier (address or ens domain)
     *
     * @param {string} daoAddressOrEns
     * @return {*}  {Promise<IAssetTransfers>}
     * @memberof Client
     */
    getDao: (daoAddressOrEns: string): Promise<DaoDetails> =>
      this._getDao(daoAddressOrEns),
    /**
     * Retrieves metadata for DAO with given identifier (address or ens domain)
     *
     * @param {IDaoQueryParams} params
     * @return {*}  {Promise<DaoDetails[]>}
     * @memberof Client
     */
    getDaos: (params?: IDaoQueryParams): Promise<DaoDetails[]> =>
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
    getInterface: (data: Uint8Array): IInterfaceParams | null =>
      this._getInterfaceParams(data),
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

    // @ts-ignore  TODO: Remove this comment when used
    const registryAddress = await daoFactoryInstance.registry();

    // TODO: Remove mock result
    yield {
      key: DaoCreationSteps.CREATING,
      txHash:
        "0x1298376517236498176239851762938512359817623985761239486128937461",
    };
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

  private _getDao(daoAddressOrEns: string): Promise<DaoDetails> {
    // TODO: Implement actual fetch logic using subgraph.

    if (!daoAddressOrEns) {
      throw new Error("Invalid DAO address or ENS");
    }
    return new Promise((resolve) => setTimeout(resolve, 1000)).then(() =>
      getDummyDao(daoAddressOrEns)
    );
  }

  private _getDaos({
    limit = 10,
    // TODO
    // uncomment this
    // skip = 0,
    // direction = SortDirection.ASC,
    // sortBy = DaoSortBy.CREATED_AT
  }: IDaoQueryParams): Promise<DaoDetails[]> {
    const metadataMany: DaoDetails[] = [];
    for (let index = 0; index < limit; index++) {
      metadataMany.push(getDummyDao());
    }
    return new Promise((resolve) => setTimeout(resolve, 1000)).then(
      () => (metadataMany),
    );
  }

  private _getBalances(
    daoIdentifier: string,
    _tokenAddresses: string[],
  ): Promise<AssetBalance[]> {
    // TODO: Implement actual fetch logic using subgraph.
    // Note: it would be nice if the client could be instantiated with dao identifier

    if (!daoIdentifier) {
      throw new Error("Invalid DAO address or ENS");
    }

    const AssetBalances: AssetBalance[] = assetList.map((token) => ({
      ...token,
    }));

    return Promise.resolve(AssetBalances);
  }
  private async _getTransfers(
    daoAddressOrEns: string,
  ): Promise<IAssetTransfers> {
    // TODO: Implement actual fetch logic using subgraph.
    // Note: it would be nice if the client could be instantiated with dao identifier

    if (!daoAddressOrEns) {
      throw new Error("Invalid DAO address or ENS");
    }

    // This is a temporary transfer list, needs to remove later
    const transfers = [
      {
        from: "0x9370ef1a59ad9cbaea30b92a6ae9dd82006c7ac0",
        transactionId:
          "0x4c97c60f499dc69918b1b77ab7504eeacbd1e1a536e10471e12c184885dafc05",
      },
      {
        from: "0xb1dc5d0881eea99a61d28be66fc491aae2a13d6a",
        transactionId:
          "0x6b0b8b815d78b83a5a69a883244a3ca2bdc25832edee2bc45e7b6392ad57fd94",
      },
      {
        from: "0x2db75d8404144cd5918815a44b8ac3f4db2a7faf",
        transactionId:
          "0x08525a68b342be200c220f5a22d30425a262c5603e63c210b7664f26b8418bcc",
      },
      {
        from: "0x2db75d8404144cd5918815a44b8ac3f4db2a7faf",
        transactionId:
          "0x8269a60f658e33393d3f20d065cd5107d410d41c5dba9e5c467efcd3f98db015",
      },
    ];

    const deposits: AssetDeposit[] = assetList.map(
      (assetBalance, index: number) => {
        if (assetBalance.type === "erc20") {
          const result: AssetDeposit = {
            type: "erc20",
            address: assetBalance.address,
            name: assetBalance.name,
            symbol: assetBalance.symbol,
            decimals: assetBalance.decimals,
            from: transfers[index].from,
            amount: assetBalance.balance,
            reference: "Some reference",
            transactionId: transfers[index].transactionId,
            // Generate a random date in the past
            date: new Date(
              +new Date() - Math.floor(Random.getFloat() * 10000000000),
            ),
          };
          return result;
        }
        const result: AssetDeposit = {
          type: "native",
          from: transfers[index].from,
          amount: assetBalance.balance,
          reference: "Some reference",
          transactionId: transfers[index].transactionId,
          // Generate a random date in the past
          date: new Date(
            +new Date() - Math.floor(Random.getFloat() * 10000000000),
          ),
        };
        return result;
      },
    );

    // Withdraw data structure would be similar to deposit list
    const withdrawals: AssetWithdrawal[] = [];

    return Promise.resolve({ deposits, withdrawals });
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

  private _getInterfaceParams(data: Uint8Array): IInterfaceParams | null {
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
