import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { ERC20Voting } from "../client";
import {
  ICreateProposalParams,
  ISetConfigurationParams,
  IVoteParams,
} from "../interfaces";

export class ERC20VotingEstimation {
  private ERC20Voting: ERC20Voting;

  constructor(ERC20Voting: ERC20Voting) {
    this.ERC20Voting = ERC20Voting;
  }

  public PCT_BASE(): Promise<BigNumber> {
    return this.ERC20Voting.getPluginInstance().estimateGas.PCT_BASE();
  }

  public SET_CONFIGURATION_PERMISSION_ID(): Promise<BigNumber> {
    return this.ERC20Voting.getPluginInstance().estimateGas.SET_CONFIGURATION_PERMISSION_ID();
  }

  public UPGRADE_PLUGIN_PERMISSION_ID(): Promise<BigNumber> {
    return this.ERC20Voting.getPluginInstance().estimateGas.UPGRADE_PLUGIN_PERMISSION_ID();
  }

  public canExecute(_voteId: BigNumberish): Promise<BigNumber> {
    return this.ERC20Voting.getPluginInstance().estimateGas.canExecute(_voteId);
  }

  public canVote(_voteId: BigNumberish, _voter: string): Promise<BigNumber> {
    return this.ERC20Voting.getPluginInstance().estimateGas.canVote(
      _voteId,
      _voter
    );
  }

  public async createProposal(
    params: ICreateProposalParams
  ): Promise<BigNumber> {
    return this.ERC20Voting.getPluginInstance().estimateGas.createVote(
      params._proposalMetadata,
      params._actions,
      params._startDate,
      params._endDate,
      params._executeIfDecided,
      params._choice
    );
  }

  public async execute(_voteId: BigNumberish): Promise<BigNumber> {
    return this.ERC20Voting.getPluginInstance().estimateGas.execute(_voteId);
  }

  public getDAO(): Promise<BigNumber> {
    return this.ERC20Voting.getPluginInstance().estimateGas.getDAO();
  }

  public getImplementationAddress(): Promise<BigNumber> {
    return this.ERC20Voting.getPluginInstance().estimateGas.getImplementationAddress();
  }

  public async getVote(_voteId: BigNumberish): Promise<BigNumber> {
    return this.ERC20Voting.getPluginInstance().estimateGas.getVote(_voteId);
  }

  public getVoteOption(
    _voteId: BigNumberish,
    _voter: string
  ): Promise<BigNumber> {
    return this.ERC20Voting.getPluginInstance().estimateGas.getVoteOption(
      _voteId,
      _voter
    );
  }

  public minDuration(): Promise<BigNumber> {
    return this.ERC20Voting.getPluginInstance().estimateGas.minDuration();
  }

  public participationRequiredPct(): Promise<BigNumber> {
    return this.ERC20Voting.getPluginInstance().estimateGas.participationRequiredPct();
  }

  public pluginType(): Promise<BigNumber> {
    return this.ERC20Voting.getPluginInstance().estimateGas.pluginType();
  }

  public proxiableUUID(): Promise<BigNumber> {
    return this.ERC20Voting.getPluginInstance().estimateGas.proxiableUUID();
  }

  public async setConfiguration(
    params: ISetConfigurationParams
  ): Promise<BigNumber> {
    return this.ERC20Voting.getPluginInstance().estimateGas.setConfiguration(
      params._participationRequiredPct,
      params._supportRequiredPct,
      params._minDuration
    );
  }

  public supportRequiredPct(): Promise<BigNumber> {
    return this.ERC20Voting.getPluginInstance().estimateGas.supportRequiredPct();
  }

  public async vote(params: IVoteParams): Promise<BigNumber> {
    return this.ERC20Voting.getPluginInstance().estimateGas.vote(
      params._voteId,
      params._choice,
      params._executesIfDecided
    );
  }

  public votesLength(): Promise<BigNumber> {
    return this.ERC20Voting.getPluginInstance().estimateGas.votesLength();
  }
}
