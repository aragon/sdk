import { isAddress } from "@ethersproject/address";
import {
  GraphQLError,
  InvalidAddressError,
  InvalidAddressOrEnsError,
  InvalidCidError,
  InvalidProposalIdError,
  IpfsPinError,
  NoProviderError,
  ProposalCreationError,
  Random,
  resolveIpfsCid,
} from "@aragon/sdk-common";
import { formatEther } from "@ethersproject/units";
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
  Erc20Proposal,
  Erc20ProposalListItem,
  Erc20TokenDetails,
  IClientErc20Methods,
  SubgraphErc20Proposal,
  SubgraphErc20ProposalListItem,
} from "../../interfaces";
import {
  QueryErc20PluginSettings,
  QueryErc20Proposal,
  QueryErc20Proposals,
  QueryToken,
} from "../graphql-queries";
import { toErc20Proposal, toErc20ProposalListItem } from "../utils";
import { ERC20Voting__factory } from "@aragon/core-contracts-ethers";
import { id } from "@ethersproject/hash";
import { hexZeroPad } from "@ethersproject/bytes";
import { toUtf8Bytes } from "@ethersproject/strings";
import {
  UNAVAILABLE_PROPOSAL_METADATA,
  UNSUPPORTED_PROPOSAL_METADATA_LINK,
} from "../../../client-common/constants";
/**
 * Methods module the SDK ERC20 Client
 */
