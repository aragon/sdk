import {
  DAO__factory,
  DAOFactory,
  DAOFactory__factory,
  DAORegistry__factory,
  IProtocolVersion__factory,
  PluginRepo__factory,
  PluginSetupProcessor__factory,
} from "@aragon/osx-ethers";
// HEAD
import {
  AmountMismatchError,
  DaoCreationError,
  FailedDepositError,
  InstallationNotFoundError,
  InvalidAddressOrEnsError,
  InvalidCidError,
  IpfsPinError,
  MissingExecPermissionError,
  NoProviderError,
  NotImplementedError,
  PluginUninstallationPreparationError,
  promiseWithTimeout,
  ProposalNotFoundError,
  resolveIpfsCid,
  UpdateAllowanceError,
} from "@aragon/sdk-common";

//
//079ce5f1 (merge common packages and deprecate sdk-common)
import { defaultAbiCoder } from "@ethersproject/abi";
import { BigNumber } from "@ethersproject/bignumber";
import { AddressZero } from "@ethersproject/constants";
import { Contract, ContractTransaction } from "@ethersproject/contracts";
import { abi as ERC20_ABI } from "@openzeppelin/contracts/build/contracts/ERC20.json";
import { abi as ERC721_ABI } from "@openzeppelin/contracts/build/contracts/ERC721.json";
import { abi as ERC1155_ABI } from "@openzeppelin/contracts/build/contracts/ERC1155.json";
import {
  QueryDao,
  QueryDaos,
  QueryIPlugin,
  QueryIProposal,
  QueryPlugin,
  QueryPluginPreparations,
  QueryPlugins,
  QueryTokenBalances,
  QueryTokenTransfers,
} from "../graphql-queries";
import {
  AssetBalance,
  AssetBalanceSortBy,
  CreateDaoParams,
  DaoBalancesQueryParams,
  DaoCreationSteps,
  DaoCreationStepValue,
  DaoDepositSteps,
  DaoDepositStepValue,
  DaoDetails,
  DaoListItem,
  DaoMetadata,
  DaoQueryParams,
  DaoSortBy,
  DaoUpdateProposalInvalidityCause,
  DaoUpdateProposalValidity,
  DecodedInitializeFromParams,
  DepositErc1155Params,
  DepositErc20Params,
  DepositErc721Params,
  DepositEthParams,
  DepositParams,
  GrantPermissionDecodedParams,
  HasPermissionParams,
  IsDaoUpdateProposalValidParams,
  PluginQueryParams,
  PluginRepo,
  PluginRepoBuildMetadata,
  PluginRepoListItem,
  PluginRepoRelease,
  PluginRepoReleaseMetadata,
  PluginSortBy,
  PluginUpdateProposalInValidityCause,
  PluginUpdateProposalValidity,
  RevokePermissionDecodedParams,
  SetAllowanceParams,
  SetAllowanceSteps,
  SetAllowanceStepValue,
  Transfer,
  TransferQueryParams,
  TransferSortBy,
} from "../../types";
import {
  SubgraphBalance,
  SubgraphDao,
  SubgraphDaoListItem,
  SubgraphIProposal,
  SubgraphPluginInstallation,
  SubgraphPluginRepo,
  SubgraphPluginRepoListItem,
  SubgraphPluginRepoRelease,
  SubgraphPluginUpdatePreparation,
  SubgraphTransferListItem,
  SubgraphTransferTypeMap,
} from "../types";
import {
  decodeApplyUpdateAction,
  decodeGrantAction,
  decodeInitializeFromAction,
  decodeRevokeAction,
  decodeUpgradeToAndCallAction,
  findAction,
  getPreparedSetupId,
  toAssetBalance,
  toDaoActions,
  toDaoDetails,
  toDaoListItem,
  toPluginRepo,
  toPluginRepoListItem,
  toPluginRepoRelease,
  toTokenTransfer,
} from "../utils";
import { isAddress } from "@ethersproject/address";
import { toUtf8Bytes } from "@ethersproject/strings";
import { id } from "@ethersproject/hash";
import {
  EMPTY_BUILD_METADATA_LINK,
  EMPTY_DAO_METADATA_LINK,
  EMPTY_RELEASE_METADATA_LINK,
  PreparationType,
  SupportedPluginRepo,
  SupportedPluginRepoArray,
  UNAVAILABLE_BUILD_METADATA,
  UNAVAILABLE_DAO_METADATA,
  UNAVAILABLE_RELEASE_METADATA,
  UNSUPPORTED_BUILD_METADATA_LINK,
  UNSUPPORTED_DAO_METADATA_LINK,
  UNSUPPORTED_RELEASE_METADATA_LINK,
} from "../constants";
import { IClientMethods } from "../interfaces";
import {
  AddressOrEnsSchema,
  AmountMismatchError,
  ClientCore,
  DaoAction,
  DaoCreationError,
  DecodedApplyUpdateParams,
  FailedDepositError,
  findLog,
  getNamedTypesFromMetadata,
  InstallationNotFoundError,
  InvalidAddressError,
  InvalidAddressOrEnsError,
  InvalidCidError,
  InvalidEnsError,
  InvalidParameter,
  IpfsPinError,
  LIVE_CONTRACTS,
  MissingExecPermissionError,
  MULTI_FETCH_TIMEOUT,
  MultiTargetPermission,
  NoProviderError,
  NotImplementedError,
  PermissionIds,
  Permissions,
  PluginUninstallationPreparationError,
  prepareGenericInstallation,
  prepareGenericUpdate,
  PrepareInstallationParams,
  PrepareInstallationSchema,
  PrepareInstallationStepValue,
  PrepareUninstallationParams,
  PrepareUninstallationSchema,
  PrepareUninstallationSteps,
  PrepareUninstallationStepValue,
  PrepareUpdateParams,
  PrepareUpdateStepValue,
  promiseWithTimeout,
  ProposalNotFoundError,
  resolveIpfsCid,
  SizeMismatchError,
  SortDirection,
  SupportedVersion,
  TokenType,
  UpdateAllowanceError,
} from "@aragon/sdk-client-common";
import {
  CreateDaoSchema,
  DaoBalancesQuerySchema,
  DaoMetadataSchema,
  DaoQuerySchema,
  DepositErc1155Schema,
  DepositErc20Schema,
  DepositErc721Schema,
  DepositEthSchema,
  HasPermissionSchema,
  PluginQuerySchema,
} from "../schemas";

