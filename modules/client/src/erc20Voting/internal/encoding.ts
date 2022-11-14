import { ERC20Voting__factory } from "@aragon/core-contracts-ethers";
import { BigNumberish } from "@ethersproject/bignumber";
import {
  ICreateProposalParams,
  ISetConfigurationParams,
  IVoteParams,
} from "../interfaces";
import { IEncodingResult } from "../../client-common";
import { arrayify } from "@ethersproject/bytes";

export class ERC20VotingEncoding {
  private pluginAddr: string;
  constructor(pluginAddr: string) {
    this.pluginAddr = pluginAddr;
  }

  private static getEncoding(
    pluginAddr: string,
    functionName: string,
    ...args: any[]
  ): IEncodingResult {
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
    return ERC20VotingEncoding.createProposal(this.pluginAddr, params);
  }

  public static execute(
    pluginAddr: string,
    _voteId: BigNumberish
  ): IEncodingResult {
    return ERC20VotingEncoding.getEncoding(
      pluginAddr,
      "execute",
      _voteId
    );
  }

  public execute(_voteId: BigNumberish): IEncodingResult {
    return ERC20VotingEncoding.execute(this.pluginAddr, _voteId);
  }

  public static setConfiguration(
    pluginAddr: string,
    params: ISetConfigurationParams
  ): IEncodingResult {
    return ERC20VotingEncoding.getEncoding(
      pluginAddr,
      "setConfiguration",
      params._participationRequiredPct,
      params._supportRequiredPct,
      params._minDuration
    );
  }

  public setConfiguration(params: ISetConfigurationParams): IEncodingResult {
    return ERC20VotingEncoding.setConfiguration(this.pluginAddr, params);
  }

  public static vote(pluginAddr: string, params: IVoteParams): IEncodingResult {
    return ERC20VotingEncoding.getEncoding(
      pluginAddr,
      "vote",
      params._voteId,
      params._choice,
      params._executesIfDecided
    );
  }

  public vote(params: IVoteParams): IEncodingResult {
    return ERC20VotingEncoding.vote(this.pluginAddr, params);
  }
}
