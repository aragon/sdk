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
  Vote,
  VoteCreationValue,
  VoteStepsValue,
} from "../interfaces";

export class AllowlistVotingMethods {
  private allowlistVoting: AllowlistVoting;

  constructor(allowlistVoting: AllowlistVoting) {
    this.allowlistVoting = allowlistVoting;
  }

  public MODIFY_ALLOWLIST_PERMISSION_ID(): Promise<string> {
    return this.allowlistVoting
      .getPluginInstanceWithSigner()
      .MODIFY_ALLOWLIST_PERMISSION_ID();
  }

  public PCT_BASE(): Promise<BigNumber> {
    return this.allowlistVoting.getPluginInstanceWithSigner().PCT_BASE();
  }

  public SET_CONFIGURATION_PERMISSION_ID(): Promise<string> {
    return this.allowlistVoting
      .getPluginInstanceWithSigner()
      .SET_CONFIGURATION_PERMISSION_ID();
  }

  public UPGRADE_PLUGIN_PERMISSION_ID(): Promise<string> {
    return this.allowlistVoting
      .getPluginInstanceWithSigner()
      .UPGRADE_PLUGIN_PERMISSION_ID();
  }

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

  public allowedUserCount(blockNumber: BigNumberish): Promise<BigNumber> {
    return this.allowlistVoting
      .getPluginInstanceWithSigner()
      .allowedUserCount(blockNumber);
  }

  public canExecute(_voteId: BigNumberish): Promise<boolean> {
    return this.allowlistVoting
      .getPluginInstanceWithSigner()
      .canExecute(_voteId);
  }

  public canVote(_voteId: BigNumberish, _voter: string): Promise<boolean> {
    return this.allowlistVoting
      .getPluginInstanceWithSigner()
      .canVote(_voteId, _voter);
  }

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

  public getDAO(): Promise<string> {
    return this.allowlistVoting.getPluginInstanceWithSigner().getDAO();
  }

  public getImplementationAddress(): Promise<string> {
    return this.allowlistVoting
      .getPluginInstanceWithSigner()
      .getImplementationAddress();
  }

  public async getVote(_voteId: BigNumberish): Promise<Vote> {
    const voteData = await this.allowlistVoting
      .getPluginInstanceWithSigner()
      .getVote(_voteId);
    const vote: Vote = {
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
      actions: voteData.actions,
    };
    return vote;
  }

  public getVoteOption(_voteId: BigNumberish, _voter: string): Promise<number> {
    return this.allowlistVoting
      .getPluginInstanceWithSigner()
      .getVoteOption(_voteId, _voter);
  }

  public isAllowed(
    account: string,
    blockNumber: BigNumberish
  ): Promise<boolean> {
    return this.allowlistVoting
      .getPluginInstanceWithSigner()
      .isAllowed(account, blockNumber);
  }

  public minDuration(): Promise<BigNumber> {
    return this.allowlistVoting.getPluginInstanceWithSigner().minDuration();
  }

  public participationRequiredPct(): Promise<BigNumber> {
    return this.allowlistVoting
      .getPluginInstanceWithSigner()
      .participationRequiredPct();
  }

  public pluginType(): Promise<number> {
    return this.allowlistVoting.getPluginInstanceWithSigner().pluginType();
  }

  public proxiableUUID(): Promise<string> {
    return this.allowlistVoting.getPluginInstanceWithSigner().proxiableUUID();
  }

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

  public supportRequiredPct(): Promise<BigNumber> {
    return this.allowlistVoting
      .getPluginInstanceWithSigner()
      .supportRequiredPct();
  }

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

  public votesLength(): Promise<BigNumber> {
    return this.allowlistVoting.getPluginInstanceWithSigner().votesLength();
  }

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
