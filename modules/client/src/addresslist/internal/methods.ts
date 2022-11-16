import { BigNumber } from "@ethersproject/bignumber";
import {
  ContractReceipt,
  Event as EthersEvent,
} from "@ethersproject/contracts";
import { Addresslist } from "../client";
import {
  ICreateProposalParams,
  ISetConfigurationParams,
  IVoteParams,
  Steps,
  Proposal,
  ProposalCreationValue,
  VoteStepsValue,
} from "../interfaces";
import { arrayify } from "@ethersproject/bytes";

export class AddresslistMethods {
  private addresslist: Addresslist;

  constructor(addresslist: Addresslist) {
    this.addresslist = addresslist;
  }

  /**
   * Returns the hash for the MODIFY_ALLOWLIST_PERMISSION permission
   *
   * @return {*}  {Promise<string>}
   * @memberof AddresslistMethods
   */
  public MODIFY_ALLOWLIST_PERMISSION_ID(): Promise<string> {
    return this.addresslist
      .getPluginInstanceWithSigner()
      .MODIFY_ALLOWLIST_PERMISSION_ID();
  }

  /**
   * Returns the PCT_BASE
   *
   * @return {*}  {Promise<number>}
   * @memberof AddresslistMethods
   */
  public async PCT_BASE(): Promise<number> {
    return (
      await this.addresslist.getPluginInstanceWithSigner().PCT_BASE()
    ).toNumber();
  }

  /**
   * Returns the hash for the SET_CONFIGURATION_PERMISSION permission
   *
   * @return {*}  {Promise<string>}
   * @memberof AddresslistMethods
   */
  public SET_CONFIGURATION_PERMISSION_ID(): Promise<string> {
    return this.addresslist
      .getPluginInstanceWithSigner()
      .SET_CONFIGURATION_PERMISSION_ID();
  }

  /**
   * Returns the hash for the UPGRADE_PLUGIN_PERMISSION permission
   *
   * @return {*}  {Promise<string>}
   * @memberof AddresslistMethods
   */
  public UPGRADE_PLUGIN_PERMISSION_ID(): Promise<string> {
    return this.addresslist
      .getPluginInstanceWithSigner()
      .UPGRADE_PLUGIN_PERMISSION_ID();
  }

  /**
   * Adds new allowed users to the plugin.
   * Returns a generator with 2 steps
   *
   * @param {string[]} _users
   * @return {*}  {AsyncGenerator<VoteStepsValue>}
   * @memberof AddresslistMethods
   */
  public async *addAllowedUsers(
    _users: string[]
  ): AsyncGenerator<VoteStepsValue> {
    const tx = await this.addresslist
      .getPluginInstanceWithSigner()
      .addAllowedUsers(_users);
    yield {
      key: Steps.PENDING,
      txHash: tx.hash,
    };
    await tx.wait();
    yield {
      key: Steps.DONE,
    };
  }

  /**
   * Returns the amount of allowed users at a given block
   *
   * @param {BigInt} blockNumber
   * @return {*}  {Promise<BigInt | number>}
   * @memberof AddresslistMethods
   */
  public async allowedUserCount(blockNumber: BigInt | number): Promise<BigInt> {
    return (
      await this.addresslist
        .getPluginInstanceWithSigner()
        .allowedUserCount(BigNumber.from(blockNumber))
    ).toBigInt();
  }

  /**
   * Checks if a proposal can be executed
   *
   * @param {BigInt | number} _proposalId
   * @return {*}  {Promise<boolean>}
   * @memberof AddresslistMethods
   */
  public canExecute(_proposalId: BigInt | number): Promise<boolean> {
    return this.addresslist
      .getPluginInstanceWithSigner()
      .canExecute(BigNumber.from(_proposalId));
  }

  /**
   * Checks if a voter can vote on a proposal
   *
   * @param {BigInt | number} _proposalId
   * @param {string} _voter
   * @return {*}  {Promise<boolean>}
   * @memberof AddresslistMethods
   */
  public canVote(
    _proposalId: BigInt | number,
    _voter: string
  ): Promise<boolean> {
    return this.addresslist
      .getPluginInstanceWithSigner()
      .canVote(BigNumber.from(_proposalId), _voter);
  }

