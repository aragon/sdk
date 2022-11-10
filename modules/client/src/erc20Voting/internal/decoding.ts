import { ethers, BytesLike } from "ethers";
import { isBytesLike } from "ethers/lib/utils";
import { ERC20Voting } from "../client";
import {
  ICreateVoteParams,
  IExecuteParams,
  ISetConfigurationParams,
  IVoteParams,
} from "../interfaces";

export class ERC20VotingDecoding {
  private erc20Voting: ERC20Voting;

  constructor(erc20Voting: ERC20Voting) {
    this.erc20Voting = erc20Voting;
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
    return this.erc20Voting.pluginInstance.interface.decodeFunctionData(
      functionFragment,
      data
    );
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

  public setConfiguration(
    txOrData: ethers.UnsignedTransaction | BytesLike
  ): ISetConfigurationParams {
    return this.getDecodedData("setConfiguration", txOrData);
  }

  public vote(txOrData: ethers.UnsignedTransaction | BytesLike): IVoteParams {
    return this.getDecodedData("vote", txOrData);
  }
}
