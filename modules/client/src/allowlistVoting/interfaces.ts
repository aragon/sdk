interface IAllowlistVoting {
  pluginAddress: string;
}

export interface IAllowlistVotingContextParams extends IAllowlistVoting {}

export interface IAllowlistVotingContextPluginState extends IAllowlistVoting {}

export interface ProposalAction {
  to: string;
  value: BigInt;
  data: Uint8Array;
}

export interface Proposal {
  id: number;
  open: boolean;
  executed: boolean;
  startDate: number;
  endDate: number;
  snapshotBlock: BigInt;
  supportRequired: BigInt;
  participationRequired: BigInt;
  votingPower: BigInt;
  yes: BigInt;
  no: BigInt;
  abstain: BigInt;
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

export type ProposalCreationValue =
  | VoteStepsValuePending
  | ProposalCreationValueDone;

export interface ICreateProposalParams {
  _proposalMetadata: Uint8Array;
  _actions: ProposalAction[];
  _startDate: number;
  _endDate: number;
  _executeIfDecided: boolean;
  _choice: number;
}

export interface ISetConfigurationParams {
  _participationRequiredPct: number;
  _supportRequiredPct: number;
  _minDuration: number;
}

export interface IVoteParams {
  _proposalId: number;
  _choice: number;
  _executesIfDecided: boolean;
}
