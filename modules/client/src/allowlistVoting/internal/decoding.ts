import { ethers, BytesLike } from "ethers";
import { isBytesLike } from "ethers/lib/utils";
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
    txOrData: ethers.UnsignedTransaction | BytesLike
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
    txOrData: ethers.UnsignedTransaction | BytesLike
  ): IAddAllowedUsersParams {
    return this.getDecodedData("addAllowedUsers", txOrData);
  }

  public createVote(
    txOrData: ethers.UnsignedTransaction | BytesLike
  ): ICreateVoteParams {
    return this.getDecodedData("addAllowedUsers", txOrData);
  }

  public execute(
    txOrData: ethers.UnsignedTransaction | BytesLike
  ): IExecuteParams {
    return this.getDecodedData("execute", txOrData);
  }

  public removeAllowedUsers(
    txOrData: ethers.UnsignedTransaction | BytesLike
  ): IRemoveAllowedUsersParams {
    return this.getDecodedData("removeAllowedUsers", txOrData);
  }

  public setConfiguration(
    txOrData: ethers.UnsignedTransaction | BytesLike
  ): ISetConfigurationParams {
    return this.getDecodedData("setConfiguration", txOrData);
  }

  public vote(txOrData: ethers.UnsignedTransaction | BytesLike): IVoteParams {
    return this.getDecodedData("vote", txOrData);
  }
}
