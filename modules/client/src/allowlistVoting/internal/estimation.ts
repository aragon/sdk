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

  /**
   * Returns a gas estimation for the function call to addAllowedUsers
   *
   * @param {string[]} _users
   * @return {*}  {Promise<BigNumber>}
   * @memberof AllowlistVotingEstimation
   */
  public async addAllowedUsers(_users: string[]): Promise<BigNumber> {
    return this.allowlistVoting
      .getPluginInstance()
      .estimateGas.addAllowedUsers(_users);
  }

  /**
   * Returns a gas estimation for the function call to createProposal
   *
   * @param {ICreateProposalParams} params
   * @return {*}  {Promise<BigNumber>}
   * @memberof AllowlistVotingEstimation
   */
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

  /**
   * Returns a gas estimation for the function call to execute
   *
   * @param {BigNumberish} _voteId
   * @return {*}  {Promise<BigNumber>}
   * @memberof AllowlistVotingEstimation
   */
  public async execute(_voteId: BigNumberish): Promise<BigNumber> {
    return this.allowlistVoting
      .getPluginInstance()
      .estimateGas.execute(_voteId);
  }

  /**
   * Returns a gas estimation for the function call to removeAllowedUsers
   *
   * @param {string[]} _users
   * @return {*}  {Promise<BigNumber>}
   * @memberof AllowlistVotingEstimation
   */
  public async removeAllowedUsers(_users: string[]): Promise<BigNumber> {
    return this.allowlistVoting
      .getPluginInstance()
      .estimateGas.removeAllowedUsers(_users);
  }

  /**
   * Returns a gas estimation for the function call to setConfiguration
   *
   * @param {ISetConfigurationParams} params
   * @return {*}  {Promise<BigNumber>}
   * @memberof AllowlistVotingEstimation
   */
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

  /**
   * Returns a gas estimation for the function call to vote
   *
   * @param {IVoteParams} params
   * @return {*}  {Promise<BigNumber>}
   * @memberof AllowlistVotingEstimation
   */
  public async vote(params: IVoteParams): Promise<BigNumber> {
    return this.allowlistVoting
      .getPluginInstance()
      .estimateGas.vote(
        params._voteId,
        params._choice,
        params._executesIfDecided
      );
  }
}
