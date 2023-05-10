import {
  MajorityVotingProposalSettings,
  ProposalBase,
  ProposalListItemBase,
  VersionTag,
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
