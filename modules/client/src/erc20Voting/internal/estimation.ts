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

  /**
   * Returns a gas estimation for the function call to createProposal
   *
   * @param {ICreateProposalParams} params
   * @return {*}  {Promise<BigNumber>}
   * @memberof ERC20VotingEstimation
   */
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

  /**
   * Returns a gas estimation for the function call to execute
   *
   * @param {BigNumberish} _voteId
   * @return {*}  {Promise<BigNumber>}
   * @memberof ERC20VotingEstimation
   */
  public async execute(_voteId: BigNumberish): Promise<BigNumber> {
    return this.ERC20Voting.getPluginInstance().estimateGas.execute(_voteId);
  }

  /**
   * Returns a gas estimation for the function call to setConfiguration
   *
   * @param {ISetConfigurationParams} params
   * @return {*}  {Promise<BigNumber>}
   * @memberof ERC20VotingEstimation
   */
  public async setConfiguration(
    params: ISetConfigurationParams
  ): Promise<BigNumber> {
    return this.ERC20Voting.getPluginInstance().estimateGas.setConfiguration(
      params._participationRequiredPct,
      params._supportRequiredPct,
      params._minDuration
    );
  }

  /**
   * Returns a gas estimation for the function call to vote
   *
   * @param {IVoteParams} params
   * @return {*}  {Promise<BigNumber>}
   * @memberof ERC20VotingEstimation
   */
  public async vote(params: IVoteParams): Promise<BigNumber> {
    return this.ERC20Voting.getPluginInstance().estimateGas.vote(
      params._voteId,
      params._choice,
      params._executesIfDecided
    );
  }
}
