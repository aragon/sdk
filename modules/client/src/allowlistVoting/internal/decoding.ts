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

  public static addAllowedUsers(
    txOrData: IDecodingTX | BytesLike
  ): { _users: string[] } {
    return AllowlistVotingDecoding.getDecodedData("addAllowedUsers", txOrData);
  }

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

  public static execute(txOrData: IDecodingTX | BytesLike): { _voteId: string } {
    return AllowlistVotingDecoding.getDecodedData("execute", txOrData);
  }

  public static removeAllowedUsers(
    txOrData: IDecodingTX | BytesLike
  ): { _users: string[] } {
    return AllowlistVotingDecoding.getDecodedData(
      "removeAllowedUsers",
      txOrData
    );
  }

  public static setConfiguration(
    txOrData: IDecodingTX | BytesLike
  ): ISetConfigurationParams {
    return AllowlistVotingDecoding.getDecodedData("setConfiguration", txOrData);
  }

  public static vote(txOrData: IDecodingTX | BytesLike): IVoteParams {
    return AllowlistVotingDecoding.getDecodedData("vote", txOrData);
  }

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
}