  /**
   * Creates a new proposal.
   * Returns a generator with 2 steps
   *
   * @param {ICreateProposalParams} params
   * @return {*}  {AsyncGenerator<VoteCreationValue>}
   * @memberof AddresslistMethods
   */
  public async *createProposal(
    params: ICreateProposalParams
  ): AsyncGenerator<ProposalCreationValue> {
    const tx = await this.addresslist.getPluginInstanceWithSigner().createVote(
      params._proposalMetadata,
      params._actions.map(action => ({
        ...action,
        value: BigNumber.from(action.value),
      })),
      BigNumber.from(params._startDate),
      BigNumber.from(params._endDate),
      params._executeIfDecided,
      BigNumber.from(params._choice)
    );

    yield {
      key: Steps.PENDING,
      txHash: tx.hash,
    };

    const receipt = await tx.wait();
    const voteCreatedEvents = this.getEventsByName(receipt, "VoteCreated");

    if (voteCreatedEvents.length !== 1) {
      throw new Error("Failed to create proposal");
    }

    yield {
      key: Steps.DONE,
      proposalId: parseInt(voteCreatedEvents[0].topics[1]),
    };
  }

  /**
   * Executes a proposal.
   * Returns a generator with 2 steps
   *
   * @param {BigInt | number} _proposalId
   * @return {*}  {AsyncGenerator<VoteStepsValue>}
   * @memberof AddresslistMethods
   */
  public async *execute(
    _proposalId: BigInt | number
  ): AsyncGenerator<VoteStepsValue> {
    const tx = await this.addresslist
      .getPluginInstanceWithSigner()
      .execute(BigNumber.from(_proposalId));
    yield {
      key: Steps.PENDING,
      txHash: tx.hash,
    };
    await tx.wait();
    yield {
      key: Steps.DONE,
    };
  }

  /**
   * Returns the DAO address this plugin belongs to
   *
   * @return {*}  {Promise<string>}
   * @memberof AddresslistMethods
   */
  public getDAO(): Promise<string> {
    return this.addresslist.getPluginInstanceWithSigner().getDAO();
  }

  /**
   * Returns the address of the implementation contract used for the proxy.
   *
   * @return {*}  {Promise<string>}
   * @memberof AddresslistMethods
   */
  public getImplementationAddress(): Promise<string> {
    return this.addresslist
      .getPluginInstanceWithSigner()
      .getImplementationAddress();
  }

  /**
   * Returns the proposal
   *
   * @param {BigInt | number} _proposalId
   * @return {*}  {Promise<Proposal>}
   * @memberof AddresslistMethods
   */
  public async getProposal(_proposalId: BigInt | number): Promise<Proposal> {
    const proposalData = await this.addresslist
      .getPluginInstanceWithSigner()
      .getVote(_proposalId.toString());
    const proposal: Proposal = {
      id: parseInt(_proposalId.toString()),
      open: proposalData.open,
      executed: proposalData.executed,
      startDate: parseInt(proposalData.startDate.toString()),
      endDate: parseInt(proposalData.endDate.toString()),
      snapshotBlock: BigInt(proposalData.snapshotBlock.toString()),
      supportRequired: BigInt(proposalData.supportRequired.toString()),
      participationRequired: BigInt(
        proposalData.participationRequired.toString()
      ),
      votingPower: BigInt(proposalData.votingPower.toString()),
      yes: BigInt(proposalData.yes.toString()),
      no: BigInt(proposalData.no.toString()),
      abstain: BigInt(proposalData.abstain.toString()),
      actions: proposalData.actions.map(action => ({
        to: action.to,
        data: arrayify(action.data),
        value: BigInt(action.value.toString()),
      })),
    };
    return proposal;
  }

  /**
   * Returns what a voter voted on a proposal
   *
   * @param {BigInt | number} _proposalId
   * @param {string} _voter
   * @return {*}  {Promise<number>}
   * @memberof AddresslistMethods
   */
  public getVoteOption(
    _proposalId: BigInt | number,
    _voter: string
  ): Promise<number> {
    return this.addresslist
      .getPluginInstanceWithSigner()
      .getVoteOption(BigNumber.from(_proposalId), _voter);
  }

  /**
   * Checks if a user is allowed on the given block
   *
   * @param {string} account
   * @param {BigInt | number} blockNumber
   * @return {*}  {Promise<boolean>}
   * @memberof AddresslistMethods
   */
  public isAllowed(
    account: string,
    blockNumber: BigInt | number
  ): Promise<boolean> {
    return this.addresslist
      .getPluginInstanceWithSigner()
      .isAllowed(account, BigNumber.from(blockNumber));
  }

