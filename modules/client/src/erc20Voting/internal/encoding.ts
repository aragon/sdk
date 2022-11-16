import { ERC20Voting__factory } from "@aragon/core-contracts-ethers";
import {
  ICreateProposalParams,
  ISetConfigurationParams,
  IVoteParams,
} from "../interfaces";
import { EncodingResultType } from "../../client-common";
import { arrayify } from "@ethersproject/bytes";

export class ERC20VotingEncoding {
  /**
   * Private helper to encode function data
   *
   * @private
   * @static
   * @param {string} pluginAddr
   * @param {string} functionName
   * @param {...any[]} args
   * @return {*}  {IEncodingResult}
   * @memberof ERC20VotingEncoding
   */
  private static getEncoding(
    pluginAddr: string,
    functionName: string,
    ...args: any[]
  ): EncodingResultType {
    const data = ERC20Voting__factory.createInterface().encodeFunctionData(
      // @ts-ignore functionName is hardcoded by us
      functionName,
      args
    );
    return {
      to: pluginAddr,
      value: 0,
      data: arrayify(data),
    };
  }

  /**
   * Encode parameters for the createProposal function
   *
   * @static
   * @param {ICreateProposalParams} params
   * @return {*}  {IEncodingResult}
   * @memberof ERC20VotingEncoding
   */
  public static createProposal(
    params: ICreateProposalParams
  ): EncodingResultType {
    return this.getEncoding(
      params.pluginAddr,
      "createVote",
      params._proposalMetadata,
      params._actions,
      params._startDate,
      params._endDate,
      params._executeIfDecided,
      params._choice
    );
  }

  /**
   * Encode parameters for the execute function
   *
   * @static
   * @param {string} pluginAddr
   * @param {number} _proposalId
   * @return {*}  {IEncodingResult}
   * @memberof ERC20VotingEncoding
   */
  public static execute(
    pluginAddr: string,
    _proposalId: number
  ): EncodingResultType {
    return ERC20VotingEncoding.getEncoding(pluginAddr, "execute", _proposalId);
  }

  /**
   * Encode parameters for the setConfiguration function
   *
   * @static
   * @param {ISetConfigurationParams} params
   * @return {*}  {IEncodingResult}
   * @memberof ERC20VotingEncoding
   */
  public static setConfiguration(
    params: ISetConfigurationParams
  ): EncodingResultType {
    return ERC20VotingEncoding.getEncoding(
      params.pluginAddr,
      "setConfiguration",
      params._participationRequiredPct,
      params._supportRequiredPct,
      params._minDuration
    );
  }

  /**
   * Encode parameters for the vote function
   *
   * @static
   * @param {IVoteParams} params
   * @return {*}  {IEncodingResult}
   * @memberof ERC20VotingEncoding
   */
  public static vote(params: IVoteParams): EncodingResultType {
    return ERC20VotingEncoding.getEncoding(
      params.pluginAddr,
      "vote",
      params._proposalId,
      params._choice,
      params._executesIfDecided
    );
  }
}
