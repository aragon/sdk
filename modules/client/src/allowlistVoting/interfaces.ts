import { BigNumberish } from "@ethersproject/bignumber";

interface IAllowlistVoting {
  pluginAddress: string;
}

export interface IAllowlistVotingContextParams extends IAllowlistVoting {}

export interface IAllowlistVotingContextPluginState extends IAllowlistVoting {}

export interface ProposalAction {
  to: string;
  value: BigNumberish;
  data: Uint8Array;
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
  _proposalMetadata: Uint8Array;
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
