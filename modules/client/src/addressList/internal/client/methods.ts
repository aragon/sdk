import {
  GraphQLError,
  InvalidAddressError,
  InvalidAddressOrEnsError,
  InvalidCidError,
  InvalidProposalIdError,
  IpfsPinError,
  NoProviderError,
  NoSignerError,
  ProposalCreationError,
  resolveIpfsCid,
} from "@aragon/sdk-common";
import { isAddress } from "@ethersproject/address";
import {
  AddressListProposal,
  AddressListProposalListItem,
  IClientAddressListMethods,
  SubgraphAddressListProposal,
  SubgraphAddressListProposalListItem,
} from "../../interfaces";
import {
  ClientCore,
  computeProposalStatusFilter,
  ContextPlugin,
  etherToUnitInterval,
  ExecuteProposalStep,
  ExecuteProposalStepValue,
  findLog,
  ICanVoteParams,
  ICreateProposalParams,
  IExecuteProposalParams,
  IProposalQueryParams,
  IVoteProposalParams,
  ProposalCreationSteps,
  ProposalCreationStepValue,
  ProposalMetadata,
  ProposalSortBy,
  SortDirection,
  SubgraphVotingSettings,
  VoteProposalStep,
  VoteProposalStepValue,
  VotingSettings,
} from "../../../client-common";
import {
  QueryAddressListVotingProposal,
  QueryAddressListVotingProposals,
} from "../graphql-queries/proposal";
import { toAddressListProposal, toAddressListProposalListItem } from "../utils";
import { QueryAddressListVotingPluginSettings } from "../graphql-queries/settings";
import { AddresslistVoting__factory } from "@aragon/core-contracts-ethers";
import { toUtf8Bytes } from "@ethersproject/strings";
import {
  UNAVAILABLE_PROPOSAL_METADATA,
  UNSUPPORTED_PROPOSAL_METADATA_LINK,
} from "../../../client-common/constants";
import { QueryAddressListVotingMembers } from "../graphql-queries/members";

/**
 * Methods module the SDK Address List Client
 */
