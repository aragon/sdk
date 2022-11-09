import { BigNumber, BigNumberish, BytesLike } from "ethers";
import { AllowlistVoting } from "../client";
import { VoteAction } from "../interfaces";

export class AllowlistVotingEstimation {
  private allowlistVoting: AllowlistVoting;

  constructor(allowlistVoting: AllowlistVoting) {
    this.allowlistVoting = allowlistVoting;
  }

  public MODIFY_ALLOWLIST_PERMISSION_ID(): Promise<BigNumber> {
    return this.allowlistVoting
      .getConnectedPluginInstance()
      .estimateGas.MODIFY_ALLOWLIST_PERMISSION_ID();
  }

  public PCT_BASE(): Promise<BigNumber> {
    return this.allowlistVoting
      .getConnectedPluginInstance()
      .estimateGas.PCT_BASE();
  }

  public SET_CONFIGURATION_PERMISSION_ID(): Promise<BigNumber> {
    return this.allowlistVoting
      .getConnectedPluginInstance()
      .estimateGas.SET_CONFIGURATION_PERMISSION_ID();
  }

  public UPGRADE_PLUGIN_PERMISSION_ID(): Promise<BigNumber> {
    return this.allowlistVoting
      .getConnectedPluginInstance()
      .estimateGas.UPGRADE_PLUGIN_PERMISSION_ID();
  }

  public async addAllowedUsers(_users: string[]): Promise<BigNumber> {
    return this.allowlistVoting
      .getConnectedPluginInstance()
      .estimateGas.addAllowedUsers(_users);
  }

  public allowedUserCount(blockNumber: BigNumberish): Promise<BigNumber> {
    return this.allowlistVoting
      .getConnectedPluginInstance()
      .estimateGas.allowedUserCount(blockNumber);
  }

  public canExecute(_voteId: BigNumberish): Promise<BigNumber> {
    return this.allowlistVoting
      .getConnectedPluginInstance()
      .estimateGas.canExecute(_voteId);
  }

  public canVote(_voteId: BigNumberish, _voter: string): Promise<BigNumber> {
    return this.allowlistVoting
      .getConnectedPluginInstance()
      .estimateGas.canVote(_voteId, _voter);
  }

  public async createVote(
    _proposalMetadata: BytesLike,
    _actions: VoteAction[],
    _startDate: BigNumberish,
    _endDate: BigNumberish,
    _executeIfDecided: boolean,
    _choice: BigNumberish
  ): Promise<BigNumber> {
    return this.allowlistVoting
      .getConnectedPluginInstance()
      .estimateGas.createVote(
        _proposalMetadata,
        _actions,
        _startDate,
        _endDate,
        _executeIfDecided,
        _choice
      );
  }

  public async execute(_voteId: BigNumberish): Promise<BigNumber> {
    return this.allowlistVoting
      .getConnectedPluginInstance()
      .estimateGas.execute(_voteId);
  }

  public getDAO(): Promise<BigNumber> {
    return this.allowlistVoting
      .getConnectedPluginInstance()
      .estimateGas.getDAO();
  }

  public getImplementationAddress(): Promise<BigNumber> {
    return this.allowlistVoting
      .getConnectedPluginInstance()
      .estimateGas.getImplementationAddress();
  }

  public async getVote(_voteId: BigNumberish): Promise<BigNumber> {
    return this.allowlistVoting
      .getConnectedPluginInstance()
      .estimateGas.getVote(_voteId);
  }

  public getVoteOption(
    _voteId: BigNumberish,
    _voter: string
  ): Promise<BigNumber> {
    return this.allowlistVoting
      .getConnectedPluginInstance()
      .estimateGas.getVoteOption(_voteId, _voter);
  }

  public isAllowed(
    account: string,
    blockNumber: BigNumberish
  ): Promise<BigNumber> {
    return this.allowlistVoting
      .getConnectedPluginInstance()
      .estimateGas.isAllowed(account, blockNumber);
  }

  public minDuration(): Promise<BigNumber> {
    return this.allowlistVoting
      .getConnectedPluginInstance()
      .estimateGas.minDuration();
  }

  public participationRequiredPct(): Promise<BigNumber> {
    return this.allowlistVoting
      .getConnectedPluginInstance()
      .estimateGas.participationRequiredPct();
  }

  public pluginType(): Promise<BigNumber> {
    return this.allowlistVoting
      .getConnectedPluginInstance()
      .estimateGas.pluginType();
  }

  public proxiableUUID(): Promise<BigNumber> {
    return this.allowlistVoting
      .getConnectedPluginInstance()
      .estimateGas.proxiableUUID();
  }

  public async removeAllowedUsers(_users: string[]): Promise<BigNumber> {
    return this.allowlistVoting
      .getConnectedPluginInstance()
      .estimateGas.removeAllowedUsers(_users);
  }

  public async setConfiguration(
    _participationRequiredPct: BigNumberish,
    _supportRequiredPct: BigNumberish,
    _minDuration: BigNumberish
  ): Promise<BigNumber> {
    return this.allowlistVoting
      .getConnectedPluginInstance()
      .estimateGas.setConfiguration(
        _participationRequiredPct,
        _supportRequiredPct,
        _minDuration
      );
  }

  public supportRequiredPct(): Promise<BigNumber> {
    return this.allowlistVoting
      .getConnectedPluginInstance()
      .estimateGas.supportRequiredPct();
  }

  public async vote(
    _voteId: BigNumberish,
    _choice: BigNumberish,
    _executesIfDecided: boolean
  ): Promise<BigNumber> {
    return this.allowlistVoting
      .getConnectedPluginInstance()
      .estimateGas.vote(_voteId, _choice, _executesIfDecided);
  }

  public votesLength(): Promise<BigNumber> {
    return this.allowlistVoting
      .getConnectedPluginInstance()
      .estimateGas.votesLength();
  }
}
