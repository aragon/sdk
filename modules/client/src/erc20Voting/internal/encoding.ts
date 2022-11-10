import { BigNumberish, BytesLike, ethers } from "ethers";
import { ERC20Voting } from "../client";
import { VoteAction } from "../interfaces";

export class ERC20VotingEncoding {
  private erc20Voting: ERC20Voting;

  constructor(erc20Voting: ERC20Voting) {
    this.erc20Voting = erc20Voting;
  }

  private getUnsignedTransaction(
    functionName: string,
    ...args: any[]
  ): ethers.UnsignedTransaction {
    const pluginInstance = this.erc20Voting.pluginInstance;
    const data = pluginInstance.interface.encodeFunctionData(
      // @ts-ignore functionName is hardcoded by us
      functionName,
      args
    );
    return {
      to: pluginInstance.address,
      value: 0,
      data,
    };
  }

  public createVote(
    _proposalMetadata: BytesLike,
    _actions: VoteAction[],
    _startDate: BigNumberish,
    _endDate: BigNumberish,
    _executeIfDecided: boolean,
    _choice: BigNumberish
  ): ethers.UnsignedTransaction {
    return this.getUnsignedTransaction(
      "createVote",
      _proposalMetadata,
      _actions,
      _startDate,
      _endDate,
      _executeIfDecided,
      _choice
    );
  }

  public execute(_voteId: BigNumberish): ethers.UnsignedTransaction {
    return this.getUnsignedTransaction("execute", _voteId);
  }

  public setConfiguration(
    _participationRequiredPct: BigNumberish,
    _supportRequiredPct: BigNumberish,
    _minDuration: BigNumberish
  ): ethers.UnsignedTransaction {
    return this.getUnsignedTransaction(
      "setConfiguration",
      _participationRequiredPct,
      _supportRequiredPct,
      _minDuration
    );
  }

  public vote(
    _voteId: BigNumberish,
    _choice: BigNumberish,
    _executesIfDecided: boolean
  ): ethers.UnsignedTransaction {
    return this.getUnsignedTransaction(
      "vote",
      _voteId,
      _choice,
      _executesIfDecided
    );
  }
}
