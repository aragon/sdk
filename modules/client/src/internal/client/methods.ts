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
  QueryPlugin,
  QueryPluginPreparations,
  QueryPluginPreparationsExtended,
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
  IsDaoUpdateValidParams,
  IsPluginUpdateValidParams,
  PluginPreparationListItem,
  PluginPreparationQueryParams,
  PluginPreparationSortBy,
  PluginQueryParams,
  PluginRepo,
  PluginRepoBuildMetadata,
  PluginRepoListItem,
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
  AllowedUpdateActions,
  ProposalActionTypes,
  SubgraphBalance,
  SubgraphDao,
  SubgraphDaoListItem,
  SubgraphPluginInstallation,
  SubgraphPluginPreparationListItem,
  SubgraphPluginRepo,
  SubgraphPluginRepoListItem,
  SubgraphPluginRepoRelease,
  SubgraphPluginUpdatePreparation,
  SubgraphTransferListItem,
  SubgraphTransferTypeMap,
} from "../types";
import {
  compareArrays,
  decodeApplyUpdateAction,
  decodeGrantAction,
  decodeInitializeFromAction,
  decodeRevokeAction,
  decodeUpgradeToAndCallAction,
  findActionIndex,
  getPreparedSetupId,
  toAssetBalance,
  toDaoDetails,
  toDaoListItem,
  toPluginPreparationListItem,
  toPluginRepo,
  toTokenTransfer,
} from "../utils";
import { isAddress } from "@ethersproject/address";
import { toUtf8Bytes } from "@ethersproject/strings";
import { id } from "@ethersproject/hash";
import {
  EMPTY_BUILD_METADATA_LINK,
  EMPTY_DAO_METADATA_LINK,
  EMPTY_RELEASE_METADATA_LINK,
  PLUGIN_UPDATE_ACTION_PATTERN,
  PLUGIN_UPDATE_WITH_ROOT_ACTION_PATTERN,
  PreparationType,
  SupportedPluginRepo,
  SupportedPluginRepoArray,
  UNAVAILABLE_BUILD_METADATA,
  UNAVAILABLE_DAO_METADATA,
  UNAVAILABLE_RELEASE_METADATA,
  UNSUPPORTED_BUILD_METADATA_LINK,
  UNSUPPORTED_DAO_METADATA_LINK,
  UNSUPPORTED_RELEASE_METADATA_LINK,
  UPDATE_PLUGIN_SIGNATURES,
} from "../constants";
import { IClientMethods } from "../interfaces";
import {
  AddressOrEnsSchema,
  AmountMismatchError,
  ClientCore,
  DaoAction,
  DaoCreationError,
  DecodedApplyUpdateParams,
  EmptyMultiUriError,
  FailedDepositError,
  findLog,
  getFunctionFragment,
  getNamedTypesFromMetadata,
  InstallationNotFoundError,
  InvalidActionError,
  InvalidAddressOrEnsError,
  InvalidCidError,
  IpfsPinError,
  LIVE_CONTRACTS,
  MissingExecPermissionError,
  MULTI_FETCH_TIMEOUT,
  MultiTargetPermission,
  NoProviderError,
  NotImplementedError,
  PermissionIds,
  PermissionOperationType,
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
  resolveIpfsCid,
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
  IsDaoUpdateValidSchema,
  IsPluginUpdateValidSchema,
  PluginPreparationQuerySchema,
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
        subdomain: params.ensSubdomain ?? "",
        metadata: toUtf8Bytes(params.metadataUri),
        daoURI: params.daoUri ?? "",
        trustedForwarder: params.trustedForwarder ?? AddressZero,
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
  private async getMetadata(
    ipfsUri: string,
  ) {
    const metadataCid = resolveIpfsCid(ipfsUri);
    const stringMetadata = await this.ipfs.fetchString(metadataCid);
    const resolvedMetadata = JSON.parse(stringMetadata);
    return resolvedMetadata;
  }

  private async getPluginRepo(
    pluginRepo: SubgraphPluginRepo,
  ): Promise<PluginRepo> {
    let releaseMetadata: PluginRepoReleaseMetadata;
    // releases are ordered son the index 0 will be the latest
    const releaseIpfsUri = pluginRepo?.releases[0]?.metadata;
    try {
      releaseMetadata = await this.getMetadata(releaseIpfsUri);
    } catch (err) {
      releaseMetadata = UNAVAILABLE_RELEASE_METADATA;
      if (err instanceof InvalidCidError) {
        releaseMetadata = UNSUPPORTED_RELEASE_METADATA_LINK;
      } else if (err instanceof EmptyMultiUriError) {
        releaseMetadata = EMPTY_RELEASE_METADATA_LINK;
      }
    }

    let buildMetadata: PluginRepoBuildMetadata;
    // builds are ordered son the index 0 will be the latest
    const buildIpfsUri = pluginRepo?.releases[0]?.builds[0]?.metadata;
    try {
      buildMetadata = await this.getMetadata(buildIpfsUri);
    } catch (err) {
      buildMetadata = UNAVAILABLE_BUILD_METADATA;
      if (err instanceof InvalidCidError) {
        buildMetadata = UNSUPPORTED_BUILD_METADATA_LINK;
      } else if (err instanceof EmptyMultiUriError) {
        buildMetadata = EMPTY_BUILD_METADATA_LINK;
      }
    }
    return toPluginRepo(pluginRepo, releaseMetadata, buildMetadata);
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
        (pluginRepo: SubgraphPluginRepoListItem) => {
          return this.getPluginRepo(pluginRepo);
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
    return this.getPluginRepo(pluginRepo);
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

  public isDaoUpdate(
    actions: DaoAction[],
  ): boolean {
    const initializeFromInterface = DAO__factory.createInterface()
      .getFunction("initializeFrom").format("minimal");
    return findActionIndex(actions, initializeFromInterface) !== -1;
  }
  /**
   * Check if the specified actions try to update a plugin
   *
   * @param {DaoAction[]} actions
   * @return {*}  {boolean}
   * @memberof ClientMethods
   */
  public isPluginUpdate(
    actions: DaoAction[],
  ): boolean {
    const applyUpdateInterface = PluginSetupProcessor__factory.createInterface()
      .getFunction("applyUpdate").format("minimal");
    return findActionIndex(actions, applyUpdateInterface) !== -1;
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
    permission: string,
    permissionId: string,
  ): boolean {
    const pspAddress = this.web3.getAddress("pluginSetupProcessorAddress");
    return (
      params.permission === permission &&
      params.permissionId === permissionId &&
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
   * The failure map should be checked before calling this method
   *
   * @param {DaoAction[]} actions
   * @return {*}  {Promise<PluginUpdateProposalValidity>}
   * @memberof ClientMethods
   */

  /**
   * Check that the failure map is all false -> cannot be checked because we receive tha actions, not the proposal id
   * Divide the proposal into blocks of actions, and then check them separately.
   * - UpgradeTo and upgradeToAndCall should only be in the first position of the list, this means that we can assume
   *   that the rest of the actions will be related to o one or multiple plugin updates.
   *   Michael:
   *
   *   This is required in case
   *    - there is a dependency (the new plugin version requires a specific DAO version, although the PluginSetup could theoretically check this)
   *    - the DAO update fixes a bug / exploit that could be triggered by a plugin setup being applied afterwards.
   *
   * - In the rest of cases we must follow a pattern checking.
   *   Since we are doing an update we should have at least 3 actions and up to 5 actions:
   *    - First action is always grant UPGRADE_PLUGIN_PERMISSION
   *    - Check third action, if its revoke UPGRADE_PLUGIN_PERMISSION, the middle one is an applyUpdate, if its an applyUpdate the middle one is a grant ROOT_PERMISSION
   *    - If third action is a revoke, check that the fourth and fifth are a revoke of ROOT_PERMISSION and a revoke of UPGRADE_PLUGIN_PERMISSION
   *
   * Check that the to in all actions are expected contracts (PSP, dao) anything else is invalid
   * Check that the value is 0 in all cases, this may change in the future, but for now is always 0
   * Filter all the actions and make sure that we only have the calls to expected methods (grant, revoke, upgradeToAndCall...)
   * ands that there is not any other action like withdraw or transfer
   * Pattern matching is needed grant/applyupdate/revoke => valid
   * Then do the proper checks for each group of actions depending on what you want to do,
   * for example checking a plugin upgrade should only receive the subset of actions related to that plugin upgrade
   * Checking that the ROOT_PERMISSION is granted if the permissions in the applyUpdate action are not empty
   */

  private validateGrantUpdatePluginPermissionAction(
    action: DaoAction,
    daoAddress: string,
  ): PluginUpdateProposalInValidityCause[] {
    const causes: PluginUpdateProposalInValidityCause[] = [];
    // check if the action is a grant permission
    if (action.value.toString() !== "0") {
      causes.push(
        PluginUpdateProposalInValidityCause.INVALID_GRANT_ACTION_VALUE,
      );
    }
    return causes;
  }
  private validateRevokeUpdatePluginPermissionAction(
    action: DaoAction,
  ): PluginUpdateProposalInValidityCause[] {
    return [];
  }
  private validateGrantRootPermissionAction(
    action: DaoAction,
  ): PluginUpdateProposalInValidityCause[] {
    return [];
  }
  private validateRevokeRootPermissionAction(
    action: DaoAction,
  ): PluginUpdateProposalInValidityCause[] {
    return [];
  }
  private validateApplyUpdateAction(
    action: DaoAction,
  ): PluginUpdateProposalInValidityCause[] {
    return [];
  }

  private isUpdateActionWithRootPermission(actions: DaoAction[]): boolean {
    return true;
  }

  private classifyProposalActions(actions: DaoAction[]): ProposalActionTypes[] {
    const classifiedActions: ProposalActionTypes[] = [];

    for (const action of actions) {
      try {
        let decodedPermission:
          | GrantPermissionDecodedParams
          | RevokePermissionDecodedParams;
        const func = getFunctionFragment(action.data, UPDATE_PLUGIN_SIGNATURES);
        switch (func.name) {
          case "upgradeTo":
            classifiedActions.push(ProposalActionTypes.UPGRADE_TO);
            break;
          case "upgradeToAndCall":
            classifiedActions.push(ProposalActionTypes.UPGRADE_TO_AND_CALL);
            break;
          case "grant":
            decodedPermission = decodeGrantAction(action.data);
            // check the permission that is being granted
            if (
              decodedPermission.permission ===
                Permissions.UPGRADE_PLUGIN_PERMISSION
            ) {
              classifiedActions.push(
                ProposalActionTypes.GRANT_PLUGIN_UPDATE_PERMISSION,
              );
            } else if (
              decodedPermission.permission === Permissions.ROOT_PERMISSION
            ) {
              classifiedActions.push(
                ProposalActionTypes.GRANT_ROOT_PERMISSION,
              );
            }
            break;
          case "revoke":
            decodedPermission = decodeRevokeAction(action.data);
            // check the permission that is being granted
            if (
              decodedPermission.permission ===
                Permissions.UPGRADE_PLUGIN_PERMISSION
            ) {
              classifiedActions.push(
                ProposalActionTypes.REVOKE_PLUGIN_UPGRADE_PERMISSION,
              );
            } else if (
              decodedPermission.permission === Permissions.ROOT_PERMISSION
            ) {
              classifiedActions.push(
                ProposalActionTypes.REVOKE_ROOT_PERMISSION,
              );
            }
            break;
          case "applyUpdate":
            classifiedActions.push(ProposalActionTypes.APPLY_UPDATE);
            break;
          default:
            classifiedActions.push(ProposalActionTypes.ACTION_NOT_ALLOWED);
            break;
        }
      } catch {
        classifiedActions.push(ProposalActionTypes.UNKNOWN);
      }
    }
    return classifiedActions;
  }
  private isPluginUpdateActionWithRootPermission(
    actions: ProposalActionTypes[],
  ): boolean {
    // get the first 4 actions
    const receivedPattern = actions.slice(0, 4);
    // check if it matches the expected pattern
    // length should be 5
    if (
      actions.length !== 5 ||
      !compareArrays(receivedPattern, PLUGIN_UPDATE_WITH_ROOT_ACTION_PATTERN)
    ) {
      return false;
    }
    return true;
  }
  private isPluginUpdateAction(actions: ProposalActionTypes[]): boolean {
    // get the first 3 actions
    const receivedPattern = actions.slice(0, 2);
    // check if it matches the expected pattern
    // length should be 3
    if (
      actions.length !== 3 ||
      !compareArrays(receivedPattern, PLUGIN_UPDATE_ACTION_PATTERN)
    ) {
      return false;
    }
    return true;
  }

  // private splitActionsAfterRevoke(
  //   actions: ProposalActionTypes[],
  // ): ProposalActionTypes[][] {
  //   const subArrays: ProposalActionTypes[][] = [];
  //   let count = 0;
  //   for (const action of actions) {
  //     subArrays[count].push(action);
  //     if (action === ProposalActionTypes.REVOKE) {
  //       count++;
  //     }
  //   }
  //   return subArrays;
  // }

  private validateUpdatePluginPermissionAction(
    action: DaoAction,
    daoAddress: string,
    operation: PermissionOperationType,
  ) {
    const causes: PluginUpdateProposalInValidityCause[] = [];
    const pspAddress = this.web3.getAddress("pluginSetupProcessorAddress");
    const decodedPermission = decodeGrantAction(action.data);
    if (decodedPermission.who !== pspAddress) {
      if (operation === PermissionOperationType.GRANT) {
        causes.push(
          PluginUpdateProposalInValidityCause
            .INVALID_GRANT_UPDATE_PREMISSION_WHO_ADDRESS,
        );
      } else {
        causes.push(
          PluginUpdateProposalInValidityCause
            .INVALID_REVOKE_UPDATE_PREMISSION_WHO_ADDRESS,
        );
      }
    }
    if (decodedPermission.where !== daoAddress) {
      if (operation === PermissionOperationType.GRANT) {
        causes.push(
          PluginUpdateProposalInValidityCause
            .INVALID_GRANT_UPDATE_PERMISSION_WHERE_ADDRESS,
        );
      } else {
        causes.push(
          PluginUpdateProposalInValidityCause
            .INVALID_REVOKE_UPDATE_PERMISSION_WHERE_ADDRESS,
        );
      }
    }
    if (action.value.toString() !== "0") {
      if (operation === PermissionOperationType.GRANT) {
        causes.push(
          PluginUpdateProposalInValidityCause
            .INVALID_GRANT_UPDATE_PERMISSION_VALUE,
        );
      } else {
        causes.push(
          PluginUpdateProposalInValidityCause
            .INVALID_REVOKE_UPDATE_PERMISSION_VALUE,
        );
      }
    }
    if (
      decodedPermission.permission !== Permissions.UPGRADE_PLUGIN_PERMISSION
    ) {
      if (operation === PermissionOperationType.GRANT) {
        causes.push(
          PluginUpdateProposalInValidityCause
            .INVALID_GRANT_UPDATE_PERMISSION_PERMISSION,
        );
      } else {
        causes.push(
          PluginUpdateProposalInValidityCause
            .INVALID_REVOKE_UPDATE_PERMISSION_PERMISSION,
        );
      }
    }
    if (
      decodedPermission.permissionId !== PermissionIds.UPGRADE_PLUGIN_PERMISSION_ID
    ) {
      if (operation === PermissionOperationType.GRANT) {
        causes.push(
          PluginUpdateProposalInValidityCause
            .INVALID_GRANT_UPDATE_PERMISSION_PERMISSION_ID,
        );
      } else {
        causes.push(
          PluginUpdateProposalInValidityCause
            .INVALID_REVOKE_UPDATE_PERMISSION_PERMISSION_ID,
        );
      }
    }
    return causes;
  }

  public isPluginUpdateValid(
    params: IsPluginUpdateValidParams,
  ): PluginUpdateProposalValidity {
    IsPluginUpdateValidSchema.strict().validate(params);
    let causes: PluginUpdateProposalInValidityCause[] = [];
    const { actions, daoAddress } = params;
    const classifiedActions = this.classifyProposalActions(params.actions);
    if (this.isPluginUpdateAction(classifiedActions)) {
      //
      for (const [index, action] of classifiedActions.entries()) {
        switch (action) {
          case ProposalActionTypes.GRANT_PLUGIN_UPDATE_PERMISSION:
            causes.concat(
              this.validateUpdatePluginPermissionAction(
                actions[index],
                daoAddress,
                PermissionOperationType.GRANT,
              )
            );
            break;
          case ProposalActionTypes.REVOKE_PLUGIN_UPGRADE_PERMISSION:
            causes.concat(
              this.validateUpdatePluginPermissionAction(
                actions[index],
                daoAddress,
                PermissionOperationType.REVOKE,
              )
            );
            break;
          case ProposalActionTypes.APPLY_UPDATE:
            this.validateApplyUpdateAction(actions[index], daoAddress);
            break;
        }
      }
    } else if (this.isPluginUpdateActionWithRootPermission(classifiedActions)) {
      for (const [index, action] of classifiedActions.entries()) {
        switch (action) {
          case ProposalActionTypes.GRANT_PLUGIN_UPDATE_PERMISSION:
          case ProposalActionTypes.REVOKE_PLUGIN_UPGRADE_PERMISSION:
            this.validateUpdatePluginPermissionAction(actions[index]);
            break;
          case ProposalActionTypes.GRANT_ROOT_PERMISSION:
          case ProposalActionTypes.REVOKE_ROOT_PERMISSION:
            this.validateRootPermissionAction(actions[index]);
            break;
          case ProposalActionTypes.APPLY_UPDATE:
            this.validateApplyUpdateAction(actions[index], daoAddress);
            break;
        }
      }
    } else {
      return {
        isValid: false,
        causes: [PluginUpdateProposalInValidityCause.INVALID_ACTIONS],
      };
    }

    // let { actions, daoAddress } = params;
    // if (actions.length < 3) {
    //   return {
    //     isValid: false,
    //     causes: [PluginUpdateProposalInValidityCause.INVALID_ACTIONS],
    //   };
    // }
    // // check if the first action is an upgradeTo or upgradeToAndCall
    // if (this.isDaoUpdate([params.actions[0]])) {
    //   // if it is a dao update remove the first action and continue
    //   // with the rest of the actions
    //   actions = params.actions.slice(1);
    // }
    // // declare available function signatures
    // const grantSignature = DAO__factory.createInterface().getFunction("grant")
    //   .format("minimal");
    // const revokeSignature = DAO__factory.createInterface().getFunction("revoke")
    //   .format("minimal");

    // const grantUpdateIndex = findActionIndex(actions, grantSignature);

    // if (grantUpdateIndex !== 0) {
    //   return {
    //     isValid: false,
    //     causes: [PluginUpdateProposalInValidityCause.INVALID_ACTIONS],
    //   };
    // }

    // const revokeUpdateIndex = findActionIndex(actions, revokeSignature);

    // // revoke should be in the third or fifth position of the list
    // let grantUpdatePluginPermissionInvalidityCauses:
    //     PluginUpdateProposalInValidityCause[] = [],
    //   applyUpdateInvalidityCauses: PluginUpdateProposalInValidityCause[] = [],
    //   grantRootInvalidityCauses: PluginUpdateProposalInValidityCause[] = [],
    //   revokeRootInvalidityCauses: PluginUpdateProposalInValidityCause[] = [],
    //   revokeUpdatePluginPermissionInvalidityCauses:
    //     PluginUpdateProposalInValidityCause[] = [];

    // switch (revokeUpdateIndex) {
    //   case 2:
    //     // we can assume that the middle one is an applyUpdate
    //     grantUpdatePluginPermissionInvalidityCauses = this
    //       .validateGrantUpdatePluginPermissionAction(actions[0], daoAddress);
    //     applyUpdateInvalidityCauses = this.validateApplyUpdateAction(
    //       actions[1],
    //     );
    //     revokeUpdatePluginPermissionInvalidityCauses = this
    //       .validateGrantUpdatePluginPermissionAction(actions[2]);
    //     actions = actions.slice(3);
    //     break;
    //   case 4:
    //     grantUpdatePluginPermissionInvalidityCauses = this
    //       .validateGrantUpdatePluginPermissionAction(actions[0]);
    //     grantRootInvalidityCauses = this.validateApplyUpdateAction(
    //       actions[1],
    //     );
    //     applyUpdateInvalidityCauses = this.validateApplyUpdateAction(
    //       actions[2],
    //     );
    //     revokeRootInvalidityCauses = this.validateApplyUpdateAction(
    //       actions[3],
    //     );
    //     applyUpdateInvalidityCauses = this.validateApplyUpdateAction(
    //       actions[4],
    //     );
    //     revokeUpdatePluginPermissionInvalidityCauses = this
    //       .validateGrantUpdatePluginPermissionAction(actions[4]);
    //     actions = actions.slice(5);
    //     break;
    //   default:
    //     return {
    //       isValid: false,
    //       causes: [PluginUpdateProposalInValidityCause.INVALID_ACTIONS],
    //     };
    // }

    // let causes: PluginUpdateProposalInValidityCause[] = [
    //   ...grantUpdatePluginPermissionInvalidityCauses,
    //   ...applyUpdateInvalidityCauses,
    //   ...revokeUpdatePluginPermissionInvalidityCauses,
    //   ...grantRootInvalidityCauses,
    //   ...revokeRootInvalidityCauses,
    // ];
    // if (actions.length > 0) {
    //   causes = [
    //     ...this.isPluginUpdateValid({
    //       daoAddress: params.daoAddress,
    //       actions,
    //     }).causes,
    //     ...causes,
    //   ];
    // }
    // return {
    //   isValid: true,
    //   causes,
    // };

    // const causes: PluginUpdateProposalInValidityCause[] = [];
    // // get expected actions signatures

    // // find signatures in the actions specified in the proposal
    // const grantIndex = findActionIndex(params.actions, grantSignature);
    // const applyUpdateIndex = findActionIndex(
    //   params.actions,
    //   applyUpdateSignature,
    // );
    // const revokeIndex = findActionIndex(params.actions, revokeSignature);

    // // check that all actions are present and in the correct order
    // if (
    //   [grantIndex, applyUpdateIndex, revokeIndex].includes(-1) ||
    //   grantIndex > applyUpdateIndex ||
    //   applyUpdateIndex > revokeIndex
    // ) {
    //   causes.push(PluginUpdateProposalInValidityCause.INVALID_ACTIONS);
    //   return {
    //     isValid: causes.length === 0,
    //     causes,
    //   };
    // }

    // // check grant action
    // if (
    //   !this.isPluginUpdatePermissionValid(
    //     decodeGrantAction(params.actions[grantIndex].data),
    //     params.daoAddress,
    //   )
    // ) {
    //   causes.push(PluginUpdateProposalInValidityCause.INVALID_GRANT_PERMISSION);
    // }

    // // check revoke action
    // if (
    //   !this.isPluginUpdatePermissionValid(
    //     decodeRevokeAction(params.actions[revokeIndex].data),
    //     params.daoAddress,
    //   )
    // ) {
    //   causes.push(
    //     PluginUpdateProposalInValidityCause.INVALID_REVOKE_PERMISSION,
    //   );
    // }

    // // check apply update action
    // const decodedApplyUpdateActionParams = decodeApplyUpdateAction(
    //   params.actions[applyUpdateIndex].data,
    // );
    // const applyUpdateCauses = await this.checkApplyUpdateActionInvalidityCauses(
    //   params.daoAddress,
    //   decodedApplyUpdateActionParams,
    // );
    // causes.push(...applyUpdateCauses);
    // return {
    //   isValid: causes.length === 0,
    //   causes,
    // };
  }
  /**
   * Check if the specified actions are valid for updating a dao
   * The failure map should be checked before calling this method
   *
   * @param {IsDaoUpdateValidParams} params
   * @return {*}  {Promise<DaoUpdateProposalValidity>}
   * @memberof ClientMethods
   */
  public async isDaoUpdateValid(
    params: IsDaoUpdateValidParams,
  ): Promise<DaoUpdateProposalValidity> {
    await IsDaoUpdateValidSchema.strict().validate(params);
    const causes: DaoUpdateProposalInvalidityCause[] = [];
    // get initialize from signature
    const upgradeToAndCallSignature = DAO__factory.createInterface()
      .getFunction(
        "upgradeToAndCall",
      ).format("minimal");
    const upgradeToAndCallIndex = findActionIndex(
      params.actions,
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
      params.actions[upgradeToAndCallIndex].data,
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
        params.daoAddress,
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

  public async getPluginPreparations(
    {
      type,
      pluginAddress,
      pluginRepoAddress,
      daoAddressOrEns,
      limit = 10,
      skip = 0,
      direction = SortDirection.ASC,
      sortBy = PluginPreparationSortBy.ID,
    }: PluginPreparationQueryParams,
  ): Promise<PluginPreparationListItem[]> {
    await PluginPreparationQuerySchema.strict().validate({
      type,
      pluginAddress,
      pluginRepoAddress,
      daoAddressOrEns,
      limit,
      skip,
      direction,
      sortBy,
    });

    let where = {};
    if (type) {
      where = { ...where, type };
    }
    if (pluginAddress) {
      where = { ...where, pluginAddress: pluginAddress.toLowerCase() };
    }
    if (pluginRepoAddress) {
      where = { ...where, pluginRepo: pluginRepoAddress.toLowerCase() };
    }
    if (daoAddressOrEns) {
      where = { ...where, dao: daoAddressOrEns.toLowerCase() };
    }
    const query = QueryPluginPreparationsExtended;
    const params = {
      where,
      limit,
      skip,
      direction,
      sortBy,
    };
    const name = "plugin preparations";
    type T = { pluginPreparations: SubgraphPluginPreparationListItem[] };
    const { pluginPreparations } = await this.graphql.request<T>({
      query,
      params,
      name,
    });
    return Promise.all(
      pluginPreparations.map(
        (pluginPreparation: SubgraphPluginPreparationListItem) => {
          return toPluginPreparationListItem(pluginPreparation);
        },
      ),
    );
  }
}
