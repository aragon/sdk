import { isAddress } from "@ethersproject/address";
import {
  decodeRatio,
  GraphQLError,
  InvalidAddressError,
  InvalidAddressOrEnsError,
  InvalidCidError,
  InvalidProposalIdError,
  IpfsPinError,
  NoProviderError,
  ProposalCreationError,
  resolveIpfsCid,
} from "@aragon/sdk-common";
import {
  ClientCore,
  computeProposalStatusFilter,
  ContextPlugin,
  ExecuteProposalStep,
  ExecuteProposalStepValue,
  ICanVoteParams,
  ICreateProposalParams,
  IExecuteProposalParams,
  IPluginSettings,
  IProposalQueryParams,
  isProposalId,
  IVoteProposalParams,
  ProposalCreationSteps,
  ProposalCreationStepValue,
  ProposalMetadata,
  ProposalSortBy,
  SortDirection,
  VoteProposalStep,
  VoteProposalStepValue,
} from "../../../client-common";
import {
  TokenVotingProposal,
  TokenVotingProposalListItem,
  Erc20TokenDetails,
  ITokenVotingClientMethods,
  SubgraphTokenVotingProposal,
  SubgraphTokenVotingProposalListItem,
} from "../../interfaces";
import {
  QueryTokenVotingMembers,
  QueryTokenVotingPluginSettings,
  QueryTokenVotingProposal,
  QueryTokenVotingProposals,
  QueryTokenVotingTargetContract,
} from "../graphql-queries";
import { toTokenVotingProposal, toTokenVotingProposalListItem } from "../utils";
import { TokenVoting__factory } from "@aragon/core-contracts-ethers";
import { id } from "@ethersproject/hash";
import { hexZeroPad } from "@ethersproject/bytes";
import { toUtf8Bytes } from "@ethersproject/strings";
import {
  UNAVAILABLE_PROPOSAL_METADATA,
  UNSUPPORTED_PROPOSAL_METADATA_LINK,
} from "../../../client-common/constants";
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
   * @param {ICreateProposalParams} params
   * @return {*}  {AsyncGenerator<ProposalCreationStepValue>}
   * @memberof TokenVotingClient
   */
  public async *createProposal(
    params: ICreateProposalParams,
  ): AsyncGenerator<ProposalCreationStepValue> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new Error("A signer is needed");
    } else if (!signer.provider) {
      throw new Error("A web3 provider is needed");
    }

    const tokenVotingContract = TokenVoting__factory.connect(
      params.pluginAddress,
      signer,
    );

    const startTimestamp = params.startDate?.getTime() || 0;
    const endTimestamp = params.endDate?.getTime() || 0;

    const tx = await tokenVotingContract.createVote(
      toUtf8Bytes(params.metadataUri),
      params.actions || [],
      Math.round(startTimestamp / 1000),
      Math.round(endTimestamp / 1000),
      params.executeOnPass || false,
      params.creatorVote || 0,
    );

    yield {
      key: ProposalCreationSteps.CREATING,
      txHash: tx.hash,
    };

    const receipt = await tx.wait();
    const tokenVotingContractInterface = TokenVoting__factory.createInterface();
    const log = receipt.logs.find(
      (log) =>
        log.topics[0] ===
          id(
            tokenVotingContractInterface.getEvent("VoteCreated").format(
              "sighash",
            ),
          ),
    );
    if (!log) {
      throw new ProposalCreationError();
    }

    const parsedLog = tokenVotingContractInterface.parseLog(log);
    if (!parsedLog.args["voteId"]) {
      throw new ProposalCreationError();
    }

    yield {
      key: ProposalCreationSteps.DONE,
      proposalId: hexZeroPad(parsedLog.args["voteId"].toHexString(), 32),
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
      throw new Error("A signer is needed");
    } else if (!signer.provider) {
      throw new Error("A web3 provider is needed");
    }

    const tokenVotingContract = TokenVoting__factory.connect(
      params.pluginAddress,
      signer,
    );

    const tx = await tokenVotingContract.vote(
      params.proposalId,
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
      voteId: hexZeroPad(params.proposalId, 32),
    };
  }
  /**
   * Executes the given proposal, provided that it has already passed
   *
   * @param {IExecuteProposalParams} params
   * @return {*}  {AsyncGenerator<ExecuteProposalStepValue>}
   * @memberof TokenVotingClient
   */
  public async *executeProposal(
    params: IExecuteProposalParams,
  ): AsyncGenerator<ExecuteProposalStepValue> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new Error("A signer is needed");
    } else if (!signer.provider) {
      throw new Error("A web3 provider is needed");
    }

    const tokenVotingContract = TokenVoting__factory.connect(
      params.pluginAddress,
      signer,
    );
    const tx = await tokenVotingContract.execute(params.proposalId);

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
   * Checks if an user can vote in a proposal
   *
   * @param {ICanVoteParams} params
   * @returns {*}  {Promise<boolean>}
   */
  public async canVote(params: ICanVoteParams): Promise<boolean> {
    const signer = this.web3.getConnectedSigner();
    if (!signer.provider) {
      throw new NoProviderError();
    } else if (!isAddress(params.address) || !isAddress(params.pluginAddress)) {
      throw new InvalidAddressError();
    }

    const tokenVotingContract = TokenVoting__factory.connect(
      params.pluginAddress,
      signer,
    );
    return tokenVotingContract.callStatic.canVote(
      params.proposalId,
      params.address,
    );
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

    try {
      await this.graphql.ensureOnline();
      const client = this.graphql.getClient();
      const response = await client.request(QueryTokenVotingMembers, {
        address: pluginAddress,
      });
      return response.tokenVotingPlugin.members.map((
        member: { address: string },
      ) => member.address);
    } catch {
      throw new GraphQLError("TokenVoting members");
    }
  }

  /**
   * Returns the details of the given proposal
   *
   * @param {string} proposalId
   * @return {*}  {Promise<TokenVotingProposal>}
   * @memberof TokenVotingClient
   */
  public async getProposal(proposalId: string): Promise<TokenVotingProposal | null> {
    if (!isProposalId(proposalId)) {
      throw new InvalidProposalIdError();
    }
    try {
      await this.graphql.ensureOnline();
      const client = this.graphql.getClient();
      const {
        tokenVotingProposal,
      }: {
        tokenVotingProposal: SubgraphTokenVotingProposal;
      } = await client.request(QueryTokenVotingProposal, {
        proposalId,
      });
      if (!tokenVotingProposal) {
        return null;
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
    } catch (err) {
      throw new GraphQLError("TokenVoting proposal");
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
      where = { dao: address };
    }
    if (status) {
      where = { ...where, ...computeProposalStatusFilter(status) };
    }
    try {
      await this.graphql.ensureOnline();
      const client = this.graphql.getClient();
      const {
        tokenVotingProposal,
      }: {
        tokenVotingProposal: SubgraphTokenVotingProposalListItem[];
      } = await client.request(QueryTokenVotingProposals, {
        where,
        limit,
        skip,
        direction,
        sortBy,
      });
      await this.ipfs.ensureOnline();
      return Promise.all(
        tokenVotingProposal.map(
          async (
            proposal: SubgraphTokenVotingProposalListItem,
          ): Promise<TokenVotingProposalListItem> => {
            // format in the metadata field
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
    } catch {
      throw new GraphQLError("TokenVoting proposals");
    }
  }

  /**
   * Returns the settings of a plugin given the address of the plugin instance
   *
   * @param {string} pluginAddress
   * @return {*}  {Promise<IPluginSettings>}
   * @memberof TokenVotingClient
   */
  public async getSettings(
    pluginAddress: string,
  ): Promise<IPluginSettings | null> {
    if (!isAddress(pluginAddress)) {
      throw new InvalidAddressError();
    }
    try {
      await this.graphql.ensureOnline();
      const client = this.graphql.getClient();
      const { tokenVotingPlugin } = await client.request(
        QueryTokenVotingPluginSettings,
        {
          address: pluginAddress,
        },
      );
      if (!tokenVotingPlugin) {
        return null;
      }
      return {
        minDuration: parseInt(tokenVotingPlugin.minDuration),
        minSupport: decodeRatio(
          parseFloat(
            tokenVotingPlugin.totalSupportThresholdPct,
          ),
          2,
        ),
        minTurnout: decodeRatio(
          parseFloat(
            tokenVotingPlugin.relativeSupportThresholdPct,
          ),
          2,
        ),
      };
    } catch {
      throw new GraphQLError("plugin settings");
    }
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
  ): Promise<Erc20TokenDetails | null> {
    if (!isAddress(pluginAddress)) {
      throw new InvalidAddressError();
    }
    try {
      await this.graphql.ensureOnline();
      const client = this.graphql.getClient();
      const { tokenVotingPlugin } = await client.request(QueryTokenVotingTargetContract, {
        address: pluginAddress,
      });
      if (!tokenVotingPlugin) {
        return null;
      }
      return {
        address: tokenVotingPlugin.token.id,
        decimals: parseInt(tokenVotingPlugin.token.decimals),
        name: tokenVotingPlugin.token.name,
        symbol: tokenVotingPlugin.token.symbol,
      };
    } catch (err) {
      throw new GraphQLError("token");
    }
  }
}
