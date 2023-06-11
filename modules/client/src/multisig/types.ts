import {
  ProposalBase,
  ProposalListItemBase,
  VersionTag,
} from "@aragon/sdk-client-common";
import { CreateProposalBaseParams } from "../client-common";

/* Installation */
export type MultisigPluginInstallParams = MultisigPluginSettings;

export type MultisigPluginPrepareInstallationParams = {
  settings: MultisigPluginSettings;
  daoAddressOrEns: string;
  versionTag?: VersionTag;
};

export type MultisigVotingSettings = {
  minApprovals: number;
  onlyListed: boolean;
};

export type MultisigPluginSettings = {
  members: string[];
  votingSettings: MultisigVotingSettings;
};
/* update members */
export type UpdateAddressesParams = {
  pluginAddress: string;
  members: string[];
};
export type RemoveAddressesParams = UpdateAddressesParams;
export type AddAddressesParams = UpdateAddressesParams;

/* update voting settings */
export type UpdateMultisigVotingSettingsParams = {
  pluginAddress: string;
  votingSettings: MultisigVotingSettings;
};

/* Create Proposal */
export type CreateMultisigProposalParams = CreateProposalBaseParams & {
  approve?: boolean;
  tryExecution?: boolean;
  startDate?: Date;
  /** Date at which the proposal will expire if not approved */
  endDate?: Date;
};

/* Approve Proposal */
export type ApproveMultisigProposalParams = {
  proposalId: string;
  tryExecution: boolean;
};

export type CanApproveParams = {
  proposalId: string;
  approverAddressOrEns: string;
};

export enum ApproveProposalStep {
  APPROVING = "approving",
  DONE = "done",
}

export type ApproveProposalStepValue =
  | { key: ApproveProposalStep.APPROVING; txHash: string }
  | { key: ApproveProposalStep.DONE };

/* Proposal */

export type MultisigProposalListItem = ProposalListItemBase & {
  approvals: string[];
  settings: MultisigVotingSettings;
};

export type MultisigProposal = ProposalBase & {
  approvals: string[];
  settings: MultisigVotingSettings;
};
