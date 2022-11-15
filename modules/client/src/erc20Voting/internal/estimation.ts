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
   * @memberof ERC20VotingEstimation
   */
  public async execute(_proposalId: BigNumberish): Promise<BigNumber> {
    return this.ERC20Voting.getPluginInstance().estimateGas.execute(
      _proposalId
    );
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
   * @memberof ERC20VotingEstimation
   */
  public async vote(params: IVoteParams): Promise<BigNumber> {
    return this.ERC20Voting.getPluginInstance().estimateGas.vote(
      BigNumber.from(params._proposalId),
      BigNumber.from(params._choice),
      params._executesIfDecided
    );
  }
}
