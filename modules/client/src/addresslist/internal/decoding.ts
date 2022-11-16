import { BytesLike, isBytesLike, arrayify } from "@ethersproject/bytes";
import {
  ICreateProposalParams,
  ISetConfigurationParamsDecoded,
  IVoteParamsDecoded,
  ProposalAction,
} from "../interfaces";
import { AllowlistVoting__factory } from "@aragon/core-contracts-ethers";
import { DecodingTXType } from "../../client-common";
import { BigNumberish } from "@ethersproject/bignumber";

export class AddresslistDecoding {
  /**
   * Private helper to decode data or a TX for a function
   *
   * @private
   * @static
   * @template T
   * @param {string} functionFragment
   * @param {(DecodingTXType | BytesLike)} txOrData
   * @return {*}  {T}
   * @memberof AddresslistDecoding
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
   * @memberof AddresslistDecoding
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
   * Decoding encoded data or a TX for the addAllowedUsers function
   *
   * @static
   * @param {(DecodingTXType | BytesLike)} txOrData
   * @return {*}  {{ _users: string[] }}
   * @memberof AddresslistDecoding
   */
  public static addAllowedUsers(
    txOrData: DecodingTXType | BytesLike
  ): { _users: string[] } {
    return AddresslistDecoding.getDecodedData("addAllowedUsers", txOrData);
  }

  /**
   * Decoding encoded data or a TX for the createProposal function
   *
   * @static
   * @param {(DecodingTXType | BytesLike)} txOrData
   * @return {*}  {ICreateProposalParams}
   * @memberof AddresslistDecoding
   */
  public static createProposal(
    txOrData: DecodingTXType | BytesLike
  ): ICreateProposalParams {
    const decoded = AddresslistDecoding.getDecodedData("createVote", txOrData);

    return {
      ...decoded,
      _choice: parseInt(decoded._choice.toString()),
      _endDate: parseInt(decoded._endDate.toString()),
      _startDate: parseInt(decoded._startDate.toString()),
      _actions: AddresslistDecoding.parseActions(decoded._actions),
    } as ICreateProposalParams;
  }

  /**
   * Decoding encoded data or a TX for the execute function
   *
   * @static
   * @param {(DecodingTXType | BytesLike)} txOrData
   * @return {*}  {{ _proposalId: string }}
   * @memberof AddresslistDecoding
   */
  public static execute(
    txOrData: DecodingTXType | BytesLike
  ): { _proposalId: number } {
    const data = AddresslistDecoding.getDecodedData("execute", txOrData);
    return {
      _proposalId: parseInt(data._voteId.toString()),
    };
  }

  /**
   * Decoding encoded data or a TX for the removeAllowedUsers function
   *
   * @static
   * @param {(DecodingTXType | BytesLike)} txOrData
   * @return {*}  {{ _users: string[] }}
   * @memberof AddresslistDecoding
   */
  public static removeAllowedUsers(
    txOrData: DecodingTXType | BytesLike
  ): { _users: string[] } {
    return AddresslistDecoding.getDecodedData("removeAllowedUsers", txOrData);
  }

  /**
   * Decoding encoded data or a TX for the setConfiguration function
   *
   * @static
   * @param {(DecodingTXType | BytesLike)} txOrData
   * @return {*}  {ISetConfigurationParamsDecoded}
   * @memberof AddresslistDecoding
   */
  public static setConfiguration(
    txOrData: DecodingTXType | BytesLike
  ): ISetConfigurationParamsDecoded {
    const data = AddresslistDecoding.getDecodedData(
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
   * @memberof AddresslistDecoding
   */
  public static vote(txOrData: DecodingTXType | BytesLike): IVoteParamsDecoded {
    const data = AddresslistDecoding.getDecodedData("vote", txOrData);
    return {
      _choice: parseInt(data._choice.toString()),
      _executesIfDecided: data._executesIfDecided,
      _proposalId: parseInt(data._voteId.toString()),
    };
  }
}