/**
 * Methods module the SDK Generic Client
 */
export class ClientMethods extends ClientCore implements IClientMethods {
  public async *prepareInstallation(
    params: PrepareInstallationParams,
  ): AsyncGenerator<PrepareInstallationStepValue> {
    await PrepareInstallationSchema.strict().validate(params);
    yield* prepareGenericInstallation(this.web3, {
      ...params,
      pluginSetupProcessorAddress: this.web3.getAddress(
        "pluginSetupProcessorAddress",
      ),
    });
  }
  /**
   * Creates a DAO with the given settings and plugins

   * @param {CreateDaoParams} params
   * @return {*}  {AsyncGenerator<DaoCreationStepValue>}
   * @memberof ClientMethods
   */
  public async *createDao(
    params: CreateDaoParams,
  ): AsyncGenerator<DaoCreationStepValue> {
    await CreateDaoSchema.strict().validate(params);
    const signer = this.web3.getConnectedSigner();

    const daoFactoryInstance = DAOFactory__factory.connect(
      this.web3.getAddress("daoFactoryAddress"),
      signer,
    );

    const pluginInstallationData: DAOFactory.PluginSettingsStruct[] = [];
    for (const plugin of params.plugins) {
      const repo = PluginRepo__factory.connect(plugin.id, signer);

      const currentRelease = await repo.latestRelease();
      const latestVersion = await repo["getLatestVersion(uint8)"](
        currentRelease,
      );
      pluginInstallationData.push({
        pluginSetupRef: {
          pluginSetupRepo: repo.address,
          versionTag: latestVersion.tag,
        },
        data: plugin.data,
      });
    }

    // check if at least one plugin requests EXECUTE_PERMISSION on the DAO
    // This check isn't 100% correct all the time
    // simulate the DAO creation to get an address
    const pluginSetupProcessorAddr = await daoFactoryInstance
      .pluginSetupProcessor();
    const pluginSetupProcessor = PluginSetupProcessor__factory.connect(
      pluginSetupProcessorAddr,
      signer,
    );
    let execPermissionFound = false;

    // using the DAO base because it reflects a newly created DAO the best
    const daoBaseAddr = await daoFactoryInstance.daoBase();
    // simulates each plugin installation seperately to get the requested permissions
    for (const installData of pluginInstallationData) {
      const pluginSetupProcessorResponse = await pluginSetupProcessor.callStatic
        .prepareInstallation(daoBaseAddr, installData);
      const found = pluginSetupProcessorResponse[1].permissions.find(
        (permission) =>
          permission.permissionId === PermissionIds.EXECUTE_PERMISSION_ID,
      );
      if (found) {
        execPermissionFound = true;
        break;
      }
    }

    if (!execPermissionFound) {
      throw new MissingExecPermissionError();
    }

    const tx = await daoFactoryInstance.connect(signer).createDao(
      {
        subdomain: params.ensSubdomain,
        metadata: toUtf8Bytes(params.metadataUri),
        daoURI: params.daoUri || "",
        trustedForwarder: params.trustedForwarder || AddressZero,
      },
      pluginInstallationData,
    );

    yield {
      key: DaoCreationSteps.CREATING,
      txHash: tx.hash,
    };
    // start tx
    const receipt = await tx.wait();
    const daoFactoryInterface = DAORegistry__factory.createInterface();
    // find dao address using the dao registry address
    const log = receipt.logs?.find(
      (e) =>
        e.topics[0] ===
          id(daoFactoryInterface.getEvent("DAORegistered").format("sighash")),
    );

    if (!log) {
      throw new DaoCreationError();
    }

    // Plugin logs
    const pspInterface = PluginSetupProcessor__factory.createInterface();
    const installedLogs = receipt.logs?.filter(
      (e) =>
        e.topics[0] ===
          id(pspInterface.getEvent("InstallationApplied").format("sighash")),
    );

    // DAO logs
    const parsedLog = daoFactoryInterface.parseLog(log);
    if (!parsedLog.args["dao"]) {
      throw new DaoCreationError();
    }

    yield {
      key: DaoCreationSteps.DONE,
      address: parsedLog.args["dao"],
      pluginAddresses: installedLogs.map(
        (log) => pspInterface.parseLog(log).args[1],
      ),
    };
  }
  /**
   * Pins a metadata object into IPFS and retruns the generated hash
   *
   * @param {DaoMetadata} params
   * @return {*}  {Promise<string>}
   * @memberof ClientMethods
   */
  public async pinMetadata(params: DaoMetadata): Promise<string> {
    await DaoMetadataSchema.strict().validate(params);
    try {
      const cid = await this.ipfs.add(JSON.stringify(params));
      await this.ipfs.pin(cid);
      return `ipfs://${cid}`;
    } catch (e) {
      throw new IpfsPinError(e);
    }
  }
  /**
   * Deposits ether or an ERC20 token into the DAO
   *
   * @param {DepositParams} params
   * @return {*}  {AsyncGenerator<DaoDepositStepValue>}
   * @memberof ClientMethods
   */
  public async *deposit(
    params: DepositParams,
  ): AsyncGenerator<DaoDepositStepValue> {
    switch (params.type) {
      case TokenType.NATIVE:
        yield* this.depositNative(params);
        break;
      case TokenType.ERC20:
        yield* this.depositErc20(params);
        break;
      case TokenType.ERC721:
        yield* this.depositErc721(params);
        break;
      case TokenType.ERC1155:
        yield* this.depositErc1155(params);
        break;
      default:
        throw new NotImplementedError(
          "Token type not valid, use transfer function instead",
        );
    }
  }

  private async *depositNative(
    params: DepositEthParams,
  ): AsyncGenerator<DaoDepositStepValue> {
    await DepositEthSchema.strict().validate(params);
    const signer = this.web3.getConnectedSigner();
    const { daoAddressOrEns, amount } = params;
    const override: { value?: bigint } = { value: params.amount };
    const daoInstance = DAO__factory.connect(daoAddressOrEns, signer);

    const tx = await daoInstance.deposit(
      AddressZero,
      amount,
      "",
      override,
    );
    yield { key: DaoDepositSteps.DEPOSITING, txHash: tx.hash };

    const cr = await tx.wait();
    const log = findLog(cr, daoInstance.interface, "Deposited");
    if (!log) {
      throw new FailedDepositError();
    }

    const daoInterface = DAO__factory.createInterface();
    const parsedLog = daoInterface.parseLog(log);

    if (!amount.toString() === parsedLog.args["amount"]) {
      throw new AmountMismatchError(
        amount,
        parsedLog.args["amount"].toBigInt(),
      );
    }
    yield { key: DaoDepositSteps.DONE, amount: amount };
  }

