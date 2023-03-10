import { isAddress } from "@ethersproject/address";
import {
  boolArrayToBitmap,
  decodeProposalId,
  decodeRatio,
  encodeProposalId,
  getExtendedProposalId,
  InvalidAddressError,
  InvalidAddressOrEnsError,
  InvalidCidError,
  InvalidProposalIdError,
  IpfsPinError,
  isProposalId,
  NoProviderError,
  NoSignerError,
  PluginInstallationPreparationError,
  ProposalCreationError,
  resolveIpfsCid,
  UnsupportedNetworkError,
} from "@aragon/sdk-common";
import {
  CanVoteParams,
  ClientCore,
  computeProposalStatusFilter,
  ContextPlugin,
  CreateMajorityVotingProposalParams,
  ExecuteProposalStep,
  ExecuteProposalStepValue,
  findLog,
  IProposalQueryParams,
  IVoteProposalParams,
  PrepareInstallationStep,
  PrepareInstallationStepValue,
  ProposalCreationSteps,
  ProposalCreationStepValue,
  ProposalMetadata,
  ProposalSortBy,
  SortDirection,
  SubgraphMembers,
  SubgraphVotingSettings,
  SupportedNetworks,
  SupportedNetworksArray,
  VersionTag,
  VoteProposalStep,
  VoteProposalStepValue,
  VotingSettings,
} from "../../../client-common";
import {
  Erc20TokenDetails,
  Erc721TokenDetails,
  ITokenVotingClientMethods,
  SubgraphContractType,
  SubgraphErc20Token,
  SubgraphErc721Token,
  SubgraphTokenVotingProposal,
  SubgraphTokenVotingProposalListItem,
  TokenVotingPluginPrepareInstallationParams,
  TokenVotingProposal,
  TokenVotingProposalListItem,
} from "../../interfaces";
import {
  QueryTokenVotingMembers,
  QueryTokenVotingPlugin,
  QueryTokenVotingProposal,
  QueryTokenVotingProposals,
  QueryTokenVotingSettings,
} from "../graphql-queries";
import { toTokenVotingProposal, toTokenVotingProposalListItem } from "../utils";
import {
  PluginRepo__factory,
  PluginSetupProcessor__factory,
  TokenVoting__factory,
} from "@aragon/osx-ethers";
import { toUtf8Bytes } from "@ethersproject/strings";
import {
  EMPTY_PROPOSAL_METADATA_LINK,
  LIVE_CONTRACTS,
  UNAVAILABLE_PROPOSAL_METADATA,
  UNSUPPORTED_PROPOSAL_METADATA_LINK,
} from "../../../client-common/constants";
import { TokenType } from "../../../interfaces";
import { TokenVotingClientEncoding } from "./encoding";
/**
 * Methods module the SDK TokenVoting Client
 */
