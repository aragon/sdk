import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
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
  VoteCreationValue,
  VoteStepsValue,
} from "../interfaces";
import { arrayify } from "@ethersproject/bytes";

export class ERC20VotingMethods {
  private ERC20Voting: ERC20Voting;

  constructor(ERC20Voting: ERC20Voting) {
    this.ERC20Voting = ERC20Voting;
  }

  public PCT_BASE(): Promise<BigNumber> {
    return this.ERC20Voting.getPluginInstanceWithSigner().PCT_BASE();
  }

  public SET_CONFIGURATION_PERMISSION_ID(): Promise<string> {
    return this.ERC20Voting.getPluginInstanceWithSigner().SET_CONFIGURATION_PERMISSION_ID();
  }

  public UPGRADE_PLUGIN_PERMISSION_ID(): Promise<string> {
    return this.ERC20Voting.getPluginInstanceWithSigner().UPGRADE_PLUGIN_PERMISSION_ID();
  }

  public canExecute(_voteId: BigNumberish): Promise<boolean> {
    return this.ERC20Voting.getPluginInstanceWithSigner().canExecute(_voteId);
  }

  public canVote(_voteId: BigNumberish, _voter: string): Promise<boolean> {
    return this.ERC20Voting.getPluginInstanceWithSigner().canVote(
      _voteId,
      _voter
    );
  }

  public async *createProposal(
    params: ICreateProposalParams
  ): AsyncGenerator<VoteCreationValue> {
    const tx = await this.ERC20Voting.getPluginInstanceWithSigner().createVote(
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

  public async *execute(_voteId: BigNumberish): AsyncGenerator<VoteStepsValue> {
    const tx = await this.ERC20Voting.getPluginInstanceWithSigner().execute(
      _voteId
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

  public getDAO(): Promise<string> {
    return this.ERC20Voting.getPluginInstanceWithSigner().getDAO();
  }

  public getImplementationAddress(): Promise<string> {
    return this.ERC20Voting.getPluginInstanceWithSigner().getImplementationAddress();
  }

  public async getVote(_voteId: BigNumberish): Promise<Proposal> {
    const voteData = await this.ERC20Voting.getPluginInstanceWithSigner().getVote(
      _voteId
    );
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

  public getVoteOption(_voteId: BigNumberish, _voter: string): Promise<number> {
    return this.ERC20Voting.getPluginInstanceWithSigner().getVoteOption(
      _voteId,
      _voter
    );
  }

  public minDuration(): Promise<BigNumber> {
    return this.ERC20Voting.getPluginInstanceWithSigner().minDuration();
  }

  public participationRequiredPct(): Promise<BigNumber> {
    return this.ERC20Voting.getPluginInstanceWithSigner().participationRequiredPct();
  }

  public pluginType(): Promise<number> {
    return this.ERC20Voting.getPluginInstanceWithSigner().pluginType();
  }

  public proxiableUUID(): Promise<string> {
    return this.ERC20Voting.getPluginInstanceWithSigner().proxiableUUID();
  }

  public async *setConfiguration(
    params: ISetConfigurationParams
  ): AsyncGenerator<VoteStepsValue> {
    const tx = await this.ERC20Voting.getPluginInstanceWithSigner().setConfiguration(
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

  public supportRequiredPct(): Promise<BigNumber> {
    return this.ERC20Voting.getPluginInstanceWithSigner().supportRequiredPct();
  }

  public async *vote(params: IVoteParams): AsyncGenerator<VoteStepsValue> {
    const tx = await this.ERC20Voting.getPluginInstanceWithSigner().vote(
      params._voteId,
      params._choice,
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

  public votesLength(): Promise<BigNumber> {
    return this.ERC20Voting.getPluginInstanceWithSigner().votesLength();
  }

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
