// This file contains the definitions of the AddressList DAO client

import {
  CreateProposalBaseParams,
  DaoAction,
  ExecuteProposalStepValue,
  GasFeeEstimation,
  IClientCore,
  IInterfaceParams,
  IProposalQueryParams,
  ProposalCreationStepValue,
  ProposalMetadata,
  ProposalMetadataSummary,
  ProposalStatus,
  SubgraphAction,
} from "../client-common";

// Multisig
export interface IMultisigClientMethods extends IClientCore {
  createProposal: (
    params: CreateMultisigProposalParams,
  ) => AsyncGenerator<ProposalCreationStepValue>;
  pinMetadata: (params: ProposalMetadata) => Promise<string>;
  approveProposal: (
    params: ApproveMultisigProposalParams,
  ) => AsyncGenerator<ApproveProposalStepValue>;
  executeProposal: (
    proposalId: string,
  ) => AsyncGenerator<ExecuteProposalStepValue>;
  canApprove: (params: CanApproveParams) => Promise<boolean>;
  canExecute: (proposalId: string) => Promise<boolean>;
  getVotingSettings: (
    addressOrEns: string,
  ) => Promise<MultisigVotingSettings>;
  getMembers: (
    addressOrEns: string,
  ) => Promise<string[]>;
  getProposal: (proposalId: string) => Promise<MultisigProposal | null>;
  getProposals: (
    params: IProposalQueryParams,
  ) => Promise<MultisigProposalListItem[]>;
}

export interface IMultisigClientEncoding extends IClientCore {
  addAddressesAction: (params: AddAddressesParams) => DaoAction;
  removeAddressesAction: (params: RemoveAddressesParams) => DaoAction;
  updateMultisigVotingSettings: (
    params: UpdateMultisigVotingSettingsParams,
  ) => DaoAction;
}
export interface IMultisigClientDecoding extends IClientCore {
  addAddressesAction: (data: Uint8Array) => string[];
  removeAddressesAction: (data: Uint8Array) => string[];
  updateMultisigVotingSettings: (data: Uint8Array) => MultisigVotingSettings;
  findInterface: (data: Uint8Array) => IInterfaceParams | null;
}
export interface IMultisigClientEstimation extends IClientCore {
  createProposal: (
    params: CreateMultisigProposalParams,
  ) => Promise<GasFeeEstimation>;
  approveProposal: (
    params: ApproveMultisigProposalParams,
  ) => Promise<GasFeeEstimation>;
  executeProposal: (
    proposalId: string,
  ) => Promise<GasFeeEstimation>;
}

/** Defines the shape of the AddressList client class */
export interface IMultisigClient {
  methods: IMultisigClientMethods;
  encoding: IMultisigClientEncoding;
  decoding: IMultisigClientDecoding;
  estimation: IMultisigClientEstimation;
}

export type MultisigPluginInstallParams = MultisigPluginSettings;

export type MultisigVotingSettings = {
  minApprovals: number;
  onlyListed: boolean;
};

export type MultisigPluginSettings = {
  members: string[];
  votingSettings: MultisigVotingSettings;
};

export type UpdateAddressesParams = {
  pluginAddress: string;
  members: string[];
};
export type RemoveAddressesParams = UpdateAddressesParams;
export type AddAddressesParams = UpdateAddressesParams;

export type UpdateMultisigVotingSettingsParams = {
  pluginAddress: string;
  votingSettings: MultisigVotingSettings;
};

export type CreateMultisigProposalParams = CreateProposalBaseParams & {
  approve?: boolean;
  tryExecution?: boolean;
  startDate?: Date;
  /** Date at which the proposal will expire if not approved */
  endDate?: Date;
};

export type ApproveMultisigProposalParams = {
  proposalId: string;
  tryExecution: boolean;
};

export type CanApproveParams = {
  proposalId: string
  addressOrEns: string;
};

export enum ApproveProposalStep {
  APPROVING = "approving",
  DONE = "done",
}

export type ApproveProposalStepValue =
  | { key: ApproveProposalStep.APPROVING; txHash: string }
  | { key: ApproveProposalStep.DONE };

type MultisigProposalBase = {
  id: string;
  dao: {
    address: string;
    name: string;
  };
  creatorAddress: string;
  status: ProposalStatus;
};

export type MultisigProposalListItem = MultisigProposalBase & {
  metadata: ProposalMetadataSummary;
  approvals: number;
};

export type MultisigProposal = MultisigProposalBase & {
  creationDate: Date;
  metadata: ProposalMetadata;
  actions: DaoAction[];
  approvals: string[];
  startDate: Date;
  endDate: Date;
  executionTxHash: string;
};

type SubgraphProposalBase = {
  id: string;
  dao: {
    id: string;
    subdomain: string;
  };
  creator: string;
  metadata: string;
  executed: boolean;
  createdAt: string;
  startDate: string;
};

export type SubgraphMultisigProposalListItem = SubgraphProposalBase & {
  approvals: string;
};
export type SubgraphMultisigProposal = SubgraphProposalBase & {
  createdAt: string;
  startDate: string;
  endDate: string;
  actions: SubgraphAction[];
  approvers: SubgraphMultisigApproversListItem[];
  executionTxHash: string;
};

export type SubgraphMultisigApproversListItem = {
  approver: { id: string };
};

export type SubgraphMultisigVotingSettings = {
  minApprovals: string; // TODO: Should be now a number?
  onlyListed: boolean;
};

export type SubgraphMultisigMembers = {
  members: {
    address: string;
  }[];
};