  private async *depositErc20(
    params: DepositErc20Params,
  ): AsyncGenerator<DaoDepositStepValue> {
    await DepositErc20Schema.strict().validate(params);
    const signer = this.web3.getConnectedSigner();
    const { tokenAddress, daoAddressOrEns, amount } = params;
    // check current allowance
    const tokenContract = new Contract(
      tokenAddress,
      ERC20_ABI,
      signer,
    );
    const currentAllowance = await tokenContract.allowance(
      await signer.getAddress(),
      daoAddressOrEns,
    );
    yield {
      key: DaoDepositSteps.CHECKED_ALLOWANCE,
      allowance: currentAllowance.toBigInt(),
    };
    // if its lower than the needed, set it to the correct one
    if (currentAllowance.lt(params.amount)) {
      // If the target is an ERC20 token, ensure that the amount can be transferred
      // Relay the yield steps to the caller as they are received
      yield* this.setAllowance(
        {
          amount: params.amount,
          spender: params.daoAddressOrEns,
          tokenAddress: params.tokenAddress,
        },
      );
    }
    // Doing the transfer
    const daoInstance = DAO__factory.connect(daoAddressOrEns, signer);

    const tx = await daoInstance.deposit(
      tokenAddress,
      amount,
      "",
    );
    yield { key: DaoDepositSteps.DEPOSITING, txHash: tx.hash };

    const cr = await tx.wait();
    const log = findLog(cr, daoInstance.interface, "Deposited");
    if (!log) {
      throw new FailedDepositError();
    }

    const daoInterface = DAO__factory.createInterface();
    const parsedLog = daoInterface.parseLog(log);

    if (!amount.toString() === parsedLog.args["amount"]) {
      throw new AmountMismatchError(
        amount,
        parsedLog.args["amount"].toBigInt(),
      );
    }
    yield { key: DaoDepositSteps.DONE, amount: amount };
  }

  private async *depositErc721(
    params: DepositErc721Params,
  ): AsyncGenerator<DaoDepositStepValue> {
    await DepositErc721Schema.strict().validate(params) as DepositErc721Params;
    const signer = this.web3.getConnectedSigner();
    const erc721Contract = new Contract(
      params.tokenAddress,
      ERC721_ABI,
      signer,
    );
    const tx = await erc721Contract
      ["safeTransferFrom(address,address,uint256)"](
        await signer.getAddress(),
        params.daoAddressOrEns,
        params.tokenId,
      );

    const cr = await tx.wait();

    const log = findLog(cr, erc721Contract.interface, "Transfer");

    if (!log) {
      throw new FailedDepositError();
    }

    const parsedLog = erc721Contract.interface.parseLog(log);
    if (
      !parsedLog.args["tokenId"] ||
      parsedLog.args["tokenId"].toString() !== params.tokenId.toString()
    ) {
      throw new FailedDepositError();
    }
    yield {
      key: DaoDepositSteps.DONE,
      tokenId: params.tokenId,
    };
  }

  private async *depositErc1155(
    params: DepositErc1155Params,
  ): AsyncGenerator<DaoDepositStepValue> {
    await DepositErc1155Schema.strict().validate(params);
    const signer = this.web3.getConnectedSigner();
    const erc1155Contract = new Contract(
      params.tokenAddress,
      ERC1155_ABI,
      signer,
    );

    let tx: ContractTransaction, logName: string, logArg: string;
    if (params.tokenIds.length === 1) {
      tx = await erc1155Contract
        ["safeTransferFrom(address,address,uint256,uint256,bytes)"](
          await signer.getAddress(),
          params.daoAddressOrEns,
          params.tokenIds[0],
          params.amounts[0],
          new Uint8Array([]),
        );
      logName = "TransferSingle";
      logArg = "id";
    } else {
      tx = await erc1155Contract
        ["safeBatchTransferFrom(address,address,uint256[],uint256[],bytes)"](
          await signer.getAddress(),
          params.daoAddressOrEns,
          params.tokenIds,
          params.amounts,
          new Uint8Array([]),
        );
      logName = "TransferBatch";
      logArg = "ids";
    }

    const cr = await tx.wait();

    const log = findLog(cr, erc1155Contract.interface, logName);

    if (!log) {
      throw new FailedDepositError();
    }

    const parsedLog = erc1155Contract.interface.parseLog(log);
    if (
      !parsedLog.args[logArg] ||
      parsedLog.args[logArg].toString() !== params.tokenIds.toString()
    ) {
      throw new FailedDepositError();
    }
    yield {
      key: DaoDepositSteps.DONE,
      tokenIds: params.tokenIds,
      amounts: params.amounts,
    };
  }

