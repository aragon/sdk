import { AllowlistVoting__factory } from "@aragon/core-contracts-ethers";
import { BigNumberish } from "@ethersproject/bignumber";
import {
  ICreateProposalParams,
  ISetConfigurationParams,
  IVoteParams,
} from "../interfaces";
import { EncodingResultType } from "../../client-common";
import { arrayify } from "@ethersproject/bytes";

export class AddresslistEncoding {
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
   * @memberof AddresslistEncoding
   */
  private static getEncoding(
    pluginAddr: string,
    functionName: string,
    ...args: any[]
  ): EncodingResultType {
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
   * @memberof AddresslistEncoding
   */
  public static addAllowedUsers(
    pluginAddr: string,
    _users: string[]
  ): EncodingResultType {
    return AddresslistEncoding.getEncoding(
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
   * @memberof AddresslistEncoding
   */
  public addAllowedUsers(_users: string[]): EncodingResultType {
    return AddresslistEncoding.addAllowedUsers(this.pluginAddr, _users);
  }

  /**
   * Encode parameters for the createProposal function
   *
   * @static
   * @param {string} pluginAddr
   * @param {ICreateProposalParams} params
   * @return {*}  {IEncodingResult}
   * @memberof AddresslistEncoding
   */
  public static createProposal(
    pluginAddr: string,
    params: ICreateProposalParams
  ): EncodingResultType {
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
   * @memberof AddresslistEncoding
   */
  public createProposal(params: ICreateProposalParams): EncodingResultType {
    return AddresslistEncoding.createProposal(this.pluginAddr, params);
  }

  /**
   * Encode parameters for the addAllowedUsers function
   *
   * @static
   * @param {string} pluginAddr
   * @param {BigNumberish} _proposalId
   * @return {*}  {IEncodingResult}
   * @memberof AddresslistEncoding
   */
  public static execute(
    pluginAddr: string,
    _proposalId: BigNumberish
  ): EncodingResultType {
    return AddresslistEncoding.getEncoding(pluginAddr, "execute", _proposalId);
  }

  /**
   * Encode parameters for the execute function
   *
   * @param {BigNumberish} _proposalId
   * @return {*}  {IEncodingResult}
   * @memberof AddresslistEncoding
   */
  public execute(_proposalId: BigNumberish): EncodingResultType {
    return AddresslistEncoding.execute(this.pluginAddr, _proposalId);
  }

  /**
   * Encode parameters for the removeAllowedUsers function
   *
   * @static
   * @param {string} pluginAddr
   * @param {string[]} _users
   * @return {*}  {IEncodingResult}
   * @memberof AddresslistEncoding
   */
  public static removeAllowedUsers(
    pluginAddr: string,
    _users: string[]
  ): EncodingResultType {
    return AddresslistEncoding.getEncoding(
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
   * @memberof AddresslistEncoding
   */
  public removeAllowedUsers(_users: string[]): EncodingResultType {
    return AddresslistEncoding.removeAllowedUsers(this.pluginAddr, _users);
  }

  /**
   * Encode parameters for the setConfiguration function
   *
   * @static
   * @param {string} pluginAddr
   * @param {ISetConfigurationParams} params
   * @return {*}  {IEncodingResult}
   * @memberof AddresslistEncoding
   */
  public static setConfiguration(
    pluginAddr: string,
    params: ISetConfigurationParams
  ): EncodingResultType {
    return AddresslistEncoding.getEncoding(
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
   * @memberof AddresslistEncoding
   */
  public setConfiguration(params: ISetConfigurationParams): EncodingResultType {
    return AddresslistEncoding.setConfiguration(this.pluginAddr, params);
  }

  /**
   * Encode parameters for the vote function
   *
   * @static
   * @param {string} pluginAddr
   * @param {IVoteParams} params
   * @return {*}  {IEncodingResult}
   * @memberof AddresslistEncoding
   */
  public static vote(
    pluginAddr: string,
    params: IVoteParams
  ): EncodingResultType {
    return AddresslistEncoding.getEncoding(
      pluginAddr,
      "vote",
      params._proposalId,
      params._choice,
      params._executesIfDecided
    );
  }

  /**
   * Encode parameters for the vote function
   *
   * @param {IVoteParams} params
   * @return {*}  {IEncodingResult}
   * @memberof AddresslistEncoding
   */
  public vote(params: IVoteParams): EncodingResultType {
    return AddresslistEncoding.vote(this.pluginAddr, params);
  }
}
