import { BytesLike, isBytesLike, arrayify } from "@ethersproject/bytes";
import {
  ICreateProposalParams,
  ISetConfigurationParams,
  IVoteParams,
  ProposalAction,
} from "../interfaces";
import { AllowlistVoting__factory } from "@aragon/core-contracts-ethers";
import { IDecodingTX } from "../../client-common";
import { BigNumberish } from "@ethersproject/bignumber";

export class AllowlistVotingDecoding {
  /**
   * Private helper to decode data or a TX for a function
   *
   * @private
   * @static
   * @template T
   * @param {string} functionFragment
   * @param {(IDecodingTX | BytesLike)} txOrData
   * @return {*}  {T}
   * @memberof AllowlistVotingDecoding
   */
  private static getDecodedData<T extends { [key: string]: any }>(
    functionFragment: string,
    txOrData: IDecodingTX | BytesLike
  ): T {
    let data: BytesLike | undefined = txOrData as BytesLike;
    if (!isBytesLike(txOrData)) {
      data = txOrData.data;
    }
    if (!data) {
      return {} as T;
    }

    // @ts-ignore we know that we get an readonly Array and an object which is fine
    return AllowlistVoting__factory.createInterface().decodeFunctionData(
      functionFragment,
      data
    );
  }

  /**
   * Helper to parse actions from decoding proposal data
   *
   * @private
   * @static
   * @param {(Array<Array<string | BigNumberish>>)} data
   * @return {*}  {ProposalAction[]}
   * @memberof AllowlistVotingDecoding
   */
  private static parseActions(
    data: Array<Array<string | BigNumberish>>
  ): ProposalAction[] {
    const actions: ProposalAction[] = [];
    for (const i of data) {
      if (i.length === 3) {
        actions.push({
          to: i[0] as string,
          value: i[1],
          data: arrayify(i[2] as string),
        });
      }
    }
    return actions;
  }

  /**
   * Decoding encoded data or a TX for the addAllowedUsers function
   *
   * @static
   * @param {(IDecodingTX | BytesLike)} txOrData
   * @return {*}  {{ _users: string[] }}
   * @memberof AllowlistVotingDecoding
   */
  public static addAllowedUsers(
    txOrData: IDecodingTX | BytesLike
  ): { _users: string[] } {
    return AllowlistVotingDecoding.getDecodedData("addAllowedUsers", txOrData);
  }

  /**
   * Decoding encoded data or a TX for the createProposal function
   *
   * @static
   * @param {(IDecodingTX | BytesLike)} txOrData
   * @return {*}  {ICreateProposalParams}
   * @memberof AllowlistVotingDecoding
   */
  public static createProposal(
    txOrData: IDecodingTX | BytesLike
  ): ICreateProposalParams {
    const decoded = AllowlistVotingDecoding.getDecodedData(
      "createVote",
      txOrData
    );

    return {
      ...decoded,
      _actions: AllowlistVotingDecoding.parseActions(decoded._actions),
    } as ICreateProposalParams;
  }

  /**
   * Decoding encoded data or a TX for the execute function
   *
   * @static
   * @param {(IDecodingTX | BytesLike)} txOrData
   * @return {*}  {{ _proposalId: string }}
   * @memberof AllowlistVotingDecoding
   */
  public static execute(
    txOrData: IDecodingTX | BytesLike
  ): { _proposalId: string } {
    const data = AllowlistVotingDecoding.getDecodedData("execute", txOrData);
    return {
      _proposalId: data._voteId,
    };
  }

  /**
   * Decoding encoded data or a TX for the removeAllowedUsers function
   *
   * @static
   * @param {(IDecodingTX | BytesLike)} txOrData
   * @return {*}  {{ _users: string[] }}
   * @memberof AllowlistVotingDecoding
   */
  public static removeAllowedUsers(
    txOrData: IDecodingTX | BytesLike
  ): { _users: string[] } {
    return AllowlistVotingDecoding.getDecodedData(
      "removeAllowedUsers",
      txOrData
    );
  }

  /**
   * Decoding encoded data or a TX for the setConfiguration function
   *
   * @static
   * @param {(IDecodingTX | BytesLike)} txOrData
   * @return {*}  {ISetConfigurationParams}
   * @memberof AllowlistVotingDecoding
   */
  public static setConfiguration(
    txOrData: IDecodingTX | BytesLike
  ): ISetConfigurationParams {
    return AllowlistVotingDecoding.getDecodedData("setConfiguration", txOrData);
  }

  /**
   * Decoding encoded data or a TX for the vote function
   *
   * @static
   * @param {(IDecodingTX | BytesLike)} txOrData
   * @return {*}  {IVoteParams}
   * @memberof AllowlistVotingDecoding
   */
  public static vote(txOrData: IDecodingTX | BytesLike): IVoteParams {
    const data = AllowlistVotingDecoding.getDecodedData("vote", txOrData);
    return {
      _choice: data._choice,
      _executesIfDecided: data._executesIfDecided,
      _proposalId: data._voteId,
    };
  }
}
