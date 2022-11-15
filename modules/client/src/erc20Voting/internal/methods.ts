import { BigNumber } from "@ethersproject/bignumber";
import {
  ContractReceipt,
  Event as EthersEvent,
} from "@ethersproject/contracts";
import { ERC20Voting } from "../client";
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

export class ERC20VotingMethods {
  private ERC20Voting: ERC20Voting;

  constructor(ERC20Voting: ERC20Voting) {
    this.ERC20Voting = ERC20Voting;
  }

  /**
   * Returns the PCT_BASE
   *
   * @return {*}  {Promise<number>}
   * @memberof ERC20VotingMethods
   */
  public async PCT_BASE(): Promise<number> {
    return (
      await this.ERC20Voting.getPluginInstanceWithSigner().PCT_BASE()
    ).toNumber();
  }

  /**
   * Returns the hash for the SET_CONFIGURATION_PERMISSION permission
   *
   * @return {*}  {Promise<string>}
   * @memberof ERC20VotingMethods
   */
  public SET_CONFIGURATION_PERMISSION_ID(): Promise<string> {
    return this.ERC20Voting.getPluginInstanceWithSigner().SET_CONFIGURATION_PERMISSION_ID();
  }

  /**
   * Returns the hash for the UPGRADE_PLUGIN_PERMISSION permission
   *
   * @return {*}  {Promise<string>}
   * @memberof ERC20VotingMethods
   */
  public UPGRADE_PLUGIN_PERMISSION_ID(): Promise<string> {
    return this.ERC20Voting.getPluginInstanceWithSigner().UPGRADE_PLUGIN_PERMISSION_ID();
  }

  /**
   * Checks if a proposal can be executed
   *
   * @param {BigInt | number} _proposalId
   * @return {*}  {Promise<boolean>}
   * @memberof ERC20VotingMethods
   */
  public canExecute(_proposalId: BigInt | number): Promise<boolean> {
    return this.ERC20Voting.getPluginInstanceWithSigner().canExecute(
      BigNumber.from(_proposalId)
    );
  }

  /**
   * Checks if a voter can vote on a proposal
   *
   * @param {BigInt | number} _proposalId
   * @param {string} _voter
   * @return {*}  {Promise<boolean>}
   * @memberof ERC20VotingMethods
   */
  public canVote(
    _proposalId: BigInt | number,
    _voter: string
  ): Promise<boolean> {
    return this.ERC20Voting.getPluginInstanceWithSigner().canVote(
      BigNumber.from(_proposalId),
      _voter
    );
  }

  /**
   * Creates a new proposal.
   * Returns a generator with 2 steps
   *
   * @param {ICreateProposalParams} params
   * @return {*}  {AsyncGenerator<VoteCreationValue>}
   * @memberof ERC20VotingMethods
   */
  public async *createProposal(
    params: ICreateProposalParams
  ): AsyncGenerator<ProposalCreationValue> {
    const tx = await this.ERC20Voting.getPluginInstanceWithSigner().createVote(
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
   * @memberof ERC20VotingMethods
   */
  public async *execute(
    _proposalId: BigInt | number
  ): AsyncGenerator<VoteStepsValue> {
    const tx = await this.ERC20Voting.getPluginInstanceWithSigner().execute(
      BigNumber.from(_proposalId)
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
   * Returns the DAO address this plugin belongs to
   *
   * @return {*}  {Promise<string>}
   * @memberof ERC20VotingMethods
   */
  public getDAO(): Promise<string> {
    return this.ERC20Voting.getPluginInstanceWithSigner().getDAO();
  }

  /**
   * Returns the address of the implementation contract used for the proxy.
   *
   * @return {*}  {Promise<string>}
   * @memberof ERC20VotingMethods
   */
  public getImplementationAddress(): Promise<string> {
    return this.ERC20Voting.getPluginInstanceWithSigner().getImplementationAddress();
  }

  /**
   * Returns the proposal
   *
   * @param {BigInt | number} _proposalId
   * @return {*}  {Promise<Proposal>}
   * @memberof ERC20VotingMethods
   */
  public async getProposal(_proposalId: BigInt | number): Promise<Proposal> {
    const proposalData = await this.ERC20Voting.getPluginInstanceWithSigner().getVote(
      _proposalId.toString()
    );
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
   * @memberof ERC20VotingMethods
   */
  public getVoteOption(
    _proposalId: BigInt | number,
    _voter: string
  ): Promise<number> {
    return this.ERC20Voting.getPluginInstanceWithSigner().getVoteOption(
      BigNumber.from(_proposalId),
      _voter
    );
  }

  /**
   * Returns the configured minDuration
   *
   * @return {*}  {Promise<number>}
   * @memberof ERC20VotingMethods
   */
  public async minDuration(): Promise<number> {
    return (
      await this.ERC20Voting.getPluginInstanceWithSigner().minDuration()
    ).toNumber();
  }

  /**
   * Returns the configured participation requirement
   *
   * @return {*}  {Promise<number>}
   * @memberof ERC20VotingMethods
   */
  public async participationRequiredPct(): Promise<number> {
    return (
      await this.ERC20Voting.getPluginInstanceWithSigner().participationRequiredPct()
    ).toNumber();
  }

  /**
   * Returns the type of this plugin
   *
   * @return {*}  {Promise<number>}
   * @memberof ERC20VotingMethods
   */
  public pluginType(): Promise<number> {
    return this.ERC20Voting.getPluginInstanceWithSigner().pluginType();
  }

  /**
   * Returns the proxable UUID
   *
   * @return {*}  {Promise<string>}
   * @memberof ERC20VotingMethods
   */
  public proxiableUUID(): Promise<string> {
    return this.ERC20Voting.getPluginInstanceWithSigner().proxiableUUID();
  }

  /**
   * Removes allowed users from the plugin.
   * Returns a generator with 2 steps
   *
   * @param {ISetConfigurationParams} params
   * @return {*}  {AsyncGenerator<VoteStepsValue>}
   * @memberof ERC20VotingMethods
   */
  public async *setConfiguration(
    params: ISetConfigurationParams
  ): AsyncGenerator<VoteStepsValue> {
    const tx = await this.ERC20Voting.getPluginInstanceWithSigner().setConfiguration(
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
   * @memberof ERC20VotingMethods
   */
  public async supportRequiredPct(): Promise<number> {
    return (
      await this.ERC20Voting.getPluginInstanceWithSigner().supportRequiredPct()
    ).toNumber();
  }

  /**
   * Votes on a proposal
   * Returns a generator with 2 steps
   *
   * @param {IVoteParams} params
   * @return {*}  {AsyncGenerator<VoteStepsValue>}
   * @memberof ERC20VotingMethods
   */
  public async *vote(params: IVoteParams): AsyncGenerator<VoteStepsValue> {
    const tx = await this.ERC20Voting.getPluginInstanceWithSigner().vote(
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
   * @memberof ERC20VotingMethods
   */
  public async proposalsLength(): Promise<number> {
    return (
      await this.ERC20Voting.getPluginInstanceWithSigner().votesLength()
    ).toNumber();
  }

  /**
   * Private helpers to search for an event
   *
   * @private
   * @param {ContractReceipt} receipt
   * @param {string} eventName
   * @return {*}  {EthersEvent[]}
   * @memberof ERC20VotingMethods
   */
  private getEventsByName(
    receipt: ContractReceipt,
    eventName: string
  ): EthersEvent[] {
    const eventTopic = this.ERC20Voting.pluginInstance.interface.getEventTopic(
      eventName
    );
    return (
      receipt.events?.filter(event => event.topics[0] === eventTopic) || []
    );
  }
}
