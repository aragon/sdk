import {
  DaoAction,
  ExecuteProposalStep,
  ExecuteProposalStepValue,
  IClientCore,
  ProposalMetadata,
} from "../client-common";

export interface IClientAdminMethods extends IClientCore {
  executeProposal: (
    params: ExecuteProposalParams,
  ) => AsyncGenerator<ExecuteProposalStepValue>;
  pinMetadata: (
    params: ProposalMetadata,
  ) => Promise<string>;
}

export interface IClientAdminEncoding extends IClientCore {}

export interface IClientAdminDecoding extends IClientCore {}

export interface IClientAdminEstimation extends IClientCore {}

export interface IClientAdmin {
  methods: IClientAdminMethods;
  encoding: IClientAdminEncoding;
  decoding: IClientAdminDecoding;
  estimation: IClientAdminEstimation;
}

export type ExecuteProposalParams = {
  pluginAddress: string;
  metadataUri: string;
  actions: DaoAction[];
};
