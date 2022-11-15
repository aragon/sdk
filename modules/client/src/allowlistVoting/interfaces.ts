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
  id: BigInt;
  open: boolean;
  executed: boolean;
  startDate: BigInt;
  endDate: BigInt;
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

export type ProposalCreationValue = VoteStepsValuePending | ProposalCreationValueDone;

export interface ICreateProposalParams {
  _proposalMetadata: Uint8Array;
  _actions: ProposalAction[];
  _startDate: BigInt;
  _endDate: BigInt;
  _executeIfDecided: boolean;
  _choice: BigInt;
}

export interface ISetConfigurationParams {
  _participationRequiredPct: BigInt;
  _supportRequiredPct: BigInt;
  _minDuration: BigInt;
}

export interface IVoteParams {
  _proposalId: BigInt;
  _choice: BigInt;
  _executesIfDecided: boolean;
}
