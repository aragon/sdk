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

export type VoteStepsValue = VoteStepsValuePending | VoteStepsValueDone;

export type VoteStepsValuePending = {
  key: Steps.PENDING;
  txHash: string;
};

export type VoteStepsValueDone = {
  key: Steps.DONE;
};

export type ProposalCreationValueDone = VoteStepsValueDone & {
  proposalId: number;
};

export type ProposalCreationValue = VoteStepsValuePending | ProposalCreationValueDone;

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
  _proposalId: BigNumberish;
  _choice: BigNumberish;
  _executesIfDecided: boolean;
}