  /**
   * Checks if the allowance is enough and updates it
   *
   * @param {SetAllowanceParams} params
   * @return {*}  {AsyncGenerator<SetAllowanceStepValue>}
   * @memberof ClientMethods
   */
  public async *setAllowance(
    params: SetAllowanceParams,
  ): AsyncGenerator<SetAllowanceStepValue> {
    const signer = this.web3.getConnectedSigner();
    // TODO
    // add params check with yup
    const tokenInstance = new Contract(
      params.tokenAddress,
      ERC20_ABI,
      signer,
    );
    const tx: ContractTransaction = await tokenInstance.approve(
      params.spender,
      params.amount,
    );

    yield {
      key: SetAllowanceSteps.SETTING_ALLOWANCE,
      txHash: tx.hash,
    };

    const cr = await tx.wait();
    const log = findLog(cr, tokenInstance.interface, "Approval");

    if (!log) {
      throw new UpdateAllowanceError();
    }
    const value = log.data;
    if (!value || BigNumber.from(params.amount).gt(BigNumber.from(value))) {
      throw new UpdateAllowanceError();
    }

    yield {
      key: SetAllowanceSteps.ALLOWANCE_SET,
      allowance: params.amount,
    };
  }
  /**
   * Prepare uninstallation of a plugin
   *
   * @param {PrepareUninstallationParams} params
   * @return {*}  {AsyncGenerator<PrepareUninstallationStepValue>}
   * @memberof ClientMethods
   */
  public async *prepareUninstallation(
    params: PrepareUninstallationParams,
  ): AsyncGenerator<PrepareUninstallationStepValue> {
    await PrepareUninstallationSchema.strict().validate(
      params,
    );
    const signer = this.web3.getConnectedSigner();
    type T = {
      iplugin: { installations: SubgraphPluginInstallation[] };
    };
    const { iplugin } = await this.graphql.request<T>({
      query: QueryIPlugin,
      params: {
        address: params.pluginAddress.toLowerCase(),
        where: { dao: params.daoAddressOrEns.toLowerCase() },
      },
      name: "plugin",
    });

    // filter specified installation
    const { pluginInstallationIndex = 0 } = params;
    const selectedInstallation = iplugin.installations[pluginInstallationIndex];
    if (!selectedInstallation) {
      throw new InstallationNotFoundError();
    }
    // encode uninstallation params
    const { uninstallationParams = [], uninstallationAbi = [] } = params;
    const data = defaultAbiCoder.encode(
      uninstallationAbi,
      uninstallationParams,
    );
    // connect to psp contract
    const pspContract = PluginSetupProcessor__factory.connect(
      this.web3.getAddress("pluginSetupProcessorAddress"),
      signer,
    );
    const tx = await pspContract.prepareUninstallation(
      params.daoAddressOrEns,
      {
        pluginSetupRef: {
          pluginSetupRepo:
            selectedInstallation.appliedPreparation.pluginRepo.id,
          versionTag: {
            build: selectedInstallation.appliedVersion.build,
            release: selectedInstallation.appliedVersion.release.release,
          },
        },
        setupPayload: {
          plugin: params.pluginAddress,
          currentHelpers: selectedInstallation.appliedPreparation.helpers,
          data,
        },
      },
    );
    yield {
      key: PrepareUninstallationSteps.PREPARING,
      txHash: tx.hash,
    };
    const cr = await tx.wait();

    const log = findLog(cr, pspContract.interface, "UninstallationPrepared");
    if (!log) {
      throw new PluginUninstallationPreparationError();
    }
    const parsedLog = pspContract.interface.parseLog(log);
    const permissions = parsedLog.args["permissions"];
    if (!permissions) {
      throw new PluginUninstallationPreparationError();
    }
    yield {
      key: PrepareUninstallationSteps.DONE,
      permissions: permissions.map((permission: MultiTargetPermission) => ({
        operation: permission.operation,
        where: permission.where,
        who: permission.who,
        permissionId: permission.permissionId,
      })),
      pluginRepo: selectedInstallation.appliedPreparation.pluginRepo.id,
      pluginAddress: params.pluginAddress,
      versionTag: {
        build: selectedInstallation.appliedVersion.build,
        release: selectedInstallation.appliedVersion.release.release,
      },
    };
  }
  /**
   * Prepare update of a plugin
   *
   * @param {PrepareUpdateParams} params
   * @return {*}  {AsyncGenerator<PrepareUpdateStepValue>}
   * @memberof ClientMethods
   */
  public async *prepareUpdate(
    params: PrepareUpdateParams,
  ): AsyncGenerator<PrepareUpdateStepValue> {
    yield* prepareGenericUpdate(
      this.web3,
      this.graphql,
      {
        ...params,
        pluginSetupProcessorAddress: this.web3.getAddress(
          "pluginSetupProcessorAddress",
        ),
      },
    );
  }
  /**
   * Checks whether a role is granted by the current DAO's ACL settings
   *
   * @param {HasPermissionParams} params
   * @return {*}  {Promise<boolean>}
   * @memberof ClientMethods
   */
  public async hasPermission(params: HasPermissionParams): Promise<boolean> {
    await HasPermissionSchema.strict().validate(params);
    const provider = this.web3.getProvider();
    // connect to the managing dao
    const daoInstance = DAO__factory.connect(params.daoAddressOrEns, provider);
    return daoInstance.hasPermission(
      params.where,
      params.who,
      id(params.permission),
      params.data || new Uint8Array([]),
    );
  }
  /**
   * Retrieves metadata for DAO with given identifier (address or ens domain)
   *
   * @param {string} daoAddressOrEns
   * @return {*}  {(Promise<DaoDetails | null>)}
   * @memberof ClientMethods
   */
  public async getDao(daoAddressOrEns: string): Promise<DaoDetails | null> {
    await AddressOrEnsSchema.strict().validate(daoAddressOrEns);
    let address = daoAddressOrEns.toLowerCase();
    if (!isAddress(address)) {
      await this.web3.ensureOnline();
      const provider = this.web3.getProvider();
      if (!provider) {
        throw new NoProviderError();
      }
      try {
        const resolvedAddress = await provider.resolveName(address);
        if (!resolvedAddress) {
          throw new InvalidAddressOrEnsError();
        }
        address = resolvedAddress.toLowerCase();
      } catch (e) {
        throw new InvalidAddressOrEnsError(e);
      }
    }
    const query = QueryDao;
    const params = { address };
    const name = "DAO";
    type T = { dao: SubgraphDao };
    const { dao } = await this.graphql.request<T>({ query, params, name });
    if (!dao) {
      return null;
    } else if (!dao.metadata) {
      return toDaoDetails(
        dao,
        EMPTY_DAO_METADATA_LINK,
      );
    }
    try {
      const metadataCid = resolveIpfsCid(dao.metadata);
      const metadataString = await this.ipfs.fetchString(metadataCid);
      const metadata = JSON.parse(metadataString) as DaoMetadata;
      return toDaoDetails(dao, metadata);
    } catch (err) {
      if (err instanceof InvalidCidError) {
        return toDaoDetails(dao, UNSUPPORTED_DAO_METADATA_LINK);
      }
      return toDaoDetails(dao, UNAVAILABLE_DAO_METADATA);
    }
  }
  /**
   * Retrieves metadata for DAO with given identifier (address or ens domain)
   *
   * @param {DaoQueryParams} {
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
  }: DaoQueryParams): Promise<DaoListItem[]> {
    await DaoQuerySchema.strict().validate({
      limit,
      skip,
      direction,
      sortBy,
    });
    const query = QueryDaos;
    const params = {
      limit,
      skip,
      direction,
      sortBy,
    };
    const name = "DAOs";
    type T = { daos: SubgraphDaoListItem[] };
    const { daos } = await this.graphql.request<T>({ query, params, name });
    return Promise.all(
      daos.map(
        async (dao: SubgraphDaoListItem): Promise<DaoListItem> => {
          if (!dao.metadata) {
            return toDaoListItem(
              dao,
              EMPTY_DAO_METADATA_LINK,
            );
          }
          try {
            const metadataCid = resolveIpfsCid(dao.metadata);
            // Avoid blocking Promise.all if this individual fetch takes too long
            const stringMetadata = await promiseWithTimeout(
              this.ipfs.fetchString(metadataCid),
              MULTI_FETCH_TIMEOUT,
            );
            const metadata = JSON.parse(stringMetadata);
            return toDaoListItem(dao, metadata);
          } catch (err) {
            if (err instanceof InvalidCidError) {
              return toDaoListItem(dao, UNSUPPORTED_DAO_METADATA_LINK);
            }
            return toDaoListItem(dao, UNAVAILABLE_DAO_METADATA);
          }
        },
      ),
    );
  }
  /**
   * Retrieves the asset balances of the given DAO, by default, ETH, DAI, USDC and USDT on Mainnet
   *
   * @param {DaoBalancesQueryParams} {
   *     daoAddressOrEns,
   *     limit = 10,
   *     skip = 0,
   *     direction = SortDirection.ASC,
   *     sortBy = AssetBalanceSortBy.LAST_UPDATED,
   *   }
   * @return {*}  {(Promise<AssetBalance[] | null>)}
   * @memberof ClientMethods
   */
  public async getDaoBalances({
    daoAddressOrEns,
    limit = 10,
    skip = 0,
    direction = SortDirection.ASC,
    sortBy = AssetBalanceSortBy.LAST_UPDATED,
  }: DaoBalancesQueryParams): Promise<AssetBalance[] | null> {
    await DaoBalancesQuerySchema.strict().validate({
      daoAddressOrEns,
      limit,
      skip,
      direction,
      sortBy,
    });
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
      where = { dao: address.toLowerCase() };
    }
    const query = QueryTokenBalances;
    const params = {
      where,
      limit,
      skip,
      direction,
      sortBy,
    };
    const name = "dao balances";
    type T = { tokenBalances: SubgraphBalance[] };
    const { tokenBalances } = await this.graphql.request<T>({
      query,
      params,
      name,
    });
    if (tokenBalances.length === 0) {
      return [];
    }
    return tokenBalances.map(
      (balance: SubgraphBalance): AssetBalance => toAssetBalance(balance),
    );
  }
  /**
   * Retrieves the list of asset transfers to and from the given DAO (by default, from ETH, DAI, USDC and USDT, on Mainnet)
   *
   * @param {TransferQueryParams} {
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
  public async getDaoTransfers({
    daoAddressOrEns,
    type,
    limit = 10,
    skip = 0,
    direction = SortDirection.ASC,
    sortBy = TransferSortBy.CREATED_AT,
  }: TransferQueryParams): Promise<Transfer[] | null> {
    let where = {};
    let address = daoAddressOrEns;
    if (address) {
      if (!isAddress(address)) {
        await this.web3.ensureOnline();
        const provider = this.web3.getProvider();
        if (!provider) {
          throw new NoProviderError();
        }
        try {
          const resolvedAddress = await provider.resolveName(address);
          if (!resolvedAddress) {
            throw new InvalidAddressOrEnsError();
          }
          address = resolvedAddress;
        } catch (e) {
          throw new InvalidAddressOrEnsError(e);
        }
      }
      where = { dao: address.toLowerCase() };
    }
    if (type) {
      where = { ...where, type: SubgraphTransferTypeMap.get(type) };
    }
    const query = QueryTokenTransfers;
    const params = {
      where,
      limit,
      skip,
      direction,
      sortBy,
    };
    const name = "dao transfers";
    type T = { tokenTransfers: SubgraphTransferListItem[] };
    const { tokenTransfers } = await this.graphql.request<T>({
      query,
      params,
      name,
    });
    if (!tokenTransfers) {
      return null;
    }
    return tokenTransfers.map(
      (transfer: SubgraphTransferListItem): Transfer =>
        toTokenTransfer(transfer),
    );
  }

  /**
   * Retrieves the list of plugins available on the PluginRegistry
   *
   * @param {PluginQueryParams} {
   *     limit = 10,
   *     skip = 0,
   *     direction = SortDirection.ASC,
   *     sortBy = PluginSortBy.SUBDOMAIN,
   *     subdomain
   *   }
   * @return {*}  {(Promise<PluginRepo[] | null>)}
   * @memberof ClientMethods
   */
  public async getPlugins({
    limit = 10,
    skip = 0,
    direction = SortDirection.ASC,
    sortBy = PluginSortBy.SUBDOMAIN,
    subdomain,
  }: PluginQueryParams = {}): Promise<PluginRepoListItem[]> {
    await PluginQuerySchema.strict().validate({
      limit,
      skip,
      direction,
      sortBy,
      subdomain,
    });

    let where = {};
    if (subdomain) {
      where = { subdomain_contains_nocase: subdomain };
    }
    const query = QueryPlugins;
    const params = {
      where,
      limit,
      skip,
      direction,
      sortBy,
    };
    const name = "plugin repos";
    type T = { pluginRepos: SubgraphPluginRepoListItem[] };
    const { pluginRepos } = await this.graphql.request<T>({
      query,
      params,
      name,
    });
    return Promise.all(
      pluginRepos.map(
        async (
          pluginRepo: SubgraphPluginRepoListItem,
        ): Promise<PluginRepoListItem> => {
          let pluginRepoReleases: PluginRepoRelease[] = [];
          for (const release of pluginRepo.releases) {
            let metadata: PluginRepoReleaseMetadata;
            if (!release.metadata) {
              metadata = EMPTY_RELEASE_METADATA_LINK;
            } else {
              try {
                const metadataCid = resolveIpfsCid(release.metadata);
                // Avoid blocking Promise.all if this individual fetch takes too long
                const stringMetadata = await promiseWithTimeout(
                  this.ipfs.fetchString(metadataCid),
                  MULTI_FETCH_TIMEOUT,
                );
                const resolvedMetadata = JSON.parse(stringMetadata);
                metadata = resolvedMetadata;
              } catch (err) {
                metadata = UNAVAILABLE_RELEASE_METADATA;
                if (err instanceof InvalidCidError) {
                  metadata = UNSUPPORTED_RELEASE_METADATA_LINK;
                }
              }
            }
            pluginRepoReleases = [
              ...pluginRepoReleases,
              toPluginRepoRelease(release, metadata),
            ];
          }
          return toPluginRepoListItem(pluginRepo, pluginRepoReleases);
        },
      ),
    );
  }
  /**
   * Get plugin details given an address, release and build
   *
   * @param {string} pluginAddress
   * @return {*}  {Promise<PluginRepo>}
   * @memberof ClientMethods
   */
  public async getPlugin(pluginAddress: string): Promise<PluginRepo> {
    await AddressOrEnsSchema.strict().validate(pluginAddress);
    const name = "plugin version";
    const query = QueryPlugin;
    type T = { pluginRepo: SubgraphPluginRepo };
    const { pluginRepo } = await this.graphql.request<T>({
      query,
      params: { id: pluginAddress.toLowerCase() },
      name,
    });
    // get release metadata
    let releaseMetadata: PluginRepoReleaseMetadata;
    if (!pluginRepo.releases[0].metadata) {
      releaseMetadata = EMPTY_RELEASE_METADATA_LINK;
    } else {
      try {
        const metadataCid = resolveIpfsCid(pluginRepo.releases[0].metadata);
        const stringMetadata = await this.ipfs.fetchString(metadataCid);
        const resolvedMetadata = JSON.parse(stringMetadata);
        releaseMetadata = resolvedMetadata;
      } catch (err) {
        releaseMetadata = UNAVAILABLE_RELEASE_METADATA;
        if (err instanceof InvalidCidError) {
          releaseMetadata = UNSUPPORTED_RELEASE_METADATA_LINK;
        }
      }
    }
    // get build metadata
    let buildMetadata: PluginRepoBuildMetadata;
    if (!pluginRepo.releases[0].builds[0].metadata) {
      buildMetadata = EMPTY_BUILD_METADATA_LINK;
    } else {
      try {
        const metadataCid = resolveIpfsCid(
          pluginRepo.releases[0].builds[0].metadata,
        );
        const stringMetadata = await this.ipfs.fetchString(metadataCid);
        const resolvedMetadata = JSON.parse(stringMetadata);
        buildMetadata = resolvedMetadata;
      } catch (err) {
        buildMetadata = UNAVAILABLE_BUILD_METADATA;
        if (err instanceof InvalidCidError) {
          buildMetadata = UNSUPPORTED_BUILD_METADATA_LINK;
        }
      }
    }
    return toPluginRepo(pluginRepo, releaseMetadata, buildMetadata);
  }
  /**
   * Returns the protocol version of a contract
   * if the transaction fails returns [1,0,0]
   *
   * @param {string} contractAddress
   * @return {*}  {Promise<[number, number, number]>}
   * @memberof ClientMethods
   */
  public async getProtocolVersion(
    contractAddress: string,
  ): Promise<[number, number, number]> {
    await AddressOrEnsSchema.strict().validate(contractAddress);
    const provider = this.web3.getProvider();
    const protocolInstance = IProtocolVersion__factory.connect(
      contractAddress,
      provider,
    );
    let version: [number, number, number];
    try {
      version = await protocolInstance.protocolVersion();
    } catch (e) {
      // ethers5 throws an call exception error which could mean a lot of things
      // so this is not accurate
      version = [1, 0, 0];
    }
    return version;
  }

  public isDaoUpdateProposal(
    actions: DaoAction[],
  ): boolean {
    const initializeFromInterface = DAO__factory.createInterface()
      .getFunction("initializeFrom").format("minimal");
    return findAction(actions, initializeFromInterface) !== -1;
  }
  /**
   * Check if the specified actions try to update a plugin
   *
   * @param {DaoAction[]} actions
   * @return {*}  {boolean}
   * @memberof ClientMethods
   */
  public isPluginUpdateProposal(
    actions: DaoAction[],
  ): boolean {
    const applyUpdateInterface = PluginSetupProcessor__factory.createInterface()
      .getFunction("applyUpdate").format("minimal");
    return findAction(actions, applyUpdateInterface) !== -1;
  }

  /**
   * check if permission is root
   * check if permissionId is root
   * check if where is the dao address
   * check if who is the psp address
   *
   * @private
   * @param {(GrantPermissionDecodedParams | RevokePermissionDecodedParams)} params
   * @param {string} daoAddress
   * @return {*}  {boolean}
   * @memberof ClientMethods
   */
  private isPluginUpdatePermissionValid(
    params: GrantPermissionDecodedParams | RevokePermissionDecodedParams,
    daoAddress: string,
  ): boolean {
    const pspAddress = this.web3.getAddress("pluginSetupProcessorAddress");
    return (
      params.permission === Permissions.ROOT_PERMISSION &&
      params.permissionId === PermissionIds.ROOT_PERMISSION_ID &&
      params.where === daoAddress &&
      params.who === pspAddress
    );
  }

  /**
   * check if the plugin is installed
   * check if the plugin release is the same as the one installed
   * check if the plugin build is higher than the one installed
   * check if the plugin repo (pluginSetupRepo) exist
   * check if is one of the aragon plugin repos
   * check if the plugin repo metadata is valid
   * check if the plugin preparation exist
   * check if the plugin preparation data is valid
   *
   * @private
   * @param {string} daoAddress
   * @param {DecodedApplyUpdateParams} decodedApplyUpdateActionParams
   * @return {*}  {Promise<PluginUpdateProposalInValidityCause[]>}
   * @memberof ClientMethods
   */
  private async checkApplyUpdateActionInvalidityCauses(
    daoAddress: string,
    decodedApplyUpdateActionParams: DecodedApplyUpdateParams,
  ): Promise<PluginUpdateProposalInValidityCause[]> {
    const causes: PluginUpdateProposalInValidityCause[] = [];
    // get dao with plugins
    type U = { dao: SubgraphDao };
    const { dao } = await this.graphql.request<U>({
      query: QueryDao,
      params: { address: daoAddress },
      name: "dao",
    });
    // find the plugin with the same address
    const plugin = dao.plugins.find((plugin) =>
      plugin.appliedPreparation?.pluginAddress ===
        decodedApplyUpdateActionParams.pluginAddress
    );
    if (plugin) {
      // check release is the same as the one installed
      if (
        plugin.appliedVersion?.release.release !==
          decodedApplyUpdateActionParams.versionTag.release
      ) {
        causes.push(PluginUpdateProposalInValidityCause.INVALID_PLUGIN_RELEASE);
      }
      // check build is higher than the one installed
      if (
        !plugin.appliedVersion?.build ||
        plugin.appliedVersion?.build >=
          decodedApplyUpdateActionParams.versionTag.build
      ) {
        causes.push(PluginUpdateProposalInValidityCause.INVALID_PLUGIN_BUILD);
      }
    } else {
      causes.push(PluginUpdateProposalInValidityCause.PLUGIN_NOT_INSTALLED);
      return causes;
    }
    // check if plugin repo (pluginSetupRepo) exist
    type V = { pluginRepo: SubgraphPluginRepo };
    const { pluginRepo } = await this.graphql.request<V>({
      query: QueryPlugin,
      params: { id: decodedApplyUpdateActionParams.pluginRepo },
      name: "pluginRepo",
    });
    if (pluginRepo) {
      // check if is one of the aragon plugin repos
      if (
        !SupportedPluginRepoArray.includes(
          pluginRepo.subdomain as SupportedPluginRepo,
        )
      ) {
        causes.push(PluginUpdateProposalInValidityCause.NOT_ARAGON_PLUGIN_REPO);
      }
    } else {
      causes.push(PluginUpdateProposalInValidityCause.MISSING_PLUGIN_REPO);
      return causes;
    }

    // get the prepared setup id
    const preparedSetupId = getPreparedSetupId(
      decodedApplyUpdateActionParams,
      PreparationType.UPDATE,
    );
    // get plugin preparation
    type W = { pluginPreparation: SubgraphPluginUpdatePreparation };
    const { pluginPreparation } = await this.graphql.request<W>({
      query: QueryPluginPreparations,
      params: { where: { preparedSetupId } },
      name: "pluginPreparation",
    });
    if (pluginPreparation) {
      // get the metadata of the plugin repo
      // for the release and build specified
      const release = pluginRepo.releases.find((
        release: SubgraphPluginRepoRelease,
      ) =>
        release.release === decodedApplyUpdateActionParams.versionTag.release
      );
      const build = release?.builds.find((
        build: { build: number; metadata: string },
      ) => build.build === decodedApplyUpdateActionParams.versionTag.build);
      const metadataCid = build?.metadata;

      // fetch the metadata
      const metadata = await this.ipfs.fetchString(metadataCid!);
      const metadataJson = JSON.parse(metadata) as PluginRepoBuildMetadata;
      // get the update abi for the specified build
      const updateAbi = metadataJson.pluginSetup
        .prepareUpdate[decodedApplyUpdateActionParams.versionTag.build]?.inputs;
      if (updateAbi) {
        // if the abi exists try to decode the data
        try {
          if (
            decodedApplyUpdateActionParams.initData.length > 0 &&
            updateAbi.length === 0
          ) {
            throw new Error();
          }
          // if the decode does not throw an error the data is valid
          defaultAbiCoder.decode(
            getNamedTypesFromMetadata(updateAbi),
            decodedApplyUpdateActionParams.initData,
          );
        } catch {
          // if the decode throws an error the data is invalid
          causes.push(
            PluginUpdateProposalInValidityCause.INVALID_DATA,
          );
        }
      } else {
        causes.push(
          PluginUpdateProposalInValidityCause.INVALID_PLUGIN_REPO_METADATA,
        );
      }
    } else {
      causes.push(
        PluginUpdateProposalInValidityCause.MISSING_PLUGIN_PREPARATION,
      );
    }
    return causes;
  }

  /**
   * Check if the specified proposal id is valid for updating a plugin
   *
   * @param {string} proposalId
   * @return {*}  {Promise<PluginUpdateProposalValidity>}
   * @memberof ClientMethods
   */
  public async isPluginUpdateProposalValid(
    proposalId: string,
  ): Promise<PluginUpdateProposalValidity> {
    type T = { iproposal: SubgraphIProposal };
    const { iproposal } = await this.graphql.request<T>({
      query: QueryIProposal,
      params: { id: proposalId },
      name: "iproposal",
    });
    if (!iproposal) {
      throw new ProposalNotFoundError();
    }
    const causes: PluginUpdateProposalInValidityCause[] = [];
    if (iproposal.allowFailureMap !== "0") {
      causes.push(
        PluginUpdateProposalInValidityCause.INVALID_ALLOW_FAILURE_MAP,
      );
    }
    // get expected actions signatures
    const grantSignature = DAO__factory.createInterface().getFunction("grant")
      .format("minimal");
    const revokeSignature = DAO__factory.createInterface().getFunction("revoke")
      .format("minimal");
    const applyUpdateSignature = PluginSetupProcessor__factory.createInterface()
      .getFunction("applyUpdate").format("minimal");

    // find signatures in the actions specified in the proposal
    const daoActions = toDaoActions(iproposal.actions);
    const grantIndex = findAction(daoActions, grantSignature);
    const applyUpdateIndex = findAction(daoActions, applyUpdateSignature);
    const revokeIndex = findAction(daoActions, revokeSignature);

    // check that all actions are present and in the correct order
    if (
      [grantIndex, applyUpdateIndex, revokeIndex].includes(-1) ||
      grantIndex > applyUpdateIndex ||
      applyUpdateIndex > revokeIndex
    ) {
      causes.push(PluginUpdateProposalInValidityCause.INVALID_ACTIONS);
      return {
        isValid: causes.length === 0,
        causes,
      };
    }

    // check grant action
    if (
      !this.isPluginUpdatePermissionValid(
        decodeGrantAction(daoActions[grantIndex].data),
        iproposal.dao.id,
      )
    ) {
      causes.push(PluginUpdateProposalInValidityCause.INVALID_GRANT_PERMISSION);
    }

    // check revoke action
    if (
      !this.isPluginUpdatePermissionValid(
        decodeRevokeAction(daoActions[revokeIndex].data),
        iproposal.dao.id,
      )
    ) {
      causes.push(
        PluginUpdateProposalInValidityCause.INVALID_REVOKE_PERMISSION,
      );
    }

    // check apply update action
    const decodedApplyUpdateActionParams = decodeApplyUpdateAction(
      daoActions[applyUpdateIndex].data,
    );
    const applyUpdateCauses = await this.checkApplyUpdateActionInvalidityCauses(
      iproposal.dao.id,
      decodedApplyUpdateActionParams,
    );
    causes.push(...applyUpdateCauses);
    return {
      isValid: causes.length === 0,
      causes,
    };
  }

  public async isDaoUpdateProposalValid(
    params: IsDaoUpdateProposalValidParams,
  ): Promise<DaoUpdateProposalValidity> {
    type T = { iproposal: SubgraphIProposal };
    const { iproposal } = await this.graphql.request<T>({
      query: QueryIProposal,
      params: { id: params.proposalId },
      name: "iproposal",
    });
    if (!iproposal) {
      throw new ProposalNotFoundError();
    }
    const causes: DaoUpdateProposalInvalidityCause[] = [];
    // get initialize from signature
    const upgradeToAndCallSignature = DAO__factory.createInterface()
      .getFunction(
        "upgradeToAndCall",
      ).format("minimal");
    // find initialize from signature in the actions specified in the proposal
    const daoActions = toDaoActions(iproposal.actions);
    const upgradeToAndCallIndex = findAction(
      daoActions,
      upgradeToAndCallSignature,
    );
    // check that initialize from action is present
    if (upgradeToAndCallIndex === -1) {
      causes.push(DaoUpdateProposalInvalidityCause.INVALID_ACTIONS);
      return {
        isValid: causes.length === 0,
        causes,
      };
    }
    const decodedUpgradeToAndCallParams = decodeUpgradeToAndCallAction(
      daoActions[upgradeToAndCallIndex].data,
    );
    let decodedInitializeFromParams: DecodedInitializeFromParams;
    try {
      decodedInitializeFromParams = decodeInitializeFromAction(
        decodedUpgradeToAndCallParams.data,
      );
    } catch {
      causes.push(DaoUpdateProposalInvalidityCause.INVALID_ACTIONS);
      return { isValid: causes.length === 0, causes };
    }

    // check version
    if (
      !await this.isDaoUpdateVersionValid(
        iproposal.dao.id,
        decodedInitializeFromParams.previousVersion,
      )
    ) {
      causes.push(DaoUpdateProposalInvalidityCause.INVALID_VERSION);
    }
    // get version if not specified use the one from the dao factory address
    // in the context
    let upgradeToVersion = params.version;
    if (!upgradeToVersion) {
      upgradeToVersion = await this.getProtocolVersion(
        this.web3.getAddress("daoFactoryAddress"),
      );
    }
    // check implementation
    if (
      !await this.isDaoUpdateImplementationValid(
        upgradeToVersion.join(".") as SupportedVersion,
        decodedUpgradeToAndCallParams.implementationAddress,
      )
    ) {
      causes.push(DaoUpdateProposalInvalidityCause.INVALID_IMPLEMENTATION);
    }
    // check data
    if (!this.isDaoUpdateInitDataValid(decodedInitializeFromParams.initData)) {
      causes.push(DaoUpdateProposalInvalidityCause.INVALID_INIT_DATA);
    }
    return { isValid: causes.length === 0, causes };
  }

  /**
   * Check if the current version of the dao is the same as the specified version
   *
   * @private
   * @param {string} daoAddress
   * @param {[number, number, number]} specifiedVersion
   * @return {*}  {Promise<boolean>}
   * @memberof ClientMethods
   */
  private async isDaoUpdateVersionValid(
    daoAddress: string,
    specifiedVersion: [number, number, number],
  ): Promise<boolean> {
    // get the current version of the dao, so the result should not be the upgraded value
    const currentDaoVersion = await this.getProtocolVersion(daoAddress);
    // currentDao version should be equal to the previous version
    // because it references the version that the dao will be upgraded from
    // ex: if we want to upgrade from version 1.0.0 to 1.3.0
    // the previous version should be 1.0.0 and so should be the current dao version
    return JSON.stringify(currentDaoVersion) ===
      JSON.stringify(specifiedVersion);
  }

  /**
   * Check if the implementation address is the same as the one from the dao factory
   *
   * @private
   * @param {SupportedVersion} version
   * @param {string} implementationAddress
   * @return {*}  {Promise<boolean>}
   * @memberof ClientMethods
   */
  private async isDaoUpdateImplementationValid(
    version: SupportedVersion,
    implementationAddress: string,
  ): Promise<boolean> {
    const networkName = this.web3.getNetworkName();
    // The dao factory address holds the implementation address for each version
    // so we can check that the specified implementation address is the same
    // as the one from the dao factory
    const daoFactoryAddress =
      LIVE_CONTRACTS[version][networkName].daoFactoryAddress;
    const daoBase = await this.getDaoImplementation(daoFactoryAddress);
    return daoBase === implementationAddress;
  }

  /**
   * Check if the init data is valid for the specified version of the dao
   *
   * @param {IsDaoUpdateInitDataValidParams} params
   * @return {*}  {Promise<boolean>}
   * @memberof ClientMethods
   */
  private isDaoUpdateInitDataValid(
    data: Uint8Array,
    _version?: SupportedVersion,
  ): boolean {
    // TODO: decode the data using the abi from the the prepare update
    // for now the init data must be empty but this can change in the future
    // atm we cannot know the parameters for each version of the dao
    return data.length === 0;
  }

  /**
   *  Return the implementation address for the specified dao factory
   *
   * @param {string} daoFactoryAddress
   * @return {*}  {Promise<string>}
   * @memberof ClientMethods
   */
  public async getDaoImplementation(
    daoFactoryAddress: string,
  ): Promise<string> {
    const daoFactoryImplementation = DAOFactory__factory.connect(
      daoFactoryAddress,
      this.web3.getProvider(),
    );
    return daoFactoryImplementation.daoBase();
  }
}
