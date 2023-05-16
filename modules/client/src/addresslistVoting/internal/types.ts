import {
  ContractVotingSettings,
  SubgraphAction,
  SubgraphProposalBase,
  SubgraphVoterListItemBase,
  VotingMode,
} from "../../client-common";

/* Contract types */
export type ContractAddresslistVotingInitParams = [
  ContractVotingSettings,
  string[], // addresses
];

/* Subgraph types */
export type SubgraphAddresslistVotingVoterListItem = SubgraphVoterListItemBase;

export type SubgraphAddresslistVotingProposalListItem = SubgraphProposalBase & {
  earlyExecutable: boolean;
  voters: SubgraphAddresslistVotingVoterListItem[];
};

export type SubgraphAddresslistVotingProposal = SubgraphProposalBase & {
  createdAt: string;
  actions: SubgraphAction[];
  supportThreshold: string;
  minVotingPower: string;
  voters: SubgraphAddresslistVotingVoterListItem[];
  totalVotingPower: string;
  votingMode: VotingMode;
  creationBlockNumber: string;
  executionDate: string;
  executionBlockNumber: string;
  executionTxHash: string;
  earlyExecutable: boolean;
};
