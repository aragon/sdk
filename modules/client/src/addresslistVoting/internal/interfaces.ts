// This file contains the definitions of the AddressList DAO client

import {
  DaoAction,
  GasFeeEstimation,
  InterfaceParams,
  PrepareInstallationStepValue,
  PrepareUpdateStepValue,
  ProposalMetadata,
} from "@aragon/sdk-client-common";
import {
  CanVoteParams,
  CreateMajorityVotingProposalParams,
  ExecuteProposalStepValue,
  MembersQueryParams,
  ProposalCreationStepValue,
  ProposalQueryParams,
  VoteProposalParams,
  VoteProposalStepValue,
  VotingSettings,
} from "../../client-common";
import {
  AddresslistVotingPluginPrepareInstallationParams,
  AddresslistVotingPluginPrepareUpdateParams,
  AddresslistVotingProposal,
  AddresslistVotingProposalListItem,
} from "../types";

// Address List
export interface IAddresslistVotingClientMethods {
  createProposal: (
    params: CreateMajorityVotingProposalParams,
  ) => AsyncGenerator<ProposalCreationStepValue>;
  pinMetadata: (params: ProposalMetadata) => Promise<string>;
  voteProposal: (
    params: VoteProposalParams,
  ) => AsyncGenerator<VoteProposalStepValue>;
  executeProposal: (
    proposalId: string,
  ) => AsyncGenerator<ExecuteProposalStepValue>;
  prepareInstallation: (
    params: AddresslistVotingPluginPrepareInstallationParams,
  ) => AsyncGenerator<PrepareInstallationStepValue>;
  prepareUpdate: (
    params: AddresslistVotingPluginPrepareUpdateParams,
  ) => AsyncGenerator<PrepareUpdateStepValue>;
  canVote: (params: CanVoteParams) => Promise<boolean>;
  canExecute: (proposalId: string) => Promise<boolean>;
  getMembers: (params: MembersQueryParams) => Promise<string[]>;
  getProposal: (
    propoosalId: string,
  ) => Promise<AddresslistVotingProposal | null>;
  getProposals: (
    params: ProposalQueryParams,
  ) => Promise<AddresslistVotingProposalListItem[]>;
  getVotingSettings: (
    pluginAddress: string,
    blockNumber?: number,
  ) => Promise<VotingSettings | null>;
}

export interface IAddresslistVotingClientEncoding {
  updatePluginSettingsAction: (
    pluginAddress: string,
    params: VotingSettings,
  ) => DaoAction;
  addMembersAction: (
    pluginAddress: string,
    members: string[],
  ) => DaoAction;
  removeMembersAction: (
    pluginAddress: string,
    members: string[],
  ) => DaoAction;
}
export interface IAddresslistVotingClientDecoding {
  updatePluginSettingsAction: (data: Uint8Array) => VotingSettings;
  addMembersAction: (data: Uint8Array) => string[];
  removeMembersAction: (data: Uint8Array) => string[];
  findInterface: (data: Uint8Array) => InterfaceParams | null;
}
export interface IAddresslistVotingClientEstimation {
  createProposal: (
    params: CreateMajorityVotingProposalParams,
  ) => Promise<GasFeeEstimation>;
  voteProposal: (params: VoteProposalParams) => Promise<GasFeeEstimation>;
  executeProposal: (
    proposalId: string,
  ) => Promise<GasFeeEstimation>;
  prepareUpdate(
    params: AddresslistVotingPluginPrepareUpdateParams,
  ): Promise<GasFeeEstimation>;
}
/** Defines the shape of the AddressList client class */
export interface IAddresslistVotingClient {
  methods: IAddresslistVotingClientMethods;
  encoding: IAddresslistVotingClientEncoding;
  decoding: IAddresslistVotingClientDecoding;
  estimation: IAddresslistVotingClientEstimation;
}
