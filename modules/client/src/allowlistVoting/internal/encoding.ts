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

  public addAllowedUsers(_users: string[]): IEncodingResult {
    return AllowlistVotingEncoding.addAllowedUsers(this.pluginAddr, _users);
  }

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

  public createProposal(params: ICreateProposalParams): IEncodingResult {
    return AllowlistVotingEncoding.createProposal(this.pluginAddr, params);
  }

  public static execute(
    pluginAddr: string,
    _voteId: BigNumberish
  ): IEncodingResult {
    return AllowlistVotingEncoding.getEncoding(
      pluginAddr,
      "execute",
      _voteId
    );
  }

  public execute(_voteId: BigNumberish): IEncodingResult {
    return AllowlistVotingEncoding.execute(this.pluginAddr, _voteId);
  }

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

  public removeAllowedUsers(_users: string[]): IEncodingResult {
    return AllowlistVotingEncoding.removeAllowedUsers(this.pluginAddr, _users);
  }

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

  public setConfiguration(params: ISetConfigurationParams): IEncodingResult {
    return AllowlistVotingEncoding.setConfiguration(this.pluginAddr, params);
  }

  public static vote(pluginAddr: string, params: IVoteParams): IEncodingResult {
    return AllowlistVotingEncoding.getEncoding(
      pluginAddr,
      "vote",
      params._voteId,
      params._choice,
      params._executesIfDecided
    );
  }

  public vote(params: IVoteParams): IEncodingResult {
    return AllowlistVotingEncoding.vote(this.pluginAddr, params);
  }
}
