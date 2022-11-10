import { BigNumber, BigNumberish, BytesLike } from "ethers";

interface IERC20Voting {
  pluginAddress: string;
}

export interface IERC20VotingContextParams extends IERC20Voting {}

export interface IERC20VotingContextPluginState extends IERC20Voting {}

export interface VoteAction {
  to: string;
  value: BigNumberish;
  data: BytesLike;
}

export class Vote {
  [index: string]: any;
  public open!: boolean;
  public executed!: boolean;
  public startDate!: BigNumber;
  public endDate!: BigNumber;
  public snapshotBlock!: BigNumber;
  public supportRequired!: BigNumber;
  public participationRequired!: BigNumber;
  public votingPower!: BigNumber;
  public yes!: BigNumber;
  public no!: BigNumber;
  public abstain!: BigNumber;
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
  voteId: BigNumber;
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
