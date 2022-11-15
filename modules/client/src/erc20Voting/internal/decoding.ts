import { BytesLike, isBytesLike, arrayify } from "@ethersproject/bytes";
import {
  ICreateProposalParams,
  ISetConfigurationParams,
  IVoteParams,
  ProposalAction,
} from "../interfaces";
import { ERC20Voting__factory } from "@aragon/core-contracts-ethers";
import { BigNumberish } from "@ethersproject/bignumber";
import { IDecodingTX } from "../../client-common";

export class ERC20VotingDecoding {
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
    return ERC20Voting__factory.createInterface().decodeFunctionData(
      functionFragment,
      data
    );
  }

  public static createProposal(
    txOrData: IDecodingTX | BytesLike
  ): ICreateProposalParams {
    const decoded = ERC20VotingDecoding.getDecodedData("createVote", txOrData);

    return {
      ...decoded,
      _actions: ERC20VotingDecoding.parseActions(decoded._actions),
    } as ICreateProposalParams;
  }

  public static execute(
    txOrData: IDecodingTX | BytesLike
  ): { _voteId: BigNumberish } {
    return ERC20VotingDecoding.getDecodedData("execute", txOrData);
  }

  public static setConfiguration(
    txOrData: IDecodingTX | BytesLike
  ): ISetConfigurationParams {
    return ERC20VotingDecoding.getDecodedData("setConfiguration", txOrData);
  }

  public static vote(txOrData: IDecodingTX | BytesLike): IVoteParams {
    return ERC20VotingDecoding.getDecodedData("vote", txOrData);
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
