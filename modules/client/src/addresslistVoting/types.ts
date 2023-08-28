import {
  MetadataAbiInput,
  PrepareUpdateParams,
  ProposalBase,
  ProposalListItemBase,
  VersionTag,
} from "@aragon/sdk-client-common";
import {
  MajorityVotingProposalSettings,
  VoteValues,
  VotingSettings,
} from "../client-common";

export type AddresslistVotingProposal = ProposalBase & {
  result: AddresslistVotingProposalResult;
  settings: MajorityVotingProposalSettings;
  votes: Array<{ address: string; vote: VoteValues; voteReplaced: boolean }>;
  totalVotingWeight: number;
};

export type AddresslistVotingProposalListItem = ProposalListItemBase & {
  result: AddresslistVotingProposalResult;
  votes: Array<{ address: string; vote: VoteValues; voteReplaced: boolean }>;
};

export type AddresslistVotingProposalResult = {
  yes: number;
  no: number;
  abstain: number;
};

export type AddresslistVotingPluginInstall = {
  addresses: string[];
  votingSettings: VotingSettings;
};

export type AddresslistVotingPluginPrepareInstallationParams = {
  settings: AddresslistVotingPluginInstall;
  daoAddressOrEns: string;
  versionTag?: VersionTag;
};

export type AddresslistVotingPluginPrepareUpdateParams = Omit<
  PrepareUpdateParams,
  "pluginRepo"
>;
