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
  ProposalCreationSteps,
  ProposalCreationStepValue,
  ProposalMetadata,
  ProposalSortBy,
  SortDirection,
  SubgraphMembers,
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
import { AddresslistVoting__factory } from "@aragon/osx-ethers";
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
   * @param {CreateMajorityVotingProposalParams} params
   * @return {*}  {AsyncGenerator<ProposalCreationStepValue>}
   * @memberof AddresslistVotingClientMethods
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

    const { pluginAddress, id } = decodeProposalId(params.proposalId);

    const addresslistContract = AddresslistVoting__factory.connect(
      pluginAddress,
      signer,
    );

    const tx = await addresslistContract.vote(
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
   * @memberof AddresslistVotingClientMethods
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

    const addresslistContract = AddresslistVoting__factory.connect(
      pluginAddress,
      signer,
    );
    const tx = await addresslistContract.execute(id);

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
   * @param {CanVoteParams} params
   * @return {*}  {Promise<boolean>}
   * @memberof AddresslistVotingClientMethods
   */
  public async canVote(params: CanVoteParams): Promise<boolean> {
    const signer = this.web3.getConnectedSigner();
    if (!signer.provider) {
      throw new NoProviderError();
    } else if (!isAddress(params.voterAddressOrEns)) {
      throw new InvalidAddressError();
    }

    const { pluginAddress, id } = decodeProposalId(params.proposalId);

    const addresslistContract = AddresslistVoting__factory.connect(
      pluginAddress,
      signer,
    );
    return addresslistContract.callStatic.canVote(
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
   * @memberof AddresslistVotingClientMethods
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

    const addresslistContract = AddresslistVoting__factory.connect(
      pluginAddress,
      signer,
    );

    return addresslistContract.canExecute(id);
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
    const query = QueryAddresslistVotingMembers;
    const params = {
      address: pluginAddress.toLowerCase(),
    };
    const name = "AddresslistVotingVoting members";
    type T = { addresslistVotingPlugin: SubgraphMembers };
    const { addresslistVotingPlugin } = await this.graphql.request<T>({
      query,
      params,
      name,
    });
    return addresslistVotingPlugin.members.map((
      member: { address: string },
    ) => member.address);
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
    if (!isProposalId(proposalId)) {
      throw new InvalidProposalIdError();
    }
    const extendedProposalId = getExtendedProposalId(proposalId);
    const query = QueryAddresslistVotingProposal;
    const params = {
      proposalId: extendedProposalId,
    };
    const name = "AddresslistVoting proposal";
    type T = { addresslistVotingProposal: SubgraphAddresslistVotingProposal };
    const { addresslistVotingProposal } = await this.graphql.request<T>({
      query,
      params,
      name,
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
      where = { dao: address.toLowerCase() };
    }
    if (status) {
      where = { ...where, ...computeProposalStatusFilter(status) };
    }

    const query = QueryAddresslistVotingProposals;
    const params = {
      where,
      limit,
      skip,
      direction,
      sortBy,
    };
    const name = "AddresslistVoting proposals";
    type T = { addresslistVotingProposals: SubgraphAddresslistVotingProposalListItem[] };
    const { addresslistVotingProposals } = await this.graphql.request<T>({
      query,
      params,
      name,
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
    const query = QueryAddresslistVotingSettings;
    const params = {
      address: pluginAddress.toLowerCase(),
    };
    const name = "AddresslistVoting settings";
    type T = { addresslistVotingPlugin: SubgraphVotingSettings };
    const { addresslistVotingPlugin } = await this.graphql.request<T>({
      query,
      params,
      name,
    });
    if (!addresslistVotingPlugin) {
      return null;
    }
    return {
      minDuration: parseInt(addresslistVotingPlugin.minDuration),
      supportThreshold: decodeRatio(
        BigInt(addresslistVotingPlugin.supportThreshold),
        6,
      ),
      minParticipation: decodeRatio(
        BigInt(addresslistVotingPlugin.minParticipation),
        6,
      ),
      minProposerVotingPower: BigInt(
        addresslistVotingPlugin.minProposerVotingPower,
      ),
      votingMode: addresslistVotingPlugin.votingMode,
    };
  }
}
