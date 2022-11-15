import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import {
  ContractReceipt,
  Event as EthersEvent,
} from "@ethersproject/contracts";
import { AllowlistVoting } from "../client";
import {
  ICreateProposalParams,
  ISetConfigurationParams,
  IVoteParams,
  Steps,
  Proposal,
  VoteCreationValue,
  VoteStepsValue,
} from "../interfaces";
import { arrayify } from "@ethersproject/bytes";

export class AllowlistVotingMethods {
  private allowlistVoting: AllowlistVoting;

  constructor(allowlistVoting: AllowlistVoting) {
    this.allowlistVoting = allowlistVoting;
  }

  /**
   * Returns the hash for the MODIFY_ALLOWLIST_PERMISSION permission
   *
   * @return {*}  {Promise<string>}
   * @memberof AllowlistVotingMethods
   */
  public MODIFY_ALLOWLIST_PERMISSION_ID(): Promise<string> {
    return this.allowlistVoting
      .getPluginInstanceWithSigner()
      .MODIFY_ALLOWLIST_PERMISSION_ID();
  }

  /**
   * Returns the PCT_BASE
   *
   * @return {*}  {Promise<BigNumber>}
   * @memberof AllowlistVotingMethods
   */
  public PCT_BASE(): Promise<BigNumber> {
    return this.allowlistVoting.getPluginInstanceWithSigner().PCT_BASE();
  }

  /**
   * Returns the hash for the SET_CONFIGURATION_PERMISSION permission
   *
   * @return {*}  {Promise<string>}
   * @memberof AllowlistVotingMethods
   */
  public SET_CONFIGURATION_PERMISSION_ID(): Promise<string> {
    return this.allowlistVoting
      .getPluginInstanceWithSigner()
      .SET_CONFIGURATION_PERMISSION_ID();
  }

  /**
   * Returns the hash for the UPGRADE_PLUGIN_PERMISSION permission
   *
   * @return {*}  {Promise<string>}
   * @memberof AllowlistVotingMethods
   */
  public UPGRADE_PLUGIN_PERMISSION_ID(): Promise<string> {
    return this.allowlistVoting
      .getPluginInstanceWithSigner()
      .UPGRADE_PLUGIN_PERMISSION_ID();
  }

