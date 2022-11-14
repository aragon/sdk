import { BigNumberish } from "@ethersproject/bignumber";
import { BytesLike } from "@ethersproject/bytes";

interface IERC20Voting {
  pluginAddress: string;
}

export interface IERC20VotingContextParams extends IERC20Voting {}

export interface IERC20VotingContextPluginState extends IERC20Voting {}

export interface ProposalAction {
  to: string;
  value: BigNumberish;
  data: BytesLike;
}

export interface Proposal {
  id: BigNumberish;
  open: boolean;
  executed: boolean;
  startDate: BigNumberish;
  endDate: BigNumberish;
  snapshotBlock: BigNumberish;
  supportRequired: BigNumberish;
  participationRequired: BigNumberish;
  votingPower: BigNumberish;
  yes: BigNumberish;
  no: BigNumberish;
  abstain: BigNumberish;
  actions: ProposalAction[];
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

export interface ICreateProposalParams {
  _proposalMetadata: BytesLike;
  _actions: ProposalAction[];
  _startDate: BigNumberish;
  _endDate: BigNumberish;
  _executeIfDecided: boolean;
  _choice: BigNumberish;
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
