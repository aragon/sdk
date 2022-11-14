import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { BytesLike } from "@ethersproject/bytes";
import {
  ContractReceipt,
  Event as EthersEvent,
} from "@ethersproject/contracts";
import { AllowlistVoting } from "../client";
import {
  Steps,
  Vote,
  VoteAction,
  VoteCreationValue,
  VoteStepsValue,
} from "../interfaces";
import { CreateVoteError } from "./errors";

export class AllowlistVotingMethods {
  private allowlistVoting: AllowlistVoting;

  constructor(allowlistVoting: AllowlistVoting) {
    this.allowlistVoting = allowlistVoting;
  }

  public MODIFY_ALLOWLIST_PERMISSION_ID(): Promise<string> {
    return this.allowlistVoting
      .getConnectedPluginInstance()
      .MODIFY_ALLOWLIST_PERMISSION_ID();
  }

  public PCT_BASE(): Promise<BigNumber> {
    return this.allowlistVoting.getConnectedPluginInstance().PCT_BASE();
  }

  public SET_CONFIGURATION_PERMISSION_ID(): Promise<string> {
    return this.allowlistVoting
      .getConnectedPluginInstance()
      .SET_CONFIGURATION_PERMISSION_ID();
  }

  public UPGRADE_PLUGIN_PERMISSION_ID(): Promise<string> {
    return this.allowlistVoting
      .getConnectedPluginInstance()
      .UPGRADE_PLUGIN_PERMISSION_ID();
  }

  public async *addAllowedUsers(
    _users: string[]
  ): AsyncGenerator<VoteStepsValue> {
    const tx = await this.allowlistVoting
      .getConnectedPluginInstance()
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
      .getConnectedPluginInstance()
      .allowedUserCount(blockNumber);
  }

  public canExecute(_voteId: BigNumberish): Promise<boolean> {
    return this.allowlistVoting
      .getConnectedPluginInstance()
      .canExecute(_voteId);
  }

  public canVote(_voteId: BigNumberish, _voter: string): Promise<boolean> {
    return this.allowlistVoting
      .getConnectedPluginInstance()
      .canVote(_voteId, _voter);
  }

  public async *createProposal(
    _proposalMetadata: BytesLike,
    _actions: VoteAction[],
    _startDate: BigNumberish,
    _endDate: BigNumberish,
    _executeIfDecided: boolean,
    _choice: BigNumberish
  ): AsyncGenerator<VoteCreationValue> {
    const tx = await this.allowlistVoting
      .getConnectedPluginInstance()
      .createVote(
        _proposalMetadata,
        _actions,
        _startDate,
        _endDate,
        _executeIfDecided,
        _choice
      );

    yield {
      key: Steps.PENDING,
      txHash: tx.hash,
    };

    const receipt = await tx.wait();
    const voteCreatedEvents = this.getEventsByName(receipt, "VoteCreated");

    if (voteCreatedEvents.length !== 1) {
      throw new CreateVoteError();
    }

    yield {
      key: Steps.DONE,
      voteId: parseInt(voteCreatedEvents[0].topics[1]),
    };
  }

  public async *execute(_voteId: BigNumberish): AsyncGenerator<VoteStepsValue> {
    const tx = await this.allowlistVoting
      .getConnectedPluginInstance()
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
    return this.allowlistVoting.getConnectedPluginInstance().getDAO();
  }

  public getImplementationAddress(): Promise<string> {
    return this.allowlistVoting
      .getConnectedPluginInstance()
      .getImplementationAddress();
  }

  public async getVote(_voteId: BigNumberish): Promise<Vote> {
    const voteData = await this.allowlistVoting
      .getConnectedPluginInstance()
      .getVote(_voteId);
    const vote = new Vote(
      _voteId,
      voteData.open,
      voteData.executed,
      voteData.startDate,
      voteData.endDate,
      voteData.snapshotBlock,
      voteData.supportRequired,
      voteData.participationRequired,
      voteData.votingPower,
      voteData.yes,
      voteData.no,
      voteData.abstain,
      voteData.actions
    );
    return vote;
  }

  public getVoteOption(_voteId: BigNumberish, _voter: string): Promise<number> {
    return this.allowlistVoting
      .getConnectedPluginInstance()
      .getVoteOption(_voteId, _voter);
  }

  public isAllowed(
    account: string,
    blockNumber: BigNumberish
  ): Promise<boolean> {
    return this.allowlistVoting
      .getConnectedPluginInstance()
      .isAllowed(account, blockNumber);
  }

  public minDuration(): Promise<BigNumber> {
    return this.allowlistVoting.getConnectedPluginInstance().minDuration();
  }

  public participationRequiredPct(): Promise<BigNumber> {
    return this.allowlistVoting
      .getConnectedPluginInstance()
      .participationRequiredPct();
  }

  public pluginType(): Promise<number> {
    return this.allowlistVoting.getConnectedPluginInstance().pluginType();
  }

  public proxiableUUID(): Promise<string> {
    return this.allowlistVoting.getConnectedPluginInstance().proxiableUUID();
  }

  public async *removeAllowedUsers(
    _users: string[]
  ): AsyncGenerator<VoteStepsValue> {
    const tx = await this.allowlistVoting
      .getConnectedPluginInstance()
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
    _participationRequiredPct: BigNumberish,
    _supportRequiredPct: BigNumberish,
    _minDuration: BigNumberish
  ): AsyncGenerator<VoteStepsValue> {
    const tx = await this.allowlistVoting
      .getConnectedPluginInstance()
      .setConfiguration(
        _participationRequiredPct,
        _supportRequiredPct,
        _minDuration
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
      .getConnectedPluginInstance()
      .supportRequiredPct();
  }

  public async *vote(
    _voteId: BigNumberish,
    _choice: BigNumberish,
    _executesIfDecided: boolean
  ): AsyncGenerator<VoteStepsValue> {
    const tx = await this.allowlistVoting
      .getConnectedPluginInstance()
      .vote(_voteId, _choice, _executesIfDecided);
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
    return this.allowlistVoting.getConnectedPluginInstance().votesLength();
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