  /**
   * Returns the configured minDuration
   *
   * @return {*}  {Promise<number>}
   * @memberof AddresslistMethods
   */
  public async minDuration(): Promise<number> {
    return (
      await this.addresslist.getPluginInstanceWithSigner().minDuration()
    ).toNumber();
  }

  /**
   * Returns the configured participation requirement
   *
   * @return {*}  {Promise<number>}
   * @memberof AddresslistMethods
   */
  public async participationRequiredPct(): Promise<number> {
    return (
      await this.addresslist
        .getPluginInstanceWithSigner()
        .participationRequiredPct()
    ).toNumber();
  }

  /**
   * Returns the type of this plugin
   *
   * @return {*}  {Promise<number>}
   * @memberof AddresslistMethods
   */
  public pluginType(): Promise<number> {
    return this.addresslist.getPluginInstanceWithSigner().pluginType();
  }

  /**
   * Returns the proxable UUID
   *
   * @return {*}  {Promise<string>}
   * @memberof AddresslistMethods
   */
  public proxiableUUID(): Promise<string> {
    return this.addresslist.getPluginInstanceWithSigner().proxiableUUID();
  }

  /**
   * Removes allowed users from the plugin.
   * Returns a generator with 2 steps
   *
   * @param {string[]} _users
   * @return {*}  {AsyncGenerator<VoteStepsValue>}
   * @memberof AddresslistMethods
   */
  public async *removeAllowedUsers(
    _users: string[]
  ): AsyncGenerator<VoteStepsValue> {
    const tx = await this.addresslist
      .getPluginInstanceWithSigner()
      .removeAllowedUsers(_users);
    yield {
      key: Steps.PENDING,
      txHash: tx.hash,
    };
    await tx.wait();
    yield {
      key: Steps.DONE,
    };
  }

  /**
   * Sets a new proposal configuration.
   * Returns a generator with 2 steps
   *
   * @param {ISetConfigurationParams} params
   * @return {*}  {AsyncGenerator<VoteStepsValue>}
   * @memberof AddresslistMethods
   */
  public async *setConfiguration(
    params: ISetConfigurationParams
  ): AsyncGenerator<VoteStepsValue> {
    const tx = await this.addresslist
      .getPluginInstanceWithSigner()
      .setConfiguration(
        BigNumber.from(params._participationRequiredPct),
        BigNumber.from(params._supportRequiredPct),
        BigNumber.from(params._minDuration)
      );
    yield {
      key: Steps.PENDING,
      txHash: tx.hash,
    };
    await tx.wait();
    yield {
      key: Steps.DONE,
    };
  }

  /**
   * Returns the configured required support
   *
   * @return {*}  {Promise<number>}
   * @memberof AddresslistMethods
   */
  public async supportRequiredPct(): Promise<number> {
    return (
      await this.addresslist.getPluginInstanceWithSigner().supportRequiredPct()
    ).toNumber();
  }

  /**
   * Votes on a proposal
   * Returns a generator with 2 steps
   *
   * @param {IVoteParams} params
   * @return {*}  {AsyncGenerator<VoteStepsValue>}
   * @memberof AddresslistMethods
   */
  public async *vote(params: IVoteParams): AsyncGenerator<VoteStepsValue> {
    const tx = await this.addresslist
      .getPluginInstanceWithSigner()
      .vote(
        BigNumber.from(params._proposalId),
        BigNumber.from(params._choice),
        params._executesIfDecided
      );
    yield {
      key: Steps.PENDING,
      txHash: tx.hash,
    };
    await tx.wait();
    yield {
      key: Steps.DONE,
    };
  }

  /**
   * Returns the amount of proposals
   *
   * @return {*}  {Promise<number>}
   * @memberof AddresslistMethods
   */
  public async proposalsLength(): Promise<number> {
    return (
      await this.addresslist.getPluginInstanceWithSigner().votesLength()
    ).toNumber();
  }

  /**
   * Private helpers to search for an event
   *
   * @private
   * @param {ContractReceipt} receipt
   * @param {string} eventName
   * @return {*}  {EthersEvent[]}
   * @memberof AddresslistMethods
   */
  private getEventsByName(
    receipt: ContractReceipt,
    eventName: string
  ): EthersEvent[] {
    const eventTopic = this.addresslist.pluginInstance.interface.getEventTopic(
      eventName
    );
    return (
      receipt.events?.filter(event => event.topics[0] === eventTopic) || []
    );
  }
}
