import { BigNumberish } from "@ethersproject/bignumber";
import { BytesLike } from "@ethersproject/bytes";

interface IAllowlistVoting {
  pluginAddress: string;
}

export interface IAllowlistVotingContextParams extends IAllowlistVoting {}

export interface IAllowlistVotingContextPluginState extends IAllowlistVoting {}

export interface VoteAction {
  to: string;
  value: BigNumberish;
  data: BytesLike;
}

export class Vote {
  [index: string]: any;
  public open!: boolean;
  public executed!: boolean;
  public startDate!: BigNumberish;
  public endDate!: BigNumberish;
  public snapshotBlock!: BigNumberish;
  public supportRequired!: BigNumberish;
  public participationRequired!: BigNumberish;
  public votingPower!: BigNumberish;
  public yes!: BigNumberish;
  public no!: BigNumberish;
  public abstain!: BigNumberish;
  public actions!: VoteAction[];
}

export enum Steps {
  PENDING = "pending",
  DONE = "done",
}

export type VoteCreationValueCreating = {
  key: Steps.PENDING;
  txHash: string;
};

export type VoteCreationValueDone = {
  key: Steps.DONE;
  voteId: BigNumberish;
};

export type VoteCreationValue =
  | VoteCreationValueCreating
  | VoteCreationValueDone;

export interface IAddAllowedUsersParams {
  _users: string[];
}

export interface ICreateVoteParams {
  _proposalMetadata: BytesLike;
  _actions: VoteAction[];
  _startDate: BigNumberish;
  _endDate: BigNumberish;
  _executeIfDecided: boolean;
  _choice: BigNumberish;
}

export interface IExecuteParams {
  _voteId: BigNumberish;
}

export interface IRemoveAllowedUsersParams {
  _users: string[];
}

export interface ISetConfigurationParams {
  _participationRequiredPct: BigNumberish;
  _supportRequiredPct: BigNumberish;
  _minDuration: BigNumberish;
}

export interface IVoteParams {
  _voteId: BigNumberish;
  _choice: BigNumberish;
  _executesIfDecided: boolean;
}
