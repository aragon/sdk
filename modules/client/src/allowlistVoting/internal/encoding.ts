import { AllowlistVoting__factory } from "@aragon/core-contracts-ethers";
import { BigNumberish } from "@ethersproject/bignumber";
import { BytesLike } from "@ethersproject/bytes";
import { UnsignedTransaction } from "@ethersproject/transactions";
import { VoteAction } from "../interfaces";

export class AllowlistVotingEncoding {
  private pluginAddr: string;
  constructor(pluginAddr: string) {
    this.pluginAddr = pluginAddr;
  }

  private static getUnsignedTransaction(
    pluginAddr: string,
    functionName: string,
    ...args: any[]
  ): UnsignedTransaction {
    const data = AllowlistVoting__factory.createInterface().encodeFunctionData(
      // @ts-ignore functionName is hardcoded by us
      functionName,
      args
    );
    return {
      to: pluginAddr,
      value: 0,
      data,
    };
  }

  public static addAllowedUsers(
    pluginAddr: string,
    _users: string[]
  ): UnsignedTransaction {
    return AllowlistVotingEncoding.getUnsignedTransaction(
      pluginAddr,
      "addAllowedUsers",
      _users
    );
  }

  public addAllowedUsers(_users: string[]): UnsignedTransaction {
    return AllowlistVotingEncoding.addAllowedUsers(this.pluginAddr, _users);
  }

  public static createProposal(
    pluginAddr: string,
    _proposalMetadata: BytesLike,
    _actions: VoteAction[],
    _startDate: BigNumberish,
    _endDate: BigNumberish,
    _executeIfDecided: boolean,
    _choice: BigNumberish
  ): UnsignedTransaction {
    return this.getUnsignedTransaction(
      pluginAddr,
      "createVote",
      _proposalMetadata,
      _actions,
      _startDate,
      _endDate,
      _executeIfDecided,
      _choice
    );
  }

  public createProposal(
    _proposalMetadata: BytesLike,
    _actions: VoteAction[],
    _startDate: BigNumberish,
    _endDate: BigNumberish,
    _executeIfDecided: boolean,
    _choice: BigNumberish
  ): UnsignedTransaction {
    return AllowlistVotingEncoding.createProposal(
      this.pluginAddr,
      _proposalMetadata,
      _actions,
      _startDate,
      _endDate,
      _executeIfDecided,
      _choice
    );
  }

  public static execute(
    pluginAddr: string,
    _voteId: BigNumberish
  ): UnsignedTransaction {
    return AllowlistVotingEncoding.getUnsignedTransaction(
      pluginAddr,
      "execute",
      _voteId
    );
  }

  public execute(_voteId: BigNumberish): UnsignedTransaction {
    return AllowlistVotingEncoding.execute(this.pluginAddr, _voteId);
  }

  public static removeAllowedUsers(
    pluginAddr: string,
    _users: string[]
  ): UnsignedTransaction {
    return AllowlistVotingEncoding.getUnsignedTransaction(
      pluginAddr,
      "removeAllowedUsers",
      _users
    );
  }

  public removeAllowedUsers(_users: string[]): UnsignedTransaction {
    return AllowlistVotingEncoding.removeAllowedUsers(this.pluginAddr, _users);
  }

  public static setConfiguration(
    pluginAddr: string,
    _participationRequiredPct: BigNumberish,
    _supportRequiredPct: BigNumberish,
    _minDuration: BigNumberish
  ): UnsignedTransaction {
    return AllowlistVotingEncoding.getUnsignedTransaction(
      pluginAddr,
      "setConfiguration",
      _participationRequiredPct,
      _supportRequiredPct,
      _minDuration
    );
  }

  public setConfiguration(
    _participationRequiredPct: BigNumberish,
    _supportRequiredPct: BigNumberish,
    _minDuration: BigNumberish
  ): UnsignedTransaction {
    return AllowlistVotingEncoding.setConfiguration(
      this.pluginAddr,
      _participationRequiredPct,
      _supportRequiredPct,
      _minDuration
    );
  }

  public static vote(
    pluginAddr: string,
    _voteId: BigNumberish,
    _choice: BigNumberish,
    _executesIfDecided: boolean
  ): UnsignedTransaction {
    return AllowlistVotingEncoding.getUnsignedTransaction(
      pluginAddr,
      "vote",
      _voteId,
      _choice,
      _executesIfDecided
    );
  }

  public vote(
    _voteId: BigNumberish,
    _choice: BigNumberish,
    _executesIfDecided: boolean
  ): UnsignedTransaction {
    return AllowlistVotingEncoding.vote(
      this.pluginAddr,
      _voteId,
      _choice,
      _executesIfDecided
    );
  }
}