export class TokenVotingClientMethods extends ClientCore
  implements ITokenVotingClientMethods {
  constructor(context: ContextPlugin) {
    super(context);
    Object.freeze(TokenVotingClientMethods.prototype);
    Object.freeze(this);
  }
  /**
   * Creates a new proposal on the given TokenVoting plugin contract
   *
   * @param {CreateMajorityVotingProposalParams} params
   * @return {*}  {AsyncGenerator<ProposalCreationStepValue>}
   * @memberof TokenVotingClient
   */
  public async *createProposal(
    params: CreateMajorityVotingProposalParams,
  ): AsyncGenerator<ProposalCreationStepValue> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new NoSignerError();
    } else if (!signer.provider) {
      throw new NoProviderError();
    }

    const tokenVotingContract = TokenVoting__factory.connect(
      params.pluginAddress,
      signer,
    );

    if (
      params.failSafeActions?.length &&
      params.failSafeActions.length !== params.actions?.length
    ) {
      throw new Error(
        "Size mismatch: actions and failSafeActions should match",
      );
    }
    const allowFailureMap = boolArrayToBitmap(params.failSafeActions);

    const startTimestamp = params.startDate?.getTime() || 0;
    const endTimestamp = params.endDate?.getTime() || 0;

    const tx = await tokenVotingContract.createProposal(
      toUtf8Bytes(params.metadataUri),
      params.actions || [],
      allowFailureMap,
      Math.round(startTimestamp / 1000),
      Math.round(endTimestamp / 1000),
      params.creatorVote || 0,
      params.executeOnPass || false,
    );

    yield {
      key: ProposalCreationSteps.CREATING,
      txHash: tx.hash,
    };

    const receipt = await tx.wait();
    const tokenVotingContractInterface = TokenVoting__factory.createInterface();
    const log = findLog(
      receipt,
      tokenVotingContractInterface,
      "ProposalCreated",
    );
    if (!log) {
      throw new ProposalCreationError();
    }

    const parsedLog = tokenVotingContractInterface.parseLog(log);
    const proposalId = parsedLog.args["proposalId"];
    if (!proposalId) {
      throw new ProposalCreationError();
    }

    yield {
      key: ProposalCreationSteps.DONE,
      proposalId: encodeProposalId(params.pluginAddress, Number(proposalId)),
    };
  }

  /**
   * Pins a metadata object into IPFS and retruns the generated hash
   *
   * @param {ProposalMetadata} params
   * @return {*}  {Promise<string>}
   * @memberof ClientMethods
   */
  public async pinMetadata(params: ProposalMetadata): Promise<string> {
    try {
      const cid = await this.ipfs.add(JSON.stringify(params));
      await this.ipfs.pin(cid);
      return `ipfs://${cid}`;
    } catch {
      throw new IpfsPinError();
    }
  }
  /**
   * Cast a vote on the given proposal using the client's wallet. Depending on the proposal settings, an affirmative vote may execute the proposal's actions on the DAO.
   *
   * @param {IVoteProposalParams} params
   * @param {VoteValues} vote
   * @return {*}  {AsyncGenerator<VoteProposalStepValue>}
   * @memberof TokenVotingClient
   */
  public async *voteProposal(
    params: IVoteProposalParams,
  ): AsyncGenerator<VoteProposalStepValue> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new NoSignerError();
    } else if (!signer.provider) {
      throw new NoProviderError();
    }

    const { pluginAddress, id } = decodeProposalId(params.proposalId);

    const tokenVotingContract = TokenVoting__factory.connect(
      pluginAddress,
      signer,
    );

    const tx = await tokenVotingContract.vote(
      id,
      params.vote,
      false,
    );

    yield {
      key: VoteProposalStep.VOTING,
      txHash: tx.hash,
    };
    await tx.wait();
    yield {
      key: VoteProposalStep.DONE,
    };
  }
  /**
   * Executes the given proposal, provided that it has already passed
   *
   * @param {string} proposalId
   * @return {*}  {AsyncGenerator<ExecuteProposalStepValue>}
   * @memberof TokenVotingClient
   */
  public async *executeProposal(
    proposalId: string,
  ): AsyncGenerator<ExecuteProposalStepValue> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new NoSignerError();
    } else if (!signer.provider) {
      throw new NoProviderError();
    }

    const { pluginAddress, id } = decodeProposalId(proposalId);

    const tokenVotingContract = TokenVoting__factory.connect(
      pluginAddress,
      signer,
    );
    const tx = await tokenVotingContract.execute(id);

    yield {
      key: ExecuteProposalStep.EXECUTING,
      txHash: tx.hash,
    };
    await tx.wait();
    yield {
      key: ExecuteProposalStep.DONE,
    };
  }

  /**
   * Prepares the installation of a token voting plugin in a given dao
   *
   * @param {TokenVotingPluginPrepareInstallationParams} params
   * @return {*}  {AsyncGenerator<PrepareInstallationStepValue>}
   * @memberof TokenVotingClientMethods
   */
  public async *prepareInstallation(
    params: TokenVotingPluginPrepareInstallationParams,
  ): AsyncGenerator<PrepareInstallationStepValue> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new NoSignerError();
    } else if (!signer.provider) {
      throw new NoProviderError();
    }
    const network = await signer.provider.getNetwork();
    const networkName = network.name as SupportedNetworks;
    if (!SupportedNetworksArray.includes(networkName)) {
      throw new UnsupportedNetworkError(networkName);
    }
    // connect to psp contract
    const pspContract = PluginSetupProcessor__factory.connect(
      LIVE_CONTRACTS[networkName].pluginSetupProcessor,
      signer,
    );
    // connect to plugin repo
    const tokenVotingRepoContract = PluginRepo__factory.connect(
      LIVE_CONTRACTS[networkName].tokenVotingRepo,
      signer,
    );
    // use specified version or latest
    let versionTag: VersionTag | undefined = params.versionTag;
    if (!params.versionTag) {
      const latestVersion = await tokenVotingRepoContract
        ["getLatestVersion(address)"](
          LIVE_CONTRACTS[networkName].tokenVotingSetup,
        );
      versionTag = {
        build: latestVersion.tag.build,
        release: latestVersion.tag.release,
      };
    }
    // get install data
    const tokenVotingPluginInstallItem = TokenVotingClientEncoding
      .getPluginInstallItem(params.settings, networkName);
    // execute prepareInstallationon
    const tx = await pspContract.prepareInstallation(
      params.daoAddressOrEns,
      {
        pluginSetupRef: {
          pluginSetupRepo: LIVE_CONTRACTS[networkName].tokenVotingRepo,
          versionTag: versionTag!
        },
        data: tokenVotingPluginInstallItem.data,
      },
    );

    yield {
      key: PrepareInstallationStep.PREPARING,
      txHash: tx.hash,
    };

    const receipt = await tx.wait();
    const pspContractInterface = PluginSetupProcessor__factory
      .createInterface();
    const log = findLog(
      receipt,
      pspContractInterface,
      "InstallationPrepared",
    );
    if (!log) {
      throw new PluginInstallationPreparationError();
    }

    const parsedLog = pspContractInterface.parseLog(log);
    const pluginAddress = parsedLog.args["plugin"];
    const preparedSetupData = parsedLog.args["preparedSetupData"];
    if (!(pluginAddress || preparedSetupData)) {
      throw new PluginInstallationPreparationError();
    }
    yield {
      key: PrepareInstallationStep.DONE,
      pluginAddress,
      pluginRepo: LIVE_CONTRACTS[networkName].tokenVotingRepo,
      versionTag: versionTag!,
      permissions: preparedSetupData.permissions,
      helpers: preparedSetupData.helpers,
    };
  }

  /**
   * Checks if an user can vote in a proposal
   *
   * @param {CanVoteParams} params
   * @returns {*}  {Promise<boolean>}
   */
  public async canVote(params: CanVoteParams): Promise<boolean> {
    const signer = this.web3.getConnectedSigner();
    if (!signer.provider) {
      throw new NoProviderError();
    } else if (!isAddress(params.voterAddressOrEns)) {
      throw new InvalidAddressError();
    }

    const { pluginAddress, id } = decodeProposalId(params.proposalId);

    const tokenVotingContract = TokenVoting__factory.connect(
      pluginAddress,
      signer,
    );
    return tokenVotingContract.callStatic.canVote(
      id,
      params.voterAddressOrEns,
      params.vote,
    );
  }

  /**
   * Checks whether the current proposal can be executed
   *
   * @param {string} proposalId
   * @return {*}  {Promise<boolean>}
   * @memberof TokenVotingClientMethods
   */
  public async canExecute(
    proposalId: string,
  ): Promise<boolean> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new NoSignerError();
    } else if (!signer.provider) {
      throw new NoProviderError();
    }

    const { pluginAddress, id } = decodeProposalId(proposalId);

    const tokenVotingContract = TokenVoting__factory.connect(
      pluginAddress,
      signer,
    );

    return tokenVotingContract.canExecute(id);
  }
  /**
   * Returns the list of wallet addresses holding tokens from the underlying Token contract used by the plugin
   *
   * @async
   * @param {string} pluginAddress
   * @return {*}  {Promise<string[]>}
   * @memberof TokenVotingClient
   */
  public async getMembers(pluginAddress: string): Promise<string[]> {
    if (!isAddress(pluginAddress)) {
      throw new InvalidAddressError();
    }
    const query = QueryTokenVotingMembers;
    const params = {
      address: pluginAddress.toLowerCase(),
    };
    const name = "TokenVoting members";
    type T = { tokenVotingPlugin: SubgraphMembers };
    const { tokenVotingPlugin } = await this.graphql.request<T>({
      query,
      params,
      name,
    });
    return tokenVotingPlugin.members.map((
      member: { address: string },
    ) => member.address);
  }

  /**
   * Returns the details of the given proposal
   *
   * @param {string} proposalId
   * @return {*}  {Promise<TokenVotingProposal>}
   * @memberof TokenVotingClient
   */
  public async getProposal(
    proposalId: string,
  ): Promise<TokenVotingProposal | null> {
    if (!isProposalId(proposalId)) {
      throw new InvalidProposalIdError();
    }
    const extendedProposalId = getExtendedProposalId(proposalId);
    const query = QueryTokenVotingProposal;
    const params = {
      proposalId: extendedProposalId,
    };
    const name = "TokenVoting proposal";
    type T = { tokenVotingProposal: SubgraphTokenVotingProposal };
    const { tokenVotingProposal } = await this.graphql.request<T>({
      query,
      params,
      name,
    });
    if (!tokenVotingProposal) {
      return null;
    } else if (!tokenVotingProposal.metadata) {
      return toTokenVotingProposal(
        tokenVotingProposal,
        EMPTY_PROPOSAL_METADATA_LINK,
      );
    }
    // format in the metadata field
    try {
      const metadataCid = resolveIpfsCid(tokenVotingProposal.metadata);
      const metadataString = await this.ipfs.fetchString(metadataCid);
      const metadata = JSON.parse(metadataString) as ProposalMetadata;
      return toTokenVotingProposal(tokenVotingProposal, metadata);
      // TODO: Parse and validate schema
    } catch (err) {
      if (err instanceof InvalidCidError) {
        return toTokenVotingProposal(
          tokenVotingProposal,
          UNSUPPORTED_PROPOSAL_METADATA_LINK,
        );
      }
      return toTokenVotingProposal(
        tokenVotingProposal,
        UNAVAILABLE_PROPOSAL_METADATA,
      );
    }
  }
  /**
   * Returns a list of proposals on the Plugin, filtered by the given criteria
   *
   * @param {IProposalQueryParams} params
   * @return {*}  {Promise<TokenVotingProposalListItem[]>}
   * @memberof TokenVotingClient
   */
  public async getProposals({
    daoAddressOrEns,
    limit = 10,
    status,
    skip = 0,
    direction = SortDirection.ASC,
    sortBy = ProposalSortBy.CREATED_AT,
  }: IProposalQueryParams): Promise<TokenVotingProposalListItem[]> {
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
    if (status) {
      where = { ...where, ...computeProposalStatusFilter(status) };
    }
    const query = QueryTokenVotingProposals;
    const params = {
      where,
      limit,
      skip,
      direction,
      sortBy,
    };
    const name = "TokenVoting proposals";
    type T = { tokenVotingProposals: SubgraphTokenVotingProposalListItem[] };
    const { tokenVotingProposals } = await this.graphql.request<T>({
      query,
      params,
      name,
    });
    await this.ipfs.ensureOnline();
    return Promise.all(
      tokenVotingProposals.map(
        async (
          proposal: SubgraphTokenVotingProposalListItem,
        ): Promise<TokenVotingProposalListItem> => {
          // format in the metadata field
          if (!proposal.metadata) {
            return toTokenVotingProposalListItem(
              proposal,
              EMPTY_PROPOSAL_METADATA_LINK,
            );
          }
          try {
            const metadataCid = resolveIpfsCid(proposal.metadata);
            const stringMetadata = await this.ipfs.fetchString(metadataCid);
            const metadata = JSON.parse(stringMetadata) as ProposalMetadata;
            return toTokenVotingProposalListItem(proposal, metadata);
          } catch (err) {
            if (err instanceof InvalidCidError) {
              return toTokenVotingProposalListItem(
                proposal,
                UNSUPPORTED_PROPOSAL_METADATA_LINK,
              );
            }
            return toTokenVotingProposalListItem(
              proposal,
              UNAVAILABLE_PROPOSAL_METADATA,
            );
          }
        },
      ),
    );
  }

  /**
   * Returns the settings of a plugin given the address of the plugin instance
   *
   * @param {string} pluginAddress
   * @return {*}  {Promise<VotingSettings>}
   * @memberof TokenVotingClient
   */
  public async getVotingSettings(
    pluginAddress: string,
  ): Promise<VotingSettings | null> {
    if (!isAddress(pluginAddress)) {
      throw new InvalidAddressError();
    }
    const query = QueryTokenVotingSettings;
    const params = {
      address: pluginAddress.toLowerCase(),
    };
    const name = "TokenVoting settings";
    type T = { tokenVotingPlugin: SubgraphVotingSettings };
    const { tokenVotingPlugin } = await this.graphql.request<T>({
      query,
      params,
      name,
    });
    if (!tokenVotingPlugin) {
      return null;
    }
    return {
      minDuration: parseInt(tokenVotingPlugin.minDuration),
      supportThreshold: decodeRatio(
        BigInt(tokenVotingPlugin.supportThreshold),
        6,
      ),
      minParticipation: decodeRatio(
        BigInt(tokenVotingPlugin.minParticipation),
        6,
      ),
      minProposerVotingPower: BigInt(
        tokenVotingPlugin.minProposerVotingPower,
      ),
      votingMode: tokenVotingPlugin.votingMode,
    };
  }

  /**
   * Returns the details of the token used in a specific plugin instance
   *
   * @param {string} pluginAddress
   * @return {*}  {Promise<Erc20TokenDetails | null>}
   * @memberof TokenVotingClient
   */
  public async getToken(
    pluginAddress: string,
  ): Promise<Erc20TokenDetails | Erc721TokenDetails | null> {
    if (!isAddress(pluginAddress)) {
      throw new InvalidAddressError();
    }
    const query = QueryTokenVotingPlugin;
    const params = {
      address: pluginAddress.toLowerCase(),
    };
    const name = "TokenVoting token";
    type T = {
      tokenVotingPlugin: { token: SubgraphErc20Token | SubgraphErc721Token };
    };
    const { tokenVotingPlugin } = await this.graphql.request<T>({
      query,
      params,
      name,
    });
    if (!tokenVotingPlugin) {
      return null;
    }
    let token: SubgraphErc20Token | SubgraphErc721Token =
      tokenVotingPlugin.token;
    // type erc20
    if (token.__typename === SubgraphContractType.ERC20) {
      return {
        address: token.id,
        name: token.name,
        symbol: token.symbol,
        decimals: token.decimals,
        type: TokenType.ERC20,
      };
      // type erc721
    } else if (token.__typename === SubgraphContractType.ERC721) {
      return {
        address: token.id,
        name: token.name,
        symbol: token.symbol,
        type: TokenType.ERC721,
      };
    }
    return null;
  }
}
