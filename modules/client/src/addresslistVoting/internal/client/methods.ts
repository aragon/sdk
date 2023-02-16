import {
  boolArrayToBitmap,
  decodeProposalId,
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
  AddresslistVotingProposal,
  AddresslistVotingProposalListItem,
  IAddresslistVotingClientMethods,
  SubgraphAddresslistVotingProposal,
  SubgraphAddresslistVotingProposalListItem,
} from "../../interfaces";
import {
  CanExecuteParams,
  ClientCore,
  computeProposalStatusFilter,
  ContextPlugin,
  ExecuteProposalStep,
  ExecuteProposalStepValue,
  findLog,
  ICanVoteParams,
  ICreateProposalParams,
  IExecuteProposalParams,
  IProposalQueryParams,
  isProposalId,
  IVoteProposalParams,
  parseEtherRatio,
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
  QueryAddresslistVotingMembers,
  QueryAddresslistVotingProposal,
  QueryAddresslistVotingProposals,
  QueryAddresslistVotingSettings,
} from "../graphql-queries";
import {
  toAddresslistVotingProposal,
  toAddresslistVotingProposalListItem,
} from "../utils";
import { AddresslistVoting__factory } from "@aragon/core-contracts-ethers";
import { toUtf8Bytes } from "@ethersproject/strings";
import {
  UNAVAILABLE_PROPOSAL_METADATA,
  UNSUPPORTED_PROPOSAL_METADATA_LINK,
} from "../../../client-common/constants";

/**
 * Methods module the SDK Address List Client
 */
