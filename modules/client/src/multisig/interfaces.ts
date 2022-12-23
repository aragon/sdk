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
    proposalId: string,
  ) => AsyncGenerator<ExecuteProposalStepValue>;
  canApprove: (params: CanApproveParams) => Promise<boolean>;
  canExecute: (params: CanExecuteParams) => Promise<boolean>;
  getPluginSettings: (
    addressOrEns: string,
  ) => Promise<MultisigPluginSettings>;
  getProposal: (propoosalId: string) => Promise<MultisigProposal | null>;
  getProposals: (
    params: IProposalQueryParams,
  ) => Promise<MultisigProposalListItem[]>;
}

export interface IMultisigClientEncoding extends IClientCore {
  addAddressesAction: (params: AddAddressesParams) => DaoAction;
  removeAddressesAction: (params: RemoveAddressesParams) => DaoAction;
  updateMinApprovalsAction: (params: UpdateMinApprovalsParams) => DaoAction;
}
export interface IMultisigClientDecoding extends IClientCore {
  addAddressesAction: (data: Uint8Array) => MultisigPluginSettings;
  removeAddressesAction: (data: Uint8Array) => MultisigPluginSettings;
  updateMinApprovalsAction: (data: Uint8Array) => bigint;
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

export type MultisigPluginSettings = {
  minApprovals: number;
  members: string[];
};

export type UpdateAddressesParams = MultisigPluginSettings & {
  pluginAddress: string;
};
export type RemoveAddressesParams = UpdateAddressesParams;
export type AddAddressesParams = UpdateAddressesParams;

export type UpdateMinApprovalsParams = {
  pluginAddress: string;
  minApprovals: number;
};

export type CreateMultisigProposalParams = CreateProposalBaseParams & {
  approve?: boolean;
  tryExecution?: boolean;
};

export type ApproveMultisigProposalParams = {
  proposalId: string;
  tryExecution: boolean;
};

export type CanApproveParams = CanExecuteParams;

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
  approvals: SubgraphMultisigApprovalListItem[];
};

export type SubgraphMultisigApprovalListItem = {
  id: string;
};

export type SubgraphMultisigPluginSettings = {
  members: {
    address: string;
  }[];
  minApprovals: string;
};
