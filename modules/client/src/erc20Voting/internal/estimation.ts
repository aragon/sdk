import { BigNumber, BigNumberish, BytesLike } from "ethers";
import { ERC20Voting } from "../client";
import { VoteAction } from "../interfaces";

export class ERC20VotingEstimation {
  private erc20Voting: ERC20Voting;

  constructor(erc20Voting: ERC20Voting) {
    this.erc20Voting = erc20Voting;
  }

  public PCT_BASE(): Promise<BigNumber> {
    return this.erc20Voting.getConnectedPluginInstance().estimateGas.PCT_BASE();
  }

  public SET_CONFIGURATION_PERMISSION_ID(): Promise<BigNumber> {
    return this.erc20Voting
      .getConnectedPluginInstance()
      .estimateGas.SET_CONFIGURATION_PERMISSION_ID();
  }

  public UPGRADE_PLUGIN_PERMISSION_ID(): Promise<BigNumber> {
    return this.erc20Voting
      .getConnectedPluginInstance()
      .estimateGas.UPGRADE_PLUGIN_PERMISSION_ID();
  }

  public canExecute(_voteId: BigNumberish): Promise<BigNumber> {
    return this.erc20Voting
      .getConnectedPluginInstance()
      .estimateGas.canExecute(_voteId);
  }

  public canVote(_voteId: BigNumberish, _voter: string): Promise<BigNumber> {
    return this.erc20Voting
      .getConnectedPluginInstance()
      .estimateGas.canVote(_voteId, _voter);
  }

  public async createProposal(
    _proposalMetadata: BytesLike,
    _actions: VoteAction[],
    _startDate: BigNumberish,
    _endDate: BigNumberish,
    _executeIfDecided: boolean,
    _choice: BigNumberish
  ): Promise<BigNumber> {
    return this.erc20Voting
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
    return this.erc20Voting
      .getConnectedPluginInstance()
      .estimateGas.execute(_voteId);
  }

  public getDAO(): Promise<BigNumber> {
    return this.erc20Voting.getConnectedPluginInstance().estimateGas.getDAO();
  }

  public getImplementationAddress(): Promise<BigNumber> {
    return this.erc20Voting
      .getConnectedPluginInstance()
      .estimateGas.getImplementationAddress();
  }

  public async getVote(_voteId: BigNumberish): Promise<BigNumber> {
    return this.erc20Voting
      .getConnectedPluginInstance()
      .estimateGas.getVote(_voteId);
  }

  public getVoteOption(
    _voteId: BigNumberish,
    _voter: string
  ): Promise<BigNumber> {
    return this.erc20Voting
      .getConnectedPluginInstance()
      .estimateGas.getVoteOption(_voteId, _voter);
  }

  public minDuration(): Promise<BigNumber> {
    return this.erc20Voting
      .getConnectedPluginInstance()
      .estimateGas.minDuration();
  }

  public participationRequiredPct(): Promise<BigNumber> {
    return this.erc20Voting
      .getConnectedPluginInstance()
      .estimateGas.participationRequiredPct();
  }

  public pluginType(): Promise<BigNumber> {
    return this.erc20Voting
      .getConnectedPluginInstance()
      .estimateGas.pluginType();
  }

  public proxiableUUID(): Promise<BigNumber> {
    return this.erc20Voting
      .getConnectedPluginInstance()
      .estimateGas.proxiableUUID();
  }

  public async setConfiguration(
    _participationRequiredPct: BigNumberish,
    _supportRequiredPct: BigNumberish,
    _minDuration: BigNumberish
  ): Promise<BigNumber> {
    return this.erc20Voting
      .getConnectedPluginInstance()
      .estimateGas.setConfiguration(
        _participationRequiredPct,
        _supportRequiredPct,
        _minDuration
      );
  }

  public supportRequiredPct(): Promise<BigNumber> {
    return this.erc20Voting
      .getConnectedPluginInstance()
      .estimateGas.supportRequiredPct();
  }

  public async vote(
    _voteId: BigNumberish,
    _choice: BigNumberish,
    _executesIfDecided: boolean
  ): Promise<BigNumber> {
    return this.erc20Voting
      .getConnectedPluginInstance()
      .estimateGas.vote(_voteId, _choice, _executesIfDecided);
  }

  public votesLength(): Promise<BigNumber> {
    return this.erc20Voting
      .getConnectedPluginInstance()
      .estimateGas.votesLength();
  }
}
