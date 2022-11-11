import { BytesLike, isBytesLike } from "@ethersproject/bytes";
import { UnsignedTransaction } from "@ethersproject/transactions";
import { AllowlistVoting } from "../client";
import {
  IAddAllowedUsersParams,
  ICreateVoteParams,
  IExecuteParams,
  IRemoveAllowedUsersParams,
  ISetConfigurationParams,
  IVoteParams,
} from "../interfaces";

export class AllowlistVotingDecoding {
  private allowlistVoting: AllowlistVoting;

  constructor(allowlistVoting: AllowlistVoting) {
    this.allowlistVoting = allowlistVoting;
  }

  private getDecodedData<T extends { [key: string]: any }>(
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
    return this.allowlistVoting.pluginInstance.interface.decodeFunctionData(
      functionFragment,
      data
    );
  }

  public addAllowedUsers(
    txOrData: UnsignedTransaction | BytesLike
  ): IAddAllowedUsersParams {
    return this.getDecodedData("addAllowedUsers", txOrData);
  }

  public createVote(
    txOrData: UnsignedTransaction | BytesLike
  ): ICreateVoteParams {
    return this.getDecodedData("addAllowedUsers", txOrData);
  }

  public execute(txOrData: UnsignedTransaction | BytesLike): IExecuteParams {
    return this.getDecodedData("execute", txOrData);
  }

  public removeAllowedUsers(
    txOrData: UnsignedTransaction | BytesLike
  ): IRemoveAllowedUsersParams {
    return this.getDecodedData("removeAllowedUsers", txOrData);
  }

  public setConfiguration(
    txOrData: UnsignedTransaction | BytesLike
  ): ISetConfigurationParams {
    return this.getDecodedData("setConfiguration", txOrData);
  }

  public vote(txOrData: UnsignedTransaction | BytesLike): IVoteParams {
    return this.getDecodedData("vote", txOrData);
  }
}
