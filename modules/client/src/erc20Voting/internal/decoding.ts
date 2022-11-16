import { BytesLike, isBytesLike, arrayify } from "@ethersproject/bytes";
import {
  ICreateProposalParams,
  ISetConfigurationParamsDecoded,
  IVoteParamsDecoded,
  ProposalAction,
} from "../interfaces";
import { ERC20Voting__factory } from "@aragon/core-contracts-ethers";
import { BigNumberish } from "@ethersproject/bignumber";
import { DecodingTXType } from "../../client-common";

export class ERC20VotingDecoding {
  /**
   * Private helper to decode data or a TX for a function
   *
   * @private
   * @static
   * @template T
   * @param {string} functionFragment
   * @param {(DecodingTXType | BytesLike)} txOrData
   * @return {*}  {T}
   * @memberof ERC20VotingDecoding
   */
  private static getDecodedData<T extends { [key: string]: any }>(
    functionFragment: string,
    txOrData: DecodingTXType | BytesLike
  ): T {
    let data: BytesLike | undefined = txOrData as BytesLike;
    if (!isBytesLike(txOrData)) {
      data = txOrData.data;
    }
    if (!data) {
      return {} as T;
    }

    // @ts-ignore we know that we get an readonly Array and an object which is fine
    return ERC20Voting__factory.createInterface().decodeFunctionData(
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
   * @memberof ERC20VotingDecoding
   */
  private static parseActions(
    data: Array<Array<string | BigNumberish>>
  ): ProposalAction[] {
    const actions: ProposalAction[] = [];
    for (const i of data) {
      if (i.length === 3) {
        actions.push({
          to: i[0] as string,
          value: BigInt(i[1].toString()),
          data: arrayify(i[2] as string),
        });
      }
    }
    return actions;
  }

  /**
   * Decoding encoded data or a TX for the createProposal function
   *
   * @static
   * @param {(DecodingTXType | BytesLike)} txOrData
   * @return {*}  {ICreateProposalParams}
   * @memberof ERC20VotingDecoding
   */
  public static createProposal(
    txOrData: DecodingTXType | BytesLike
  ): ICreateProposalParams {
    const decoded = ERC20VotingDecoding.getDecodedData("createVote", txOrData);

    return {
      ...decoded,
      _choice: parseInt(decoded._choice.toString()),
      _endDate: parseInt(decoded._endDate.toString()),
      _startDate: parseInt(decoded._startDate.toString()),
      _actions: ERC20VotingDecoding.parseActions(decoded._actions),
    } as ICreateProposalParams;
  }

  /**
   * Decoding encoded data or a TX for the execute function
   *
   * @static
   * @param {(DecodingTXType | BytesLike)} txOrData
   * @return {*}  {{ _proposalId: number }}
   * @memberof ERC20VotingDecoding
   */
  public static execute(
    txOrData: DecodingTXType | BytesLike
  ): { _proposalId: number } {
    const data = ERC20VotingDecoding.getDecodedData("execute", txOrData);
    return {
      _proposalId: parseInt(data._voteId.toString()),
    };
  }

  /**
   * Decoding encoded data or a TX for the setConfiguration function
   *
   * @static
   * @param {(DecodingTXType | BytesLike)} txOrData
   * @return {*}  {ISetConfigurationParamsDecoded}
   * @memberof ERC20VotingDecoding
   */
  public static setConfiguration(
    txOrData: DecodingTXType | BytesLike
  ): ISetConfigurationParamsDecoded {
    const data = ERC20VotingDecoding.getDecodedData(
      "setConfiguration",
      txOrData
    );
    return {
      _minDuration: parseInt(data._minDuration.toString()),
      _participationRequiredPct: parseInt(
        data._participationRequiredPct.toString()
      ),
      _supportRequiredPct: parseInt(data._supportRequiredPct.toString()),
    };
  }

  /**
   * Decoding encoded data or a TX for the vote function
   *
   * @static
   * @param {(DecodingTXType | BytesLike)} txOrData
   * @return {*}  {IVoteParamsDecoded}
   * @memberof ERC20VotingDecoding
   */
  public static vote(txOrData: DecodingTXType | BytesLike): IVoteParamsDecoded {
    const data = ERC20VotingDecoding.getDecodedData("vote", txOrData);
    return {
      _choice: parseInt(data._choice.toString()),
      _executesIfDecided: data._executesIfDecided,
      _proposalId: parseInt(data._voteId.toString()),
    };
  }
}
