import {
  DAO__factory,
  DAOFactory,
  DAOFactory__factory,
  DAORegistry__factory,
  PluginRepo__factory,
  PluginSetupProcessor__factory,
} from "@aragon/osx-ethers";
import {
  AmountMismatchError,
  DaoCreationError,
  FailedDepositError,
  InstallationNotFoundError,
  InvalidAddressOrEnsError,
  InvalidCidError,
  InvalidEnsError,
  IpfsPinError,
  MissingExecPermissionError,
  NoProviderError,
  PluginUninstallationPreparationError,
  resolveIpfsCid,
  UpdateAllowanceError,
  UseTransferError,
} from "@aragon/sdk-common";

import { defaultAbiCoder } from "@ethersproject/abi";
import { BigNumber } from "@ethersproject/bignumber";
import { AddressZero } from "@ethersproject/constants";
import { Contract, ContractTransaction } from "@ethersproject/contracts";
import { erc20ContractAbi } from "../abi/erc20";
import {
  QueryDao,
  QueryDaos,
  QueryIPlugin,
  QueryPlugin,
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
  DepositParams,
  HasPermissionParams,
  PluginQueryParams,
  PluginRepo,
  PluginRepoBuildMetadata,
  PluginRepoListItem,
  PluginRepoRelease,
  PluginRepoReleaseMetadata,
  PluginSortBy,
  PrepareUninstallationParams,
  PrepareUninstallationSteps,
  PrepareUninstallationStepValue,
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
  SubgraphPluginInstallation,
  SubgraphPluginRepo,
  SubgraphPluginRepoListItem,
  SubgraphTransferListItem,
  SubgraphTransferTypeMap,
} from "../types";
import {
  toAssetBalance,
  toDaoDetails,
  toDaoListItem,
  toPluginRepo,
  toPluginRepoListItem,
  toPluginRepoRelease,
  toTokenTransfer,
  unwrapDepositParams,
} from "../utils";
import { isAddress } from "@ethersproject/address";
import { toUtf8Bytes } from "@ethersproject/strings";
import { id } from "@ethersproject/hash";
import {
  EMPTY_BUILD_METADATA_LINK,
  EMPTY_DAO_METADATA_LINK,
  EMPTY_RELEASE_METADATA_LINK,
  UNAVAILABLE_BUILD_METADATA,
  UNAVAILABLE_DAO_METADATA,
  UNAVAILABLE_RELEASE_METADATA,
  UNSUPPORTED_BUILD_METADATA_LINK,
  UNSUPPORTED_DAO_METADATA_LINK,
  UNSUPPORTED_RELEASE_METADATA_LINK,
} from "../constants";
import { IClientMethods } from "../interfaces";
import { PermissionIds } from "../../constants";
import {
  ClientCore,
  findLog,
  LIVE_CONTRACTS,
  MultiTargetPermission,
  prepareGenericInstallation,
  PrepareInstallationParams,
  PrepareInstallationStepValue,
  SortDirection,
  TokenType,
} from "@aragon/sdk-client-common";

/**
 * Methods module the SDK Generic Client
 */
export class ClientMethods extends ClientCore implements IClientMethods {
  public async *prepareInstallation(
    params: PrepareInstallationParams,
  ): AsyncGenerator<PrepareInstallationStepValue> {
    yield* prepareGenericInstallation(this.web3, params);
  }
  /**
   * Creates a DAO with the given settings and plugins
   *
   * @param {CreateDaoParams} params
   * @return {*}  {AsyncGenerator<DaoCreationStepValue>}
   * @memberof ClientMethods
   */
  public async *createDao(
    params: CreateDaoParams,
  ): AsyncGenerator<DaoCreationStepValue> {
    const signer = this.web3.getConnectedSigner();
    if (
      params.ensSubdomain && !params.ensSubdomain.match(/^[a-z0-9\-]+$/)
    ) {
      throw new InvalidEnsError();
    }

    const daoFactoryInstance = DAOFactory__factory.connect(
      this.web3.getDaoFactoryAddress(),
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
    const signer = this.web3.getConnectedSigner();

    if (params.type !== TokenType.NATIVE && params.type !== TokenType.ERC20) {
      throw new UseTransferError();
    }

    const [daoAddress, amount, tokenAddress, reference] = unwrapDepositParams(
      params,
    );

    if (tokenAddress && tokenAddress !== AddressZero) {
      // check current allowance
      const tokenInstance = new Contract(
        tokenAddress,
        erc20ContractAbi,
        signer,
      );
      const currentAllowance = await tokenInstance.allowance(
        await signer.getAddress(),
        daoAddress,
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
            spender: daoAddress,
            tokenAddress,
          },
        );
      }
    }

    // Doing the transfer
    const daoInstance = DAO__factory.connect(daoAddress, signer);
    const override: { value?: bigint } = {};

    if (tokenAddress === AddressZero) {
      // Ether
      override.value = amount;
    }

    const tx = await daoInstance.deposit(
      tokenAddress,
      amount,
      reference,
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
      erc20ContractAbi,
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
    const signer = this.web3.getConnectedSigner();
    const networkName = this.web3.getNetworkName();
    type T = {
      iplugin: { installations: SubgraphPluginInstallation[] };
    };
    const { iplugin } = await this.graphql.request<T>({
      query: QueryIPlugin,
      params: {
        address: params.pluginAddress.toLowerCase(),
        where: { dao: params.daoAddressOrEns },
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
      LIVE_CONTRACTS[networkName].pluginSetupProcessor,
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
   * Checks whether a role is granted by the current DAO's ACL settings
   *
   * @param {HasPermissionParams} params
   * @return {*}  {Promise<boolean>}
   * @memberof ClientMethods
   */
  public async hasPermission(params: HasPermissionParams): Promise<boolean> {
    const signer = this.web3.getConnectedSigner();
    // connect to the managing dao
    const daoInstance = DAO__factory.connect(params.daoAddressOrEns, signer);
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
    let address = daoAddressOrEns;
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
            const stringMetadata = await this.ipfs.fetchString(metadataCid);
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
    return Promise.all(
      tokenBalances.map(
        (balance: SubgraphBalance): AssetBalance => toAssetBalance(balance),
      ),
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
    return Promise.all(
      tokenTransfers.map(
        (transfer: SubgraphTransferListItem): Transfer =>
          toTokenTransfer(transfer),
      ),
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
                const stringMetadata = await this.ipfs.fetchString(metadataCid);
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
    const name = "plugin version";
    const query = QueryPlugin;
    type T = { pluginRepo: SubgraphPluginRepo };
    const { pluginRepo } = await this.graphql.request<T>({
      query,
      params: { id: pluginAddress },
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
}
