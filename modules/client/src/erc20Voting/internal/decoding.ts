import { BytesLike, isBytesLike } from "@ethersproject/bytes";
import {
  ICreateProposalParams,
  ISetConfigurationParams,
  IVoteParams,
} from "../interfaces";
import { ERC20Voting__factory } from "@aragon/core-contracts-ethers";
import { BigNumberish } from "@ethersproject/bignumber";
import { IEncodingResult } from "../../client-common";

export class ERC20VotingDecoding {
  private static getDecodedData<T extends { [key: string]: any }>(
    functionFragment: string,
    txOrData: IEncodingResult | BytesLike
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
    txOrData: IEncodingResult | BytesLike
  ): ICreateProposalParams {
    return ERC20VotingDecoding.getDecodedData("addAllowedUsers", txOrData);
  }

  public static execute(
    txOrData: IEncodingResult | BytesLike
  ): { voteId: BigNumberish } {
    return ERC20VotingDecoding.getDecodedData("execute", txOrData);
  }

  public static setConfiguration(
    txOrData: IEncodingResult | BytesLike
  ): ISetConfigurationParams {
    return ERC20VotingDecoding.getDecodedData("setConfiguration", txOrData);
  }

  public static vote(txOrData: IEncodingResult | BytesLike): IVoteParams {
    return ERC20VotingDecoding.getDecodedData("vote", txOrData);
  }
}