export class AddresslistVotingClientMethods extends ClientCore
  implements IAddresslistVotingClientMethods {
  constructor(context: ContextPlugin) {
    super(context);
    Object.freeze(AddresslistVotingClientMethods.prototype);
    Object.freeze(this);
  }
  /**
   * Creates a new proposal on the given AddressList plugin contract
   *
   * @param {ICreateProposalParams} params
   * @return {*}  {AsyncGenerator<ProposalCreationStepValue>}
   * @memberof AddresslistVotingClientMethods
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

    const tx = await addresslistContract.createProposal(
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
    const proposalId: string = parsedLog.args["proposalId"];
    if (!proposalId) {
      throw new ProposalCreationError();
    }

    yield {
      key: ProposalCreationSteps.DONE,
      proposalId,
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
   * @memberof AddresslistVotingClientMethods
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
    if (!isProposalId(params.proposalId)) {
      throw new InvalidProposalIdError();
    }
    const { pluginAddress } = decodeProposalId(params.proposalId);

    const addresslistContract = AddresslistVoting__factory.connect(
      pluginAddress,
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
   * @memberof AddresslistVotingClientMethods
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

    if (!isProposalId(params.proposalId)) {
      throw new InvalidProposalIdError();
    }
    const { pluginAddress } = decodeProposalId(params.proposalId);

    const addresslistContract = AddresslistVoting__factory.connect(
      pluginAddress,
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
   * @memberof AddresslistVotingClientMethods
   */
  public async canVote(params: ICanVoteParams): Promise<boolean> {
    const signer = this.web3.getConnectedSigner();
    if (!signer.provider) {
      throw new NoProviderError();
    } else if (!isAddress(params.address)) {
      throw new InvalidAddressError();
    }

    if (!isProposalId(params.proposalId)) {
      throw new InvalidProposalIdError();
    }
    const { pluginAddress } = decodeProposalId(params.proposalId);

    const addresslistContract = AddresslistVoting__factory.connect(
      pluginAddress,
      signer,
    );
    return addresslistContract.callStatic.canVote(
      params.proposalId,
      params.address,
      params.vote,
    );
  }
  /**
   * Checks whether the current proposal can be executed
   *
   * @param {string} addressOrEns
   * @return {*}  {Promise<boolean>}
   * @memberof AddresslistVotingClientMethods
   */
  public async canExecute(
    params: CanExecuteParams,
  ): Promise<boolean> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new NoSignerError();
    } else if (!signer.provider) {
      throw new NoProviderError();
    }
    if (!isProposalId(params.proposalId)) {
      throw new InvalidProposalIdError();
    }
    const { pluginAddress } = decodeProposalId(params.proposalId);

    const addresslistContract = AddresslistVoting__factory.connect(
      pluginAddress,
      signer,
    );

    return addresslistContract.canExecute(params.proposalId);
  }
  /**
   * Returns the list of wallet addresses with signing capabilities on the plugin
   *
   * @async
   * @param {string} pluginAddress
   * @return {*}  {Promise<string[]>}
   * @memberof AddresslistVotingClientMethods
   */
  public async getMembers(pluginAddress: string): Promise<string[]> {
    if (!isAddress(pluginAddress)) {
      throw new InvalidAddressError();
    }

    try {
      await this.graphql.ensureOnline();
      const client = this.graphql.getClient();
      const response = await client.request(QueryAddresslistVotingMembers, {
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
   * @return {*}  {(Promise<AddresslistVotingProposal | null>)}
   * @memberof AddresslistVotingClientMethods
   */
  public async getProposal(
    proposalId: string,
  ): Promise<AddresslistVotingProposal | null> {
    if (!proposalId) {
      throw new InvalidProposalIdError();
    }
    try {
      await this.graphql.ensureOnline();
      const client = this.graphql.getClient();
      const {
        addresslistVotingProposal,
      }: {
        addresslistVotingProposal: SubgraphAddresslistVotingProposal;
      } = await client.request(QueryAddresslistVotingProposal, {
        proposalId,
      });
      if (!addresslistVotingProposal) {
        return null;
      }
      try {
        const metadataCid = resolveIpfsCid(addresslistVotingProposal.metadata);
        const metadataString = await this.ipfs.fetchString(metadataCid);
        const metadata = JSON.parse(metadataString) as ProposalMetadata;
        return toAddresslistVotingProposal(addresslistVotingProposal, metadata);
        // TODO: Parse and validate schema
      } catch (err) {
        if (err instanceof InvalidCidError) {
          return toAddresslistVotingProposal(
            addresslistVotingProposal,
            UNSUPPORTED_PROPOSAL_METADATA_LINK,
          );
        }
        return toAddresslistVotingProposal(
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
   * @return {*}  {Promise<AddresslistVotingProposalListItem[]>}
   * @memberof AddresslistVotingClientMethods
   */
  public async getProposals({
    daoAddressOrEns,
    limit = 10,
    status,
    skip = 0,
    direction = SortDirection.ASC,
    sortBy = ProposalSortBy.CREATED_AT,
  }: IProposalQueryParams): Promise<AddresslistVotingProposalListItem[]> {
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
        addresslistVotingProposals: SubgraphAddresslistVotingProposalListItem[];
      } = await client.request(QueryAddresslistVotingProposals, {
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
            proposal: SubgraphAddresslistVotingProposalListItem,
          ): Promise<AddresslistVotingProposalListItem> => {
            // format in the metadata field
            try {
              const metadataCid = resolveIpfsCid(proposal.metadata);
              const stringMetadata = await this.ipfs.fetchString(metadataCid);
              const metadata = JSON.parse(stringMetadata) as ProposalMetadata;
              return toAddresslistVotingProposalListItem(proposal, metadata);
            } catch (err) {
              if (err instanceof InvalidCidError) {
                return toAddresslistVotingProposalListItem(
                  proposal,
                  UNSUPPORTED_PROPOSAL_METADATA_LINK,
                );
              }
              return toAddresslistVotingProposalListItem(
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
   * @memberof AddresslistVotingClientMethods
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
        QueryAddresslistVotingSettings,
        {
          address: pluginAddress,
        },
      );
      if (!addresslistVotingPlugin) {
        return null;
      }
      return {
        minDuration: parseInt(addresslistVotingPlugin.minDuration),
        supportThreshold: parseEtherRatio(
          addresslistVotingPlugin.supportThreshold,
        ),
        minParticipation: parseEtherRatio(
          addresslistVotingPlugin.minParticipation,
        ),
        minProposerVotingPower: BigInt(
          addresslistVotingPlugin.minProposerVotingPower,
        ),
        votingMode: addresslistVotingPlugin.votingMode,
      };
    } catch {
      throw new Error("Cannot fetch the settings data from GraphQL");
    }
  }
}
