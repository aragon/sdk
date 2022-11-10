import { BigNumber, BigNumberish, BytesLike } from "ethers";
import { ERC20Voting } from "../client";
import { Steps, Vote, VoteAction, VoteCreationValue } from "../interfaces";

export class ERC20VotingMethods {
  private erc20Voting: ERC20Voting;

  constructor(erc20Voting: ERC20Voting) {
    this.erc20Voting = erc20Voting;
  }

  public PCT_BASE(): Promise<BigNumber> {
    return this.erc20Voting.getConnectedPluginInstance().PCT_BASE();
  }

  public SET_CONFIGURATION_PERMISSION_ID(): Promise<string> {
    return this.erc20Voting
      .getConnectedPluginInstance()
      .SET_CONFIGURATION_PERMISSION_ID();
  }

  public UPGRADE_PLUGIN_PERMISSION_ID(): Promise<string> {
    return this.erc20Voting
      .getConnectedPluginInstance()
      .UPGRADE_PLUGIN_PERMISSION_ID();
  }

  public canExecute(_voteId: BigNumberish): Promise<boolean> {
    return this.erc20Voting.getConnectedPluginInstance().canExecute(_voteId);
  }

  public canVote(_voteId: BigNumberish, _voter: string): Promise<boolean> {
    return this.erc20Voting
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
    const tx = await this.erc20Voting
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
    await tx.wait();
    yield {
      key: Steps.DONE,
      voteId: BigNumber.from("1"),
    };
  }

  public async *execute(_voteId: BigNumberish): AsyncGenerator<Steps> {
    const tx = await this.erc20Voting
      .getConnectedPluginInstance()
      .execute(_voteId);
    yield Steps.PENDING;
    await tx.wait();
    yield Steps.DONE;
  }

  public getDAO(): Promise<string> {
    return this.erc20Voting.getConnectedPluginInstance().getDAO();
  }

  public getImplementationAddress(): Promise<string> {
    return this.erc20Voting
      .getConnectedPluginInstance()
      .getImplementationAddress();
  }

  public async getVote(_voteId: BigNumberish): Promise<Vote> {
    const voteData = (await this.erc20Voting
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
    return this.erc20Voting
      .getConnectedPluginInstance()
      .getVoteOption(_voteId, _voter);
  }

  public getVotingToken(): Promise<string> {
    return this.erc20Voting.getConnectedPluginInstance().getVotingToken();
  }

  public minDuration(): Promise<BigNumber> {
    return this.erc20Voting.getConnectedPluginInstance().minDuration();
  }

  public participationRequiredPct(): Promise<BigNumber> {
    return this.erc20Voting
      .getConnectedPluginInstance()
      .participationRequiredPct();
  }

  public pluginType(): Promise<number> {
    return this.erc20Voting.getConnectedPluginInstance().pluginType();
  }

  public proxiableUUID(): Promise<string> {
    return this.erc20Voting.getConnectedPluginInstance().proxiableUUID();
  }

  public async *setConfiguration(
    _participationRequiredPct: BigNumberish,
    _supportRequiredPct: BigNumberish,
    _minDuration: BigNumberish
  ): AsyncGenerator<Steps> {
    const tx = await this.erc20Voting
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
    return this.erc20Voting.getConnectedPluginInstance().supportRequiredPct();
  }

  public async *vote(
    _voteId: BigNumberish,
    _choice: BigNumberish,
    _executesIfDecided: boolean
  ): AsyncGenerator<Steps> {
    const tx = await this.erc20Voting
      .getConnectedPluginInstance()
      .vote(_voteId, _choice, _executesIfDecided);
    yield Steps.PENDING;
    await tx.wait();
    yield Steps.DONE;
  }

  public votesLength(): Promise<BigNumber> {
    return this.erc20Voting.getConnectedPluginInstance().votesLength();
  }
}
