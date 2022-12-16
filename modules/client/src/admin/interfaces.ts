import {
  DaoAction,
  ExecuteProposalStepValue,
  GasFeeEstimation,
  IClientCore,
  IPagination,
  ProposalMetadata,
  ProposalSortBy,
  ProposalStatus,
  SubgraphAction,
} from "../client-common";

export interface IClientAdminMethods extends IClientCore {
  executeProposal: (
    params: ExecuteProposalParams,
  ) => AsyncGenerator<ExecuteProposalStepValue>;
  pinMetadata: (
    params: ProposalMetadata,
  ) => Promise<string>;
  getProposal: (proposalId: string) => Promise<AdminProposal | null>;
  getProposals: (
    params: IAdminProposalQueryParams,
  ) => Promise<AdminProposalListItem[]>;
}

export interface IClientAdminEncoding extends IClientCore {}

export interface IClientAdminEstimation extends IClientCore {
  executeProposal: (parms: ExecuteProposalParams) => Promise<GasFeeEstimation>;
}

export interface IClientAdmin {
  methods: IClientAdminMethods;
  encoding: IClientAdminEncoding;
  estimation: IClientAdminEstimation;
}

export type ExecuteProposalParams = {
  pluginAddress: string;
  metadataUri: string;
  actions: DaoAction[];
};

type ProposalBase = {
  id: string;
  dao: {
    address: string;
    name: string;
  };
  creatorAddress: string;
  metadata: ProposalMetadata;
  creationDate: Date;
  adminAddress: string;
  status: ProposalStatus;
};
export type AdminProposal = ProposalBase & {
  actions: DaoAction[];
  pluginAddress: string;
  proposalId: bigint;
};
export type AdminProposalListItem = ProposalBase;

export interface IAdminProposalQueryParams extends IPagination {
  sortBy?: ProposalSortBy;
  status?: ProposalStatus;
  adminAddressOrEns?: string;
}

type SubgraphAdminProposalBase = {
  id: string;
  dao: {
    id: string;
    name: string;
  };
  creator: string;
  metadata: string;
  createdAt: string;
  executed: boolean;
  administrator: {
    address: string;
  };
};

export type SubgraphAdminProposalListItem = SubgraphAdminProposalBase;

export type SubgraphAdminProposal = SubgraphAdminProposalBase & {
  actions: SubgraphAction[];
  plugin: {
    address: string;
  };
  proposalId: string;
};
