import { BigNumber } from "@ethersproject/bignumber";
import {
  ContractReceipt,
  Event as EthersEvent,
} from "@ethersproject/contracts";
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
import { ClientCore, Context } from "../../client-common";
import {
  AllowlistVoting,
  AllowlistVoting__factory,
} from "@aragon/core-contracts-ethers";
import { NoProviderError, NoSignerError } from "@aragon/sdk-common";

export class AddresslistMethods extends ClientCore {
  constructor(context: Context) {
    super(context);
  }

  /**
   * Gets a plugin instance connected with a provider for the given address
   *
   * @private
   * @param {string} addr
   * @return {*}  {AllowlistVoting}
   * @memberof AddresslistMethods
   */
  private getConnectedPluginInstance(addr: string): AllowlistVoting {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new NoSignerError();
    } else if (!signer.provider) {
      throw new NoProviderError();
    }

    return AllowlistVoting__factory.connect(addr, signer);
  }

  /**
   * Returns the basePrecentage used in the contract to compare percentages despite the lack of floating point arithmetic
   *
   * @param {string} pluginAddr
   * @return {*}  {Promise<number>}
   * @memberof AddresslistMethods
   */
  public async basePrecentage(pluginAddr: string): Promise<number> {
    return (
      await this.getConnectedPluginInstance(pluginAddr).PCT_BASE()
    ).toNumber();
  }

  /**
   * Adds new allowed users to the plugin.
   * Returns a generator with 2 steps
   *
   * @param {string} pluginAddr
   * @param {string[]} _users
   * @return {*}  {AsyncGenerator<VoteStepsValue>}
   * @memberof AddresslistMethods
   */
  public async *addAllowedUsers(
    pluginAddr: string,
    _users: string[]
  ): AsyncGenerator<VoteStepsValue> {
    const tx = await this.getConnectedPluginInstance(
      pluginAddr
    ).addAllowedUsers(_users);
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
   * @param {string} pluginAddr
   * @param {bigint} blockNumber
   * @return {*}  {Promise<bigint | number>}
   * @memberof AddresslistMethods
   */
  public async allowedUserCount(
    pluginAddr: string,
    blockNumber: bigint | number
  ): Promise<bigint> {
    return (
      await this.getConnectedPluginInstance(pluginAddr).allowedUserCount(
        BigNumber.from(blockNumber)
      )
    ).toBigInt();
  }

  /**
   * Checks if a proposal can be executed
   *
   * @param {string} pluginAddr
   * @param {number} _proposalId
   * @return {*}  {Promise<boolean>}
   * @memberof AddresslistMethods
   */
  public canExecute(pluginAddr: string, _proposalId: number): Promise<boolean> {
    return this.getConnectedPluginInstance(pluginAddr).canExecute(_proposalId);
  }

  /**
   * Checks if a voter can vote on a proposal
   *
   * @param {string} pluginAddr
   * @param {number} _proposalId
   * @param {string} _voter
   * @return {*}  {Promise<boolean>}
   * @memberof AddresslistMethods
   */
  public canVote(
    pluginAddr: string,
    _proposalId: number,
    _voter: string
  ): Promise<boolean> {
    return this.getConnectedPluginInstance(pluginAddr).canVote(
      _proposalId,
      _voter
    );
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
    const tx = await this.getConnectedPluginInstance(
      params.pluginAddr
    ).createVote(
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
   * @param {string} pluginAddr
   * @param {number} _proposalId
   * @return {*}  {AsyncGenerator<VoteStepsValue>}
   * @memberof AddresslistMethods
   */
  public async *execute(
    pluginAddr: string,
    _proposalId: number
  ): AsyncGenerator<VoteStepsValue> {
    const tx = await this.getConnectedPluginInstance(pluginAddr).execute(
      _proposalId
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
   * @param {string} pluginAddr
   * @return {*}  {Promise<string>}
   * @memberof AddresslistMethods
   */
  public getDAO(pluginAddr: string): Promise<string> {
    return this.getConnectedPluginInstance(pluginAddr).getDAO();
  }

  /**
   * Returns the address of the implementation contract used for the proxy.
   *
   * @param {string} pluginAddr
   * @return {*}  {Promise<string>}
   * @memberof AddresslistMethods
   */
  public getImplementationAddress(pluginAddr: string): Promise<string> {
    return this.getConnectedPluginInstance(
      pluginAddr
    ).getImplementationAddress();
  }

  /**
   * Returns the proposal
   *
   * @param {string} pluginAddr
   * @param {number} _proposalId
   * @return {*}  {Promise<Proposal>}
   * @memberof AddresslistMethods
   */
  public async getProposal(
    pluginAddr: string,
    _proposalId: number
  ): Promise<Proposal> {
    const proposalData = await this.getConnectedPluginInstance(
      pluginAddr
    ).getVote(_proposalId);
    const proposal: Proposal = {
      id: _proposalId,
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
   * @param {string} pluginAddr
   * @param {number} _proposalId
   * @param {string} _voter
   * @return {*}  {Promise<number>}
   * @memberof AddresslistMethods
   */
  public getVoteOption(
    pluginAddr: string,
    _proposalId: number,
    _voter: string
  ): Promise<number> {
    return this.getConnectedPluginInstance(pluginAddr).getVoteOption(
      _proposalId,
      _voter
    );
  }

  /**
   * Checks if a user is allowed on the given block
   *
   * @param {string} pluginAddr
   * @param {string} account
   * @param {bigint | number} blockNumber
   * @return {*}  {Promise<boolean>}
   * @memberof AddresslistMethods
   */
  public isAllowed(
    pluginAddr: string,
    account: string,
    blockNumber: bigint | number
  ): Promise<boolean> {
    return this.getConnectedPluginInstance(pluginAddr).isAllowed(
      account,
      BigNumber.from(blockNumber)
    );
  }

  /**
   * Returns the configured minDuration
   *
   * @param {string} pluginAddr
   * @return {*}  {Promise<number>}
   * @memberof AddresslistMethods
   */
  public async minDuration(pluginAddr: string): Promise<number> {
    return (
      await this.getConnectedPluginInstance(pluginAddr).minDuration()
    ).toNumber();
  }

  /**
   * Returns the configured participation requirement
   *
   * @param {string} pluginAddr
   * @return {*}  {Promise<number>}
   * @memberof AddresslistMethods
   */
  public async participationRequiredPct(pluginAddr: string): Promise<number> {
    return (
      await this.getConnectedPluginInstance(
        pluginAddr
      ).participationRequiredPct()
    ).toNumber();
  }

  /**
   * Returns the type of this plugin
   *
   * @param {string} pluginAddr
   * @return {*}  {Promise<number>}
   * @memberof AddresslistMethods
   */
  public pluginType(pluginAddr: string): Promise<number> {
    return this.getConnectedPluginInstance(pluginAddr).pluginType();
  }

  /**
   * Returns the proxable UUID
   *
   * @param {string} pluginAddr
   * @return {*}  {Promise<string>}
   * @memberof AddresslistMethods
   */
  public proxiableUUID(pluginAddr: string): Promise<string> {
    return this.getConnectedPluginInstance(pluginAddr).proxiableUUID();
  }

  /**
   * Removes allowed users from the plugin.
   * Returns a generator with 2 steps
   *
   * @param {string} pluginAddr
   * @param {string[]} _users
   * @return {*}  {AsyncGenerator<VoteStepsValue>}
   * @memberof AddresslistMethods
   */
  public async *removeAllowedUsers(
    pluginAddr: string,
    _users: string[]
  ): AsyncGenerator<VoteStepsValue> {
    const tx = await this.getConnectedPluginInstance(
      pluginAddr
    ).removeAllowedUsers(_users);
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
    const tx = await this.getConnectedPluginInstance(
      params.pluginAddr
    ).setConfiguration(
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
   * @param {string} pluginAddr
   * @return {*}  {Promise<number>}
   * @memberof AddresslistMethods
   */
  public async supportRequiredPct(pluginAddr: string): Promise<number> {
    return (
      await this.getConnectedPluginInstance(pluginAddr).supportRequiredPct()
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
    const tx = await this.getConnectedPluginInstance(params.pluginAddr).vote(
      params._proposalId,
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
   * @param {string} pluginAddr
   * @return {*}  {Promise<number>}
   * @memberof AddresslistMethods
   */
  public async proposalsLength(pluginAddr: string): Promise<number> {
    return (
      await this.getConnectedPluginInstance(pluginAddr).votesLength()
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
    const contractInterface = AllowlistVoting__factory.createInterface();
    const eventTopic = contractInterface.getEventTopic(eventName);
    return (
      receipt.events?.filter(event => event.topics[0] === eventTopic) || []
    );
  }
}
