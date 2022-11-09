import { BigNumber, BigNumberish, BytesLike } from "ethers";
import { AllowlistVoting } from "../client";
import { Steps, Vote, VoteAction, VoteCreationValue } from "../interfaces";

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

  public async *addAllowedUsers(_users: string[]): AsyncGenerator<Steps> {
    const tx = await this.allowlistVoting
      .getConnectedPluginInstance()
      .addAllowedUsers(_users);
    yield Steps.PENDING;
    await tx.wait();
    yield Steps.DONE;
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

  public async *createVote(
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
    const voteCreatedEvent = receipt.events?.find(
      event => event.event === "VoteCreated"
    );
    console.log(voteCreatedEvent);

    yield {
      key: Steps.DONE,
      voteId: BigNumber.from("1"),
    };
  }

  public async *execute(_voteId: BigNumberish): AsyncGenerator<Steps> {
    const tx = await this.allowlistVoting
      .getConnectedPluginInstance()
      .execute(_voteId);
    yield Steps.PENDING;
    await tx.wait();
    yield Steps.DONE;
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
    const voteData = (await this.allowlistVoting
      .getConnectedPluginInstance()
      .getVote(_voteId)) as Vote;
    const vote = new Vote();
    for (const key of Object.keys(vote)) {
      if (vote.hasOwnProperty(key) && voteData.hasOwnProperty(key)) {
        vote[key] = voteData[key];
      }
    }
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

  public async *removeAllowedUsers(_users: string[]): AsyncGenerator<Steps> {
    const tx = await this.allowlistVoting
      .getConnectedPluginInstance()
      .removeAllowedUsers(_users);
    yield Steps.PENDING;
    await tx.wait();
    yield Steps.DONE;
  }

  public async *setConfiguration(
    _participationRequiredPct: BigNumberish,
    _supportRequiredPct: BigNumberish,
    _minDuration: BigNumberish
  ): AsyncGenerator<Steps> {
    const tx = await this.allowlistVoting
      .getConnectedPluginInstance()
      .setConfiguration(
        _participationRequiredPct,
        _supportRequiredPct,
        _minDuration
      );
    yield Steps.PENDING;
    await tx.wait();
    yield Steps.DONE;
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
  ): AsyncGenerator<Steps> {
    const tx = await this.allowlistVoting
      .getConnectedPluginInstance()
      .vote(_voteId, _choice, _executesIfDecided);
    yield Steps.PENDING;
    await tx.wait();
    yield Steps.DONE;
  }

  public votesLength(): Promise<BigNumber> {
    return this.allowlistVoting.getConnectedPluginInstance().votesLength();
  }
}
