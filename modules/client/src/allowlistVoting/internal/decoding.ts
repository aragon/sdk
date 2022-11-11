import { BytesLike, isBytesLike } from "@ethersproject/bytes";
import { UnsignedTransaction } from "@ethersproject/transactions";
import {
  IAddAllowedUsersParams,
  ICreateVoteParams,
  IExecuteParams,
  IRemoveAllowedUsersParams,
  ISetConfigurationParams,
  IVoteParams,
} from "../interfaces";
import { AllowlistVoting__factory } from "@aragon/core-contracts-ethers";

export class AllowlistVotingDecoding {
  private static getDecodedData<T extends { [key: string]: any }>(
    functionFragment: string,
    txOrData: UnsignedTransaction | BytesLike
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
    txOrData: UnsignedTransaction | BytesLike
  ): IAddAllowedUsersParams {
    return AllowlistVotingDecoding.getDecodedData("addAllowedUsers", txOrData);
  }

  public static createProposal(
    txOrData: UnsignedTransaction | BytesLike
  ): ICreateVoteParams {
    return AllowlistVotingDecoding.getDecodedData("addAllowedUsers", txOrData);
  }

  public static execute(
    txOrData: UnsignedTransaction | BytesLike
  ): IExecuteParams {
    return AllowlistVotingDecoding.getDecodedData("execute", txOrData);
  }

  public static removeAllowedUsers(
    txOrData: UnsignedTransaction | BytesLike
  ): IRemoveAllowedUsersParams {
    return AllowlistVotingDecoding.getDecodedData(
      "removeAllowedUsers",
      txOrData
    );
  }

  public static setConfiguration(
    txOrData: UnsignedTransaction | BytesLike
  ): ISetConfigurationParams {
    return AllowlistVotingDecoding.getDecodedData("setConfiguration", txOrData);
  }

  public static vote(
    txOrData: UnsignedTransaction | BytesLike
  ): IVoteParams {
    return AllowlistVotingDecoding.getDecodedData("vote", txOrData);
  }
}