export class ClientAddressListMethods extends ClientCore
  implements IClientAddressListMethods {
  constructor(context: ContextPlugin) {
    super(context);
    Object.freeze(ClientAddressListMethods.prototype);
    Object.freeze(this);
  }
  /**
   * Creates a new proposal on the given AddressList plugin contract
   *
   * @param {ICreateProposalParams} params
   * @return {*}  {AsyncGenerator<ProposalCreationStepValue>}
   * @memberof ClientAddressListMethods
   */
  public async *createProposal(
    params: ICreateProposalParams,
  ): AsyncGenerator<ProposalCreationStepValue> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new NoSignerError();
    } else if (!signer.provider) {
      throw new NoProviderError();
    }

    const addresslistContract = AddresslistVoting__factory.connect(
      params.pluginAddress,
      signer,
    );

    const startTimestamp = params.startDate?.getTime() || 0;
    const endTimestamp = params.endDate?.getTime() || 0;

    const tx = await addresslistContract.createProposal(
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
    const addresslistContractInterface = AddresslistVoting__factory
      .createInterface();

    const log = findLog(
      receipt,
      addresslistContractInterface,
      "ProposalCreated",
    );

    if (!log) {
      throw new ProposalCreationError();
    }

    const parsedLog = addresslistContractInterface.parseLog(log);
    const proposalId = parsedLog.args["proposalId"];
    if (!proposalId) {
      throw new ProposalCreationError();
    }

    yield {
      key: ProposalCreationSteps.DONE,
      // TODO remove this when new proposal format
      proposalId: proposalId.toHexString(),
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
   * @return {*}  {AsyncGenerator<VoteProposalStepValue>}
   * @memberof ClientAddressListMethods
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

    const addresslistContract = AddresslistVoting__factory.connect(
      params.pluginAddress,
      signer,
    );

    const tx = await addresslistContract.vote(
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
    };
  }

  /**
   * Executes the given proposal, provided that it has already passed
   *
   * @param {IExecuteProposalParams} params
   * @return {*}  {AsyncGenerator<ExecuteProposalStepValue>}
   * @memberof ClientAddressListMethods
   */
  public async *executeProposal(
    params: IExecuteProposalParams,
  ): AsyncGenerator<ExecuteProposalStepValue> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new NoSignerError();
    } else if (!signer.provider) {
      throw new NoProviderError();
    }

    const addresslistContract = AddresslistVoting__factory.connect(
      params.pluginAddress,
      signer,
    );
    const tx = await addresslistContract.execute(params.proposalId);

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
   * @return {*}  {Promise<boolean>}
   * @memberof ClientAddressListMethods
   */
  public async canVote(params: ICanVoteParams): Promise<boolean> {
    const signer = this.web3.getConnectedSigner();
    if (!signer.provider) {
      throw new NoProviderError();
    } else if (!isAddress(params.address) || !isAddress(params.pluginAddress)) {
      throw new InvalidAddressError();
    }

    const addresslistContract = AddresslistVoting__factory.connect(
      params.pluginAddress,
      signer,
    );
    return addresslistContract.callStatic.canVote(
      params.proposalId,
      params.address,
    );
  }
  /**
   * Returns the list of wallet addresses with signing capabilities on the plugin
   *
   * @async
   * @param {string} pluginAddress
   * @return {*}  {Promise<string[]>}
   * @memberof ClientAddressListMethods
   */
  public async getMembers(pluginAddress: string): Promise<string[]> {
    if (!isAddress(pluginAddress)) {
      throw new InvalidAddressError();
    }

    try {
      await this.graphql.ensureOnline();
      const client = this.graphql.getClient();
      const response = await client.request(QueryAddressListVotingMembers, {
        address: pluginAddress,
      });
      return response.addresslistVotingPlugin.members.map((
        member: { address: string },
      ) => member.address);
    } catch {
      throw new GraphQLError("AddressList members");
    }
  }
  /**
   * Returns the details of the given proposal
   *
   * @param {string} proposalId
   * @return {*}  {(Promise<AddressListProposal | null>)}
   * @memberof ClientAddressListMethods
   */
  public async getProposal(
    proposalId: string,
  ): Promise<AddressListProposal | null> {
    if (!proposalId) {
      throw new InvalidProposalIdError();
    }
    try {
      await this.graphql.ensureOnline();
      const client = this.graphql.getClient();
      const {
        addresslistVotingProposal,
      }: {
        addresslistVotingProposal: SubgraphAddressListProposal;
      } = await client.request(QueryAddressListVotingProposal, {
        proposalId,
      });
      if (!addresslistVotingProposal) {
        return null;
      }
      try {
        const metadataCid = resolveIpfsCid(addresslistVotingProposal.metadata);
        const metadataString = await this.ipfs.fetchString(metadataCid);
        const metadata = JSON.parse(metadataString) as ProposalMetadata;
        return toAddressListProposal(addresslistVotingProposal, metadata);
        // TODO: Parse and validate schema
      } catch (err) {
        if (err instanceof InvalidCidError) {
          return toAddressListProposal(
            addresslistVotingProposal,
            UNSUPPORTED_PROPOSAL_METADATA_LINK,
          );
        }
        return toAddressListProposal(
          addresslistVotingProposal,
          UNAVAILABLE_PROPOSAL_METADATA,
        );
      }
    } catch (err) {
      throw new GraphQLError("AddressList proposal");
    }
  }

  /**
   * Returns a list of proposals on the Plugin, filtered by the given criteria
   *
   * @param {IProposalQueryParams} {
   *       daoAddressOrEns,
   *       limit = 10,
   *       status,
   *       skip = 0,
   *       direction = SortDirection.ASC,
   *       sortBy = ProposalSortBy.CREATED_AT,
   *     }
   * @return {*}  {Promise<AddressListProposalListItem[]>}
   * @memberof ClientAddressListMethods
   */
  public async getProposals({
    daoAddressOrEns,
    limit = 10,
    status,
    skip = 0,
    direction = SortDirection.ASC,
    sortBy = ProposalSortBy.CREATED_AT,
  }: IProposalQueryParams): Promise<AddressListProposalListItem[]> {
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
        addresslistVotingProposals,
      }: {
        addresslistVotingProposals: SubgraphAddressListProposalListItem[];
      } = await client.request(QueryAddressListVotingProposals, {
        where,
        limit,
        skip,
        direction,
        sortBy,
      });
      await this.ipfs.ensureOnline();
      return Promise.all(
        addresslistVotingProposals.map(
          async (
            proposal: SubgraphAddressListProposalListItem,
          ): Promise<AddressListProposalListItem> => {
            // format in the metadata field
            try {
              const metadataCid = resolveIpfsCid(proposal.metadata);
              const stringMetadata = await this.ipfs.fetchString(metadataCid);
              const metadata = JSON.parse(stringMetadata) as ProposalMetadata;
              return toAddressListProposalListItem(proposal, metadata);
            } catch (err) {
              if (err instanceof InvalidCidError) {
                return toAddressListProposalListItem(
                  proposal,
                  UNSUPPORTED_PROPOSAL_METADATA_LINK,
                );
              }
              return toAddressListProposalListItem(
                proposal,
                UNAVAILABLE_PROPOSAL_METADATA,
              );
            }
          },
        ),
      );
    } catch {
      throw new GraphQLError("AddresslistVoting proposals");
    }
  }

  /**
   * Returns the settings of a plugin given the address of the plugin instance
   *
   * @param {string} pluginAddress
   * @return {*}  {(Promise<VotingSettings | null>)}
   * @memberof ClientAddressListMethods
   */
  public async getVotingSettings(
    pluginAddress: string,
  ): Promise<VotingSettings | null> {
    if (!isAddress(pluginAddress)) {
      throw new InvalidAddressError();
    }
    try {
      await this.graphql.ensureOnline();
      const client = this.graphql.getClient();
      const { addresslistVotingPlugin }: {
        addresslistVotingPlugin: SubgraphVotingSettings;
      } = await client.request(
        QueryAddressListVotingPluginSettings,
        {
          address: pluginAddress,
        },
      );
      if (!addresslistVotingPlugin) {
        return null;
      }
      return {
        minDuration: parseInt(addresslistVotingPlugin.minDuration),
        supportThreshold: etherToUnitInterval(
          addresslistVotingPlugin.supportThreshold,
        ),
        minParticipation: etherToUnitInterval(
          addresslistVotingPlugin.minParticipation,
        ),
        minProposerVotingPower: BigInt(
          addresslistVotingPlugin.minParticipation,
        ),
        votingMode: addresslistVotingPlugin.votingMode,
      };
    } catch {
      throw new Error("Cannot fetch the settings data from GraphQL");
    }
  }
}