export class ClientErc20Methods extends ClientCore
  implements IClientErc20Methods {
  constructor(context: ContextPlugin) {
    super(context);
    Object.freeze(ClientErc20Methods.prototype);
    Object.freeze(this);
  }
  /**
   * Creates a new proposal on the given ERC20 plugin contract
   *
   * @param {ICreateProposalParams} params
   * @return {*}  {AsyncGenerator<ProposalCreationStepValue>}
   * @memberof ClientErc20
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

    const erc20Contract = ERC20Voting__factory.connect(
      params.pluginAddress,
      signer,
    );

    const startTimestamp = params.startDate?.getTime() || 0;
    const endTimestamp = params.endDate?.getTime() || 0;

    const tx = await erc20Contract.createVote(
      toUtf8Bytes(`ipfs://${params.metadataUri}`),
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
    const erc20VotingContractInterface = ERC20Voting__factory.createInterface();
    const log = receipt.logs.find(
      (log) =>
        log.topics[0] ===
          id(
            erc20VotingContractInterface.getEvent("VoteCreated").format(
              "sighash",
            ),
          ),
    );
    if (!log) {
      throw new ProposalCreationError();
    }

    const parsedLog = erc20VotingContractInterface.parseLog(log);
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
      return cid;
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
   * @memberof ClientErc20
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

    const erc20VotingContract = ERC20Voting__factory.connect(
      params.pluginAddress,
      signer,
    );

    const tx = await erc20VotingContract.vote(
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
   * @memberof ClientErc20
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

    const erc20VotingContract = ERC20Voting__factory.connect(
      params.pluginAddress,
      signer,
    );
    const tx = await erc20VotingContract.execute(params.proposalId);

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

    const erc20VotingContract = ERC20Voting__factory.connect(
      params.pluginAddress,
      signer,
    );
    return erc20VotingContract.callStatic.canVote(
      params.proposalId,
      params.address,
    );
  }

  /**
   * Returns the list of wallet addresses holding tokens from the underlying ERC20 contract used by the plugin
   *
   * @return {*}  {Promise<string[]>}
   * @memberof ClientErc20
   */
  public getMembers(_daoAddressOrEns: string): Promise<string[]> {
    // TODO: Implement

    const mockAddresses = [
      "0x8367dc645e31321CeF3EeD91a10a5b7077e21f70",
      "0xDA9dfA130Df4dE4673b89022EE50ff26f6EA73Cf",
      "0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8",
      "0x2dB75d8404144CD5918815A44B8ac3f4DB2a7FAf",
      "0xc1d60f584879f024299DA0F19Cdb47B931E35b53",
    ];

    return new Promise((resolve) => setTimeout(resolve, 1000)).then(() =>
      mockAddresses.filter(() => Random.getFloat() > 0.4)
    );
  }

  /**
   * Returns the details of the given proposal
   *
   * @param {string} proposalId
   * @return {*}  {Promise<Erc20Proposal>}
   * @memberof ClientErc20
   */
  public async getProposal(proposalId: string): Promise<Erc20Proposal | null> {
    if (!isProposalId(proposalId)) {
      throw new InvalidProposalIdError();
    }
    try {
      await this.graphql.ensureOnline();
      const client = this.graphql.getClient();
      const {
        erc20VotingProposal,
      }: {
        erc20VotingProposal: SubgraphErc20Proposal;
      } = await client.request(QueryErc20Proposal, {
        proposalId,
      });
      if (!erc20VotingProposal) {
        return null;
      }
      // format in the metadata field
      try {
        const metadataCid = resolveIpfsCid(erc20VotingProposal.metadata);
        const metadataString = await this.ipfs.fetchString(metadataCid);
        const metadata = JSON.parse(metadataString) as ProposalMetadata;
        return toErc20Proposal(erc20VotingProposal, metadata);
        // TODO: Parse and validate schema
      } catch (err) {
        if (err instanceof InvalidCidError) {
          return toErc20Proposal(
            erc20VotingProposal,
            UNSUPPORTED_PROPOSAL_METADATA_LINK,
          );
        }
        return toErc20Proposal(
          erc20VotingProposal,
          UNAVAILABLE_PROPOSAL_METADATA,
        );
      }
    } catch (err) {
      throw new GraphQLError("ERC20 proposal");
    }
  }
  /**
   * Returns a list of proposals on the Plugin, filtered by the given criteria
   *
   * @param {IProposalQueryParams} params
   * @return {*}  {Promise<Erc20ProposalListItem[]>}
   * @memberof ClientErc20
   */
  public async getProposals({
    daoAddressOrEns,
    limit = 10,
    status,
    skip = 0,
    direction = SortDirection.ASC,
    sortBy = ProposalSortBy.CREATED_AT,
  }: IProposalQueryParams): Promise<Erc20ProposalListItem[]> {
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
        erc20VotingProposals,
      }: {
        erc20VotingProposals: SubgraphErc20ProposalListItem[];
      } = await client.request(QueryErc20Proposals, {
        where,
        limit,
        skip,
        direction,
        sortBy,
      });
      await this.ipfs.ensureOnline();
      return Promise.all(
        erc20VotingProposals.map(
          async (
            proposal: SubgraphErc20ProposalListItem,
          ): Promise<Erc20ProposalListItem> => {
            // format in the metadata field
            try {
              const metadataCid = resolveIpfsCid(proposal.metadata);
              const stringMetadata = await this.ipfs.fetchString(metadataCid);
              const metadata = JSON.parse(stringMetadata) as ProposalMetadata;
              return toErc20ProposalListItem(proposal, metadata);
            } catch (err) {
              if (err instanceof InvalidCidError) {
                return toErc20ProposalListItem(
                  proposal,
                  UNSUPPORTED_PROPOSAL_METADATA_LINK,
                );
              }
              return toErc20ProposalListItem(
                proposal,
                UNAVAILABLE_PROPOSAL_METADATA,
              );
            }
          },
        ),
      );
    } catch {
      throw new GraphQLError("ERC20 proposals");
    }
  }

  /**
   * Returns the settings of a plugin given the address of the plugin instance
   *
   * @param {string} pluginAddress
   * @return {*}  {Promise<IPluginSettings>}
   * @memberof ClientErc20
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
      const { erc20VotingPlugin } = await client.request(
        QueryErc20PluginSettings,
        {
          address: pluginAddress,
        },
      );
      if (!erc20VotingPlugin) {
        return null;
      }
      return {
        minDuration: parseInt(erc20VotingPlugin.minDuration),
        // TODO: use decodeRatio() when ready
        minSupport: parseFloat(
          formatEther(erc20VotingPlugin.totalSupportThresholdPct),
        ),
        minTurnout: parseFloat(
          formatEther(erc20VotingPlugin.relativeSupportThresholdPct),
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
   * @memberof ClientErc20
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
      const { erc20VotingPlugin } = await client.request(QueryToken, {
        address: pluginAddress,
      });
      if (!erc20VotingPlugin) {
        return null;
      }
      return {
        address: erc20VotingPlugin.token.id,
        decimals: parseInt(erc20VotingPlugin.token.decimals),
        name: erc20VotingPlugin.token.name,
        symbol: erc20VotingPlugin.token.symbol,
      };
    } catch (err) {
      throw new GraphQLError("token");
    }
  }
}
