// This file contains the definitions of the AddressList DAO client

import {
  CanExecuteParams,
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
    params: ExecuteProposalParams,
  ) => AsyncGenerator<ExecuteProposalStepValue>;
  canApprove: (params: CanApproveParams) => Promise<boolean>;
  canExecute: (params: CanExecuteParams) => Promise<boolean>;
  getVotingSettings: (
    addressOrEns: string,
  ) => Promise<MultisigVotingSettings>;
  getMembers: (
    addressOrEns: string,
  ) => Promise<string[]>;
  getProposal: (propoosalId: string) => Promise<MultisigProposal | null>;
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
    params: ExecuteProposalParams,
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
  startDate: Date;
  /** Date at which the proposal will expire if not approved */
  endDate: Date;
};

export type ApproveMultisigProposalParams = CanExecuteParams & {
  tryExecution: boolean;
};

export type CanApproveParams = CanExecuteParams & {
  addressOrEns: string;
};
export type ExecuteProposalParams = CanExecuteParams;

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
};

export type MultisigProposal = MultisigProposalBase & {
  creationDate: Date;
  metadata: ProposalMetadata;
  actions: DaoAction[];
  approvals: string[];
};

type SubgraphProposalBase = {
  id: string;
  dao: {
    id: string;
    name: string;
  };
  creator: string;
  metadata: string;
  executed: boolean;
};

export type SubgraphMultisigProposalListItem = SubgraphProposalBase;
export type SubgraphMultisigProposal = SubgraphProposalBase & {
  createdAt: string;
  actions: SubgraphAction[];
  approvers: SubgraphMultisigApproversListItem[];
};

export type SubgraphMultisigApproversListItem = {
  approver: { id: string };
};

export type SubgraphMultisigVotingSettings = {
  minApprovals: string;
  onlyListed: boolean;
};

export type SubgraphMultisigMembers = {
  members: {
    address: string;
  }[];
};
