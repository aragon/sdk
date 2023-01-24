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

export interface IAdminClientMethods extends IClientCore {
  executeProposal: (
    params: ExecuteAdminProposalParams,
  ) => AsyncGenerator<ExecuteProposalStepValue>;
  pinMetadata: (
    params: ProposalMetadata,
  ) => Promise<string>;
  getProposal: (proposalId: string) => Promise<AdminProposal | null>;
  getProposals: (
    params: IAdminProposalQueryParams,
  ) => Promise<AdminProposalListItem[]>;
}

export interface IAdminClientEncoding extends IClientCore {}

export interface IAdminClientEstimation extends IClientCore {
  executeProposal: (parms: ExecuteAdminProposalParams) => Promise<GasFeeEstimation>;
}

export interface IAdminClient {
  methods: IAdminClientMethods;
  encoding: IAdminClientEncoding;
  estimation: IAdminClientEstimation;
}

export type ExecuteAdminProposalParams = {
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
  // TODO
  // fix typo
  adminstrator: {
    address: string;
  };
};

export type SubgraphAdminProposalListItem = SubgraphAdminProposalBase;

export type SubgraphAdminProposal = SubgraphAdminProposalBase & {
  actions: SubgraphAction[];
  plugin: {
    id: string;
  };
  proposalId: string;
};
