import { BytesLike, isBytesLike } from "@ethersproject/bytes";
import {
  ICreateProposalParams,
  ISetConfigurationParams,
  IVoteParams,
} from "../interfaces";
import { AllowlistVoting__factory } from "@aragon/core-contracts-ethers";
import { IEncodingResult } from "../../client-common";

export class AllowlistVotingDecoding {
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
    return AllowlistVoting__factory.createInterface().decodeFunctionData(
      functionFragment,
      data
    );
  }

  public static addAllowedUsers(
    txOrData: IEncodingResult | BytesLike
  ): { users: string[] } {
    return AllowlistVotingDecoding.getDecodedData("addAllowedUsers", txOrData);
  }

  public static createProposal(
    txOrData: IEncodingResult | BytesLike
  ): ICreateProposalParams {
    return AllowlistVotingDecoding.getDecodedData("addAllowedUsers", txOrData);
  }

  public static execute(
    txOrData: IEncodingResult | BytesLike
  ): { vote: string } {
    return AllowlistVotingDecoding.getDecodedData("execute", txOrData);
  }

  public static removeAllowedUsers(
    txOrData: IEncodingResult | BytesLike
  ): { users: string[] } {
    return AllowlistVotingDecoding.getDecodedData(
      "removeAllowedUsers",
      txOrData
    );
  }

  public static setConfiguration(
    txOrData: IEncodingResult | BytesLike
  ): ISetConfigurationParams {
    return AllowlistVotingDecoding.getDecodedData("setConfiguration", txOrData);
  }

  public static vote(txOrData: IEncodingResult | BytesLike): IVoteParams {
    return AllowlistVotingDecoding.getDecodedData("vote", txOrData);
  }
}
