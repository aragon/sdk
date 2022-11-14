import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { AllowlistVoting } from "../client";
import {
  ICreateProposalParams,
  ISetConfigurationParams,
  IVoteParams,
} from "../interfaces";

export class AllowlistVotingEstimation {
  private allowlistVoting: AllowlistVoting;

  constructor(allowlistVoting: AllowlistVoting) {
    this.allowlistVoting = allowlistVoting;
  }

  public MODIFY_ALLOWLIST_PERMISSION_ID(): Promise<BigNumber> {
    return this.allowlistVoting
      .getPluginInstance()
      .estimateGas.MODIFY_ALLOWLIST_PERMISSION_ID();
  }

  public PCT_BASE(): Promise<BigNumber> {
    return this.allowlistVoting.getPluginInstance().estimateGas.PCT_BASE();
  }

  public SET_CONFIGURATION_PERMISSION_ID(): Promise<BigNumber> {
    return this.allowlistVoting
      .getPluginInstance()
      .estimateGas.SET_CONFIGURATION_PERMISSION_ID();
  }

  public UPGRADE_PLUGIN_PERMISSION_ID(): Promise<BigNumber> {
    return this.allowlistVoting
      .getPluginInstance()
      .estimateGas.UPGRADE_PLUGIN_PERMISSION_ID();
  }

  public async addAllowedUsers(_users: string[]): Promise<BigNumber> {
    return this.allowlistVoting
      .getPluginInstance()
      .estimateGas.addAllowedUsers(_users);
  }

  public allowedUserCount(blockNumber: BigNumberish): Promise<BigNumber> {
    return this.allowlistVoting
      .getPluginInstance()
      .estimateGas.allowedUserCount(blockNumber);
  }

  public canExecute(_voteId: BigNumberish): Promise<BigNumber> {
    return this.allowlistVoting
      .getPluginInstance()
      .estimateGas.canExecute(_voteId);
  }

  public canVote(_voteId: BigNumberish, _voter: string): Promise<BigNumber> {
    return this.allowlistVoting
      .getPluginInstance()
      .estimateGas.canVote(_voteId, _voter);
  }

  public async createProposal(
    params: ICreateProposalParams
  ): Promise<BigNumber> {
    return this.allowlistVoting
      .getPluginInstance()
      .estimateGas.createVote(
        params._proposalMetadata,
        params._actions,
        params._startDate,
        params._endDate,
        params._executeIfDecided,
        params._choice
      );
  }

  public async execute(_voteId: BigNumberish): Promise<BigNumber> {
    return this.allowlistVoting
      .getPluginInstance()
      .estimateGas.execute(_voteId);
  }

  public getDAO(): Promise<BigNumber> {
    return this.allowlistVoting.getPluginInstance().estimateGas.getDAO();
  }

  public getImplementationAddress(): Promise<BigNumber> {
    return this.allowlistVoting
      .getPluginInstance()
      .estimateGas.getImplementationAddress();
  }

  public async getVote(_voteId: BigNumberish): Promise<BigNumber> {
    return this.allowlistVoting
      .getPluginInstance()
      .estimateGas.getVote(_voteId);
  }

  public getVoteOption(
    _voteId: BigNumberish,
    _voter: string
  ): Promise<BigNumber> {
    return this.allowlistVoting
      .getPluginInstance()
      .estimateGas.getVoteOption(_voteId, _voter);
  }

  public isAllowed(
    account: string,
    blockNumber: BigNumberish
  ): Promise<BigNumber> {
    return this.allowlistVoting
      .getPluginInstance()
      .estimateGas.isAllowed(account, blockNumber);
  }

  public minDuration(): Promise<BigNumber> {
    return this.allowlistVoting.getPluginInstance().estimateGas.minDuration();
  }

  public participationRequiredPct(): Promise<BigNumber> {
    return this.allowlistVoting
      .getPluginInstance()
      .estimateGas.participationRequiredPct();
  }

  public pluginType(): Promise<BigNumber> {
    return this.allowlistVoting.getPluginInstance().estimateGas.pluginType();
  }

  public proxiableUUID(): Promise<BigNumber> {
    return this.allowlistVoting.getPluginInstance().estimateGas.proxiableUUID();
  }

  public async removeAllowedUsers(_users: string[]): Promise<BigNumber> {
    return this.allowlistVoting
      .getPluginInstance()
      .estimateGas.removeAllowedUsers(_users);
  }

  public async setConfiguration(
    params: ISetConfigurationParams
  ): Promise<BigNumber> {
    return this.allowlistVoting
      .getPluginInstance()
      .estimateGas.setConfiguration(
        params._participationRequiredPct,
        params._supportRequiredPct,
        params._minDuration
      );
  }

  public supportRequiredPct(): Promise<BigNumber> {
    return this.allowlistVoting
      .getPluginInstance()
      .estimateGas.supportRequiredPct();
  }

  public async vote(params: IVoteParams): Promise<BigNumber> {
    return this.allowlistVoting
      .getPluginInstance()
      .estimateGas.vote(
        params._voteId,
        params._choice,
        params._executesIfDecided
      );
  }

  public votesLength(): Promise<BigNumber> {
    return this.allowlistVoting.getPluginInstance().estimateGas.votesLength();
  }
}
