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
    return this.allowlistVoting.getPluginInstance().estimateGas.createVote(
      params._proposalMetadata,
      params._actions.map(action => ({
        ...action,
        value: BigNumber.from(action.value),
      })),
      BigNumber.from(params._startDate),
      BigNumber.from(params._endDate),
      params._executeIfDecided,
      BigNumber.from(params._choice)
    );
  }

  /**
   * Returns a gas estimation for the function call to execute
   *
   * @param {BigNumberish} _proposalId
   * @return {*}  {Promise<BigNumber>}
   * @memberof AllowlistVotingEstimation
   */
  public async execute(_proposalId: BigNumberish): Promise<BigNumber> {
    return this.allowlistVoting
      .getPluginInstance()
      .estimateGas.execute(_proposalId);
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
        BigNumber.from(params._participationRequiredPct),
        BigNumber.from(params._supportRequiredPct),
        BigNumber.from(params._minDuration)
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
        BigNumber.from(params._proposalId),
        BigNumber.from(params._choice),
        params._executesIfDecided
      );
  }
}
