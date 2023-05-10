import { SubgraphAction } from "../../client-common";

/* Subgraph types */
type SubgraphProposalBase = {
  id: string;
  dao: {
    id: string;
    subdomain: string;
  };
  creator: string;
  metadata: string;
  executed: boolean;
  createdAt: string;
  startDate: string;
  endDate: string;
};

export type SubgraphMultisigProposalBase = SubgraphProposalBase & {
  plugin: SubgraphMultisigVotingSettings;
  minApprovals: number;
  potentiallyExecutable: boolean;
  approvers: { id: string }[];
  // TODO change on subgraph fix
  // approvers: SubgraphMultisigApproversListItem[];
};

export type SubgraphMultisigProposalListItem = SubgraphMultisigProposalBase;

export type SubgraphMultisigProposal = SubgraphMultisigProposalBase & {
  actions: SubgraphAction[];
  executionTxHash: string;
  executionDate: string;
  executionBlockNumber: string;
  creationBlockNumber: string;
};

export type SubgraphMultisigApproversListItem = {
  approver: { id: string };
};

export type SubgraphMultisigVotingSettings = {
  minApprovals: number;
  onlyListed: boolean;
};
