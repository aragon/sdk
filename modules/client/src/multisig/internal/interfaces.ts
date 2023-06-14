// This file contains the definitions of the AddressList DAO client

import {
  DaoAction,
  GasFeeEstimation,
  InterfaceParams,
  PrepareInstallationStepValue,
  ProposalMetadata,
} from "@aragon/sdk-client-common";
import {
  ExecuteProposalStepValue,
  ProposalCreationStepValue,
  ProposalQueryParams,
} from "../../client-common";
import {
  AddAddressesParams,
  ApproveMultisigProposalParams,
  ApproveProposalStepValue,
  CanApproveParams,
  CreateMultisigProposalParams,
  MultisigPluginPrepareInstallationParams,
  MultisigProposal,
  MultisigProposalListItem,
  MultisigVotingSettings,
  RemoveAddressesParams,
  UpdateMultisigVotingSettingsParams,
} from "../types";

// Multisig
export interface IMultisigClientMethods {
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
  prepareInstallation: (
    params: MultisigPluginPrepareInstallationParams,
  ) => AsyncGenerator<PrepareInstallationStepValue>;
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
    params: ProposalQueryParams,
  ) => Promise<MultisigProposalListItem[]>;
}

export interface IMultisigClientEncoding {
  addAddressesAction: (params: AddAddressesParams) => DaoAction;
  removeAddressesAction: (params: RemoveAddressesParams) => DaoAction;
  updateMultisigVotingSettings: (
    params: UpdateMultisigVotingSettingsParams,
  ) => DaoAction;
}
export interface IMultisigClientDecoding {
  addAddressesAction: (data: Uint8Array) => string[];
  removeAddressesAction: (data: Uint8Array) => string[];
  updateMultisigVotingSettings: (data: Uint8Array) => MultisigVotingSettings;
  findInterface: (data: Uint8Array) => InterfaceParams | null;
}
export interface IMultisigClientEstimation {
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