  /**
   * Adds new allowed users to the plugin.
   * Returns a generator with 2 steps
   *
   * @param {string[]} _users
   * @return {*}  {AsyncGenerator<VoteStepsValue>}
   * @memberof AllowlistVotingMethods
   */
  public async *addAllowedUsers(
    _users: string[]
  ): AsyncGenerator<VoteStepsValue> {
    const tx = await this.allowlistVoting
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
   * Returns the amount of allowed users
   *
   * @param {BigNumberish} blockNumber
   * @return {*}  {Promise<BigNumber>}
   * @memberof AllowlistVotingMethods
   */
  public allowedUserCount(blockNumber: BigNumberish): Promise<BigNumber> {
    return this.allowlistVoting
      .getPluginInstanceWithSigner()
      .allowedUserCount(blockNumber);
  }

  /**
   * Checks if a proposal can be executed
   *
   * @param {BigNumberish} _voteId
   * @return {*}  {Promise<boolean>}
   * @memberof AllowlistVotingMethods
   */
  public canExecute(_voteId: BigNumberish): Promise<boolean> {
    return this.allowlistVoting
      .getPluginInstanceWithSigner()
      .canExecute(_voteId);
  }

  /**
   * Checks if a voter can vote on a proposal
   *
   * @param {BigNumberish} _voteId
   * @param {string} _voter
   * @return {*}  {Promise<boolean>}
   * @memberof AllowlistVotingMethods
   */
  public canVote(_voteId: BigNumberish, _voter: string): Promise<boolean> {
    return this.allowlistVoting
      .getPluginInstanceWithSigner()
      .canVote(_voteId, _voter);
  }

  /**
   * Creates a new proposal.
   * Returns a generator with 2 steps
   *
   * @param {ICreateProposalParams} params
   * @return {*}  {AsyncGenerator<VoteCreationValue>}
   * @memberof AllowlistVotingMethods
   */
  public async *createProposal(
    params: ICreateProposalParams
  ): AsyncGenerator<VoteCreationValue> {
    const tx = await this.allowlistVoting
      .getPluginInstanceWithSigner()
      .createVote(
        params._proposalMetadata,
        params._actions,
        params._startDate,
        params._endDate,
        params._executeIfDecided,
        params._choice
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
      voteId: parseInt(voteCreatedEvents[0].topics[1]),
    };
  }

  /**
   * Executes a proposal.
   * Returns a generator with 2 steps
   *
   * @param {BigNumberish} _voteId
   * @return {*}  {AsyncGenerator<VoteStepsValue>}
   * @memberof AllowlistVotingMethods
   */
  public async *execute(_voteId: BigNumberish): AsyncGenerator<VoteStepsValue> {
    const tx = await this.allowlistVoting
      .getPluginInstanceWithSigner()
      .execute(_voteId);
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
   * @memberof AllowlistVotingMethods
   */
  public getDAO(): Promise<string> {
    return this.allowlistVoting.getPluginInstanceWithSigner().getDAO();
  }

  /**
   * Returns the address of the implementation contract used for the proxy.
   *
   * @return {*}  {Promise<string>}
   * @memberof AllowlistVotingMethods
   */
  public getImplementationAddress(): Promise<string> {
    return this.allowlistVoting
      .getPluginInstanceWithSigner()
      .getImplementationAddress();
  }

  /**
   * Returns the proposal
   *
   * @param {BigNumberish} _voteId
   * @return {*}  {Promise<Proposal>}
   * @memberof AllowlistVotingMethods
   */
  public async getVote(_voteId: BigNumberish): Promise<Proposal> {
    const voteData = await this.allowlistVoting
      .getPluginInstanceWithSigner()
      .getVote(_voteId);
    const vote: Proposal = {
      id: _voteId,
      open: voteData.open,
      executed: voteData.executed,
      startDate: voteData.startDate,
      endDate: voteData.endDate,
      snapshotBlock: voteData.snapshotBlock,
      supportRequired: voteData.supportRequired,
      participationRequired: voteData.participationRequired,
      votingPower: voteData.votingPower,
      yes: voteData.yes,
      no: voteData.no,
      abstain: voteData.abstain,
      actions: voteData.actions.map(action => ({
        to: action.to,
        data: arrayify(action.data),
        value: action.value,
      })),
    };
    return vote;
  }

  /**
   * Returns what a voter voted on a proposal
   *
   * @param {BigNumberish} _voteId
   * @param {string} _voter
   * @return {*}  {Promise<number>}
   * @memberof AllowlistVotingMethods
   */
  public getVoteOption(_voteId: BigNumberish, _voter: string): Promise<number> {
    return this.allowlistVoting
      .getPluginInstanceWithSigner()
      .getVoteOption(_voteId, _voter);
  }

  /**
   * Checks if a user is allowed on the given block
   *
   * @param {string} account
   * @param {BigNumberish} blockNumber
   * @return {*}  {Promise<boolean>}
   * @memberof AllowlistVotingMethods
   */
  public isAllowed(
    account: string,
    blockNumber: BigNumberish
  ): Promise<boolean> {
    return this.allowlistVoting
      .getPluginInstanceWithSigner()
      .isAllowed(account, blockNumber);
  }

  /**
   * Returns the configured minDuration
   *
   * @return {*}  {Promise<BigNumber>}
   * @memberof AllowlistVotingMethods
   */
  public minDuration(): Promise<BigNumber> {
    return this.allowlistVoting.getPluginInstanceWithSigner().minDuration();
  }

  /**
   * Returns the configured participation requirement
   *
   * @return {*}  {Promise<BigNumber>}
   * @memberof AllowlistVotingMethods
   */
  public participationRequiredPct(): Promise<BigNumber> {
    return this.allowlistVoting
      .getPluginInstanceWithSigner()
      .participationRequiredPct();
  }

  /**
   * Returns the type of this plugin
   *
   * @return {*}  {Promise<number>}
   * @memberof AllowlistVotingMethods
   */
  public pluginType(): Promise<number> {
    return this.allowlistVoting.getPluginInstanceWithSigner().pluginType();
  }

  /**
   * Returns the proxable UUID
   *
   * @return {*}  {Promise<string>}
   * @memberof AllowlistVotingMethods
   */
  public proxiableUUID(): Promise<string> {
    return this.allowlistVoting.getPluginInstanceWithSigner().proxiableUUID();
  }

  /**
   * Removes allowed users from the plugin.
   * Returns a generator with 2 steps
   *
   * @param {string[]} _users
   * @return {*}  {AsyncGenerator<VoteStepsValue>}
   * @memberof AllowlistVotingMethods
   */
  public async *removeAllowedUsers(
    _users: string[]
  ): AsyncGenerator<VoteStepsValue> {
    const tx = await this.allowlistVoting
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
   * @memberof AllowlistVotingMethods
   */
  public async *setConfiguration(
    params: ISetConfigurationParams
  ): AsyncGenerator<VoteStepsValue> {
    const tx = await this.allowlistVoting
      .getPluginInstanceWithSigner()
      .setConfiguration(
        params._participationRequiredPct,
        params._supportRequiredPct,
        params._minDuration
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
   * @return {*}  {Promise<BigNumber>}
   * @memberof AllowlistVotingMethods
   */
  public supportRequiredPct(): Promise<BigNumber> {
    return this.allowlistVoting
      .getPluginInstanceWithSigner()
      .supportRequiredPct();
  }

  /**
   * Votes on a proposal
   * Returns a generator with 2 steps
   *
   * @param {IVoteParams} params
   * @return {*}  {AsyncGenerator<VoteStepsValue>}
   * @memberof AllowlistVotingMethods
   */
  public async *vote(params: IVoteParams): AsyncGenerator<VoteStepsValue> {
    const tx = await this.allowlistVoting
      .getPluginInstanceWithSigner()
      .vote(params._voteId, params._choice, params._executesIfDecided);
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
   * @return {*}  {Promise<BigNumber>}
   * @memberof AllowlistVotingMethods
   */
  public votesLength(): Promise<BigNumber> {
    return this.allowlistVoting.getPluginInstanceWithSigner().votesLength();
  }

  /**
   * Private helpers to search for an event
   *
   * @private
   * @param {ContractReceipt} receipt
   * @param {string} eventName
   * @return {*}  {EthersEvent[]}
   * @memberof AllowlistVotingMethods
   */
  private getEventsByName(
    receipt: ContractReceipt,
    eventName: string
  ): EthersEvent[] {
    const eventTopic = this.allowlistVoting.pluginInstance.interface.getEventTopic(
      eventName
    );
    return (
      receipt.events?.filter(event => event.topics[0] === eventTopic) || []
    );
  }
}
