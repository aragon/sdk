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
  public id: BigNumberish;
  public open: boolean;
  public executed: boolean;
  public startDate: BigNumberish;
  public endDate: BigNumberish;
  public snapshotBlock: BigNumberish;
  public supportRequired: BigNumberish;
  public participationRequired: BigNumberish;
  public votingPower: BigNumberish;
  public yes: BigNumberish;
  public no: BigNumberish;
  public abstain: BigNumberish;
  public actions: VoteAction[];

  constructor(
    id: BigNumberish,
    open: boolean,
    executed: boolean,
    startDate: BigNumberish,
    endDate: BigNumberish,
    snapshotBlock: BigNumberish,
    supportRequired: BigNumberish,
    participationRequired: BigNumberish,
    votingPower: BigNumberish,
    yes: BigNumberish,
    no: BigNumberish,
    abstain: BigNumberish,
    actions: VoteAction[]
  ) {
    this.id = id;
    this.open = open;
    this.executed = executed;
    this.startDate = startDate;
    this.endDate = endDate;
    this.snapshotBlock = snapshotBlock;
    this.supportRequired = supportRequired;
    this.participationRequired = participationRequired;
    this.votingPower = votingPower;
    this.yes = yes;
    this.no = no;
    this.abstain = abstain;
    this.actions = actions;
  }
}

export enum Steps {
  PENDING = "pending",
  DONE = "done",
}

export type VoteStepsValue = VoteStepsValueCreating | VoteStepsValueDone;

export type VoteStepsValueCreating = {
  key: Steps.PENDING;
  txHash: string;
};

export type VoteStepsValueDone = {
  key: Steps.DONE;
};

export type VoteCreationValueDone = VoteStepsValueDone & {
  voteId: number;
};

export type VoteCreationValue = VoteStepsValueCreating | VoteCreationValueDone;

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
