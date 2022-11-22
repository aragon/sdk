// This file contains the definitions of the AddressList DAO client

import { BigNumber } from "@ethersproject/bignumber";
import {
  DaoAction,
  ExecuteProposalStepValue,
  GasFeeEstimation,
  ICanVoteParams,
  IClientCore,
  ICreateProposalParams,
  IExecuteProposalParams,
  IInterfaceParams,
  IPluginSettings,
  IProposalQueryParams,
  IProposalSettings,
  IVoteProposalParams,
  ProposalBase,
  ProposalCreationStepValue,
  ProposalListItemBase,
  SubgraphAction,
  SubgraphProposalBase,
  SubgraphVoterListItemBase,
  VoteProposalStepValue,
  VoteValues,
} from "../client-common";

// Address List
export interface IClientAddressListMethods extends IClientCore {
  createProposal: (
    params: ICreateProposalParams,
  ) => AsyncGenerator<ProposalCreationStepValue>;
  voteProposal: (
    params: IVoteProposalParams,
  ) => AsyncGenerator<VoteProposalStepValue>;
  executeProposal: (
    params: IExecuteProposalParams,
  ) => AsyncGenerator<ExecuteProposalStepValue>;
  canVote: (params: ICanVoteParams) => Promise<boolean>;
  getMembers: (addressOrEns: string) => Promise<string[]>;
  getProposal: (propoosalId: string) => Promise<AddressListProposal | null>;
  getProposals: (
    params: IProposalQueryParams,
  ) => Promise<AddressListProposalListItem[]>;
  getSettings: (pluginAddress: string) => Promise<IPluginSettings | null>;
}

export interface IClientAddressListEncoding extends IClientCore {
  updatePluginSettingsAction: (
    pluginAddress: string,
    params: IPluginSettings,
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
export interface IClientAddressListDecoding extends IClientCore {
  updatePluginSettingsAction: (data: Uint8Array) => IPluginSettings;
  addMembersAction: (data: Uint8Array) => string[];
  removeMembersAction: (data: Uint8Array) => string[];
  findInterface: (data: Uint8Array) => IInterfaceParams | null;
}
export interface IClientAddressListEstimation extends IClientCore {
  createProposal: (
    params: ICreateProposalParams,
  ) => Promise<GasFeeEstimation>;
  voteProposal: (params: IVoteProposalParams) => Promise<GasFeeEstimation>;
  executeProposal: (
    params: IExecuteProposalParams,
  ) => Promise<GasFeeEstimation>;
}
/** Defines the shape of the AddressList client class */
export interface IClientAddressList {
  methods: IClientAddressListMethods;
  encoding: IClientAddressListEncoding;
  decoding: IClientAddressListDecoding;
  estimation: IClientAddressListEstimation;
}

export type AddressListProposal = ProposalBase & {
  result: AddressListProposalResult;
  settings: IProposalSettings;
  votes: Array<{ address: string; vote: VoteValues }>;
  totalVotingWeight: number;
};

export type AddressListProposalListItem = ProposalListItemBase & {
  result: AddressListProposalResult;
};
export type AddressListProposalResult = {
  yes: number;
  no: number;
  abstain: number;
};

export type SubgraphAddressListVoterListItem = SubgraphVoterListItemBase;

export type SubgraphAddressListProposalListItem = SubgraphProposalBase;
export type SubgraphAddressListProposal = SubgraphProposalBase & {
  createdAt: string;
  actions: SubgraphAction[];
  totalSupportThresholdPct: string;
  relativeSupportThresholdPct: string;
  voters: SubgraphAddressListVoterListItem[];
  census: string;
};

export type ContractAddressListInitParams = [
  string, // dao Address
  BigNumber, // min participation
  BigNumber, // min support
  BigNumber, // min duration
  string[], // addresses
];

export type IAddressListPluginInstall = {
  addresses: string[];
  settings: IPluginSettings;
};
