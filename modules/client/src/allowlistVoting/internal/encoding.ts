import { AllowlistVoting__factory } from "@aragon/core-contracts-ethers";
import { BigNumberish } from "@ethersproject/bignumber";
import {
  ICreateProposalParams,
  ISetConfigurationParams,
  IVoteParams,
} from "../interfaces";
import { IEncodingResult } from "../../client-common";
import { arrayify } from "@ethersproject/bytes";

export class AllowlistVotingEncoding {
  private pluginAddr: string;
  constructor(pluginAddr: string) {
    this.pluginAddr = pluginAddr;
  }

  /**
   * Private helper to encode function data
   *
   * @private
   * @static
   * @param {string} pluginAddr
   * @param {string} functionName
   * @param {...any[]} args
   * @return {*}  {IEncodingResult}
   * @memberof AllowlistVotingEncoding
   */
  private static getEncoding(
    pluginAddr: string,
    functionName: string,
    ...args: any[]
  ): IEncodingResult {
    const data = AllowlistVoting__factory.createInterface().encodeFunctionData(
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
   * Encode parameters for the addAllowedUsers function
   *
   * @static
   * @param {string} pluginAddr
   * @param {string[]} _users
   * @return {*}  {IEncodingResult}
   * @memberof AllowlistVotingEncoding
   */
  public static addAllowedUsers(
    pluginAddr: string,
    _users: string[]
  ): IEncodingResult {
    return AllowlistVotingEncoding.getEncoding(
      pluginAddr,
      "addAllowedUsers",
      _users
    );
  }

  /**
   * Encode parameters for the addAllowedUsers function
   *
   * @param {string[]} _users
   * @return {*}  {IEncodingResult}
   * @memberof AllowlistVotingEncoding
   */
  public addAllowedUsers(_users: string[]): IEncodingResult {
    return AllowlistVotingEncoding.addAllowedUsers(this.pluginAddr, _users);
  }

  /**
   * Encode parameters for the createProposal function
   *
   * @static
   * @param {string} pluginAddr
   * @param {ICreateProposalParams} params
   * @return {*}  {IEncodingResult}
   * @memberof AllowlistVotingEncoding
   */
  public static createProposal(
    pluginAddr: string,
    params: ICreateProposalParams
  ): IEncodingResult {
    return this.getEncoding(
      pluginAddr,
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
   * Encode parameters for the createProposal function
   *
   * @param {ICreateProposalParams} params
   * @return {*}  {IEncodingResult}
   * @memberof AllowlistVotingEncoding
   */
  public createProposal(params: ICreateProposalParams): IEncodingResult {
    return AllowlistVotingEncoding.createProposal(this.pluginAddr, params);
  }

  /**
   * Encode parameters for the addAllowedUsers function
   *
   * @static
   * @param {string} pluginAddr
   * @param {BigNumberish} _voteId
   * @return {*}  {IEncodingResult}
   * @memberof AllowlistVotingEncoding
   */
  public static execute(
    pluginAddr: string,
    _voteId: BigNumberish
  ): IEncodingResult {
    return AllowlistVotingEncoding.getEncoding(pluginAddr, "execute", _voteId);
  }

  /**
   * Encode parameters for the execute function
   *
   * @param {BigNumberish} _voteId
   * @return {*}  {IEncodingResult}
   * @memberof AllowlistVotingEncoding
   */
  public execute(_voteId: BigNumberish): IEncodingResult {
    return AllowlistVotingEncoding.execute(this.pluginAddr, _voteId);
  }

  /**
   * Encode parameters for the removeAllowedUsers function
   *
   * @static
   * @param {string} pluginAddr
   * @param {string[]} _users
   * @return {*}  {IEncodingResult}
   * @memberof AllowlistVotingEncoding
   */
  public static removeAllowedUsers(
    pluginAddr: string,
    _users: string[]
  ): IEncodingResult {
    return AllowlistVotingEncoding.getEncoding(
      pluginAddr,
      "removeAllowedUsers",
      _users
    );
  }

  /**
   * Encode parameters for the removeAllowedUsers function
   *
   * @param {string[]} _users
   * @return {*}  {IEncodingResult}
   * @memberof AllowlistVotingEncoding
   */
  public removeAllowedUsers(_users: string[]): IEncodingResult {
    return AllowlistVotingEncoding.removeAllowedUsers(this.pluginAddr, _users);
  }

  /**
   * Encode parameters for the setConfiguration function
   *
   * @static
   * @param {string} pluginAddr
   * @param {ISetConfigurationParams} params
   * @return {*}  {IEncodingResult}
   * @memberof AllowlistVotingEncoding
   */
  public static setConfiguration(
    pluginAddr: string,
    params: ISetConfigurationParams
  ): IEncodingResult {
    return AllowlistVotingEncoding.getEncoding(
      pluginAddr,
      "setConfiguration",
      params._participationRequiredPct,
      params._supportRequiredPct,
      params._minDuration
    );
  }

  /**
   * Encode parameters for the setConfiguration function
   *
   * @param {ISetConfigurationParams} params
   * @return {*}  {IEncodingResult}
   * @memberof AllowlistVotingEncoding
   */
  public setConfiguration(params: ISetConfigurationParams): IEncodingResult {
    return AllowlistVotingEncoding.setConfiguration(this.pluginAddr, params);
  }

  /**
   * Encode parameters for the vote function
   *
   * @static
   * @param {string} pluginAddr
   * @param {IVoteParams} params
   * @return {*}  {IEncodingResult}
   * @memberof AllowlistVotingEncoding
   */
  public static vote(pluginAddr: string, params: IVoteParams): IEncodingResult {
    return AllowlistVotingEncoding.getEncoding(
      pluginAddr,
      "vote",
      params._voteId,
      params._choice,
      params._executesIfDecided
    );
  }

  /**
   * Encode parameters for the vote function
   *
   * @param {IVoteParams} params
   * @return {*}  {IEncodingResult}
   * @memberof AllowlistVotingEncoding
   */
  public vote(params: IVoteParams): IEncodingResult {
    return AllowlistVotingEncoding.vote(this.pluginAddr, params);
  }
}
