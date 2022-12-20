// This file contains the definitions of the AddressList DAO client

import {
  DaoAction,
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
  ) => AsyncGenerator<ProposalApprovalStepValue>;
  canApprove: (addressOrEns: string) => Promise<boolean>;
  getMembers: (addressOrEns: string) => Promise<string[]>;
  getProposal: (propoosalId: string) => Promise<MultisigProposal | null>;
  getProposals: (
    params: IProposalQueryParams,
  ) => Promise<MultisigProposalListItem[]>;
}

export interface IMultisigClientEncoding extends IClientCore {
  addMembersAction: (
    pluginAddress: string,
    members: string[],
  ) => DaoAction;
  removeMembersAction: (
    pluginAddress: string,
    members: string[],
  ) => DaoAction;
}
export interface IMultisigClientDecoding extends IClientCore {
  addMembersAction: (data: Uint8Array) => string[];
  removeMembersAction: (data: Uint8Array) => string[];
  findInterface: (data: Uint8Array) => IInterfaceParams | null;
}
export interface IMultisigClientEstimation extends IClientCore {
  createProposal: (
    params: CreateMultisigProposalParams,
  ) => Promise<GasFeeEstimation>;
  approveProposal: (params: ApproveMultisigProposalParams) => Promise<GasFeeEstimation>;
}

/** Defines the shape of the AddressList client class */
export interface IMultisigClient {
  methods: IMultisigClientMethods;
  encoding: IMultisigClientEncoding;
  decoding: IMultisigClientDecoding;
  estimation: IMultisigClientEstimation;
}

export type CreateMultisigProposalParams = {
  pluginAddress: string;
  metadataUri: string;
  actions?: DaoAction[];
};

export type ApproveMultisigProposalParams = {
  pluginAddress: string;
  proposalId: string;
};

export type MultisigPluginInstall = {
  addresses: string[];
};

export enum ApproveProposalSteps {
  APPROVING = "approving",
  DONE = "done",
}

export type ProposalApprovalStepValue =
  | { key: ApproveProposalSteps.APPROVING; txHash: string }
  | { key: ApproveProposalSteps.DONE };

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
