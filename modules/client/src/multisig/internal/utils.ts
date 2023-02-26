import { hexToBytes } from "@aragon/sdk-common";
import {
  computeProposalStatus,
  DaoAction,
  ProposalMetadata,
  SubgraphAction,
} from "../../client-common";
import {
  MultisigProposal,
  MultisigProposalListItem,
  SubgraphMultisigProposal,
  SubgraphMultisigProposalListItem,
} from "../interfaces";

export function toMultisigProposal(
  proposal: SubgraphMultisigProposal,
  metadata: ProposalMetadata,
): MultisigProposal {
  const creationDate = new Date(
    parseInt(proposal.createdAt) * 1000,
  );
  const startDate = new Date(
    parseInt(proposal.startDate) * 1000,
  );
  const endDate = new Date(
    parseInt(proposal.endDate) * 1000,
  );
  const executionDate = proposal.executionDate
    ? new Date(
      parseInt(proposal.executionDate) * 1000,
    )
    : null;
  return {
    id: proposal.id,
    dao: {
      address: proposal.dao.id,
      name: proposal.dao.subdomain,
    },
    creatorAddress: proposal.creator,
    metadata: {
      title: metadata.title,
      summary: metadata.summary,
      description: metadata.description,
      resources: metadata.resources,
      media: metadata.media,
    },
    settings: {
      onlyListed: proposal.plugin.onlyListed,
      minApprovals: parseInt(proposal.plugin.minApprovals),
    },
    creationBlockNumber: parseInt(proposal.creationBlockNumber) || 0,
    creationDate,
    startDate,
    endDate,
    executionDate,
    executionBlockNumber: parseInt(proposal.executionBlockNumber) || null,
    executionTxHash: proposal.executionTxHash || null,
    actions: proposal.actions.map(
      (action: SubgraphAction): DaoAction => {
        return {
          data: hexToBytes(action.data),
          to: action.to,
          value: BigInt(action.value),
        };
      },
    ),
    status: computeProposalStatus(proposal),
    approvals: proposal.approvers.map(
      (approver) => approver.id.slice(0, 42),
    ),
  };
}
export function toMultisigProposalListItem(
  proposal: SubgraphMultisigProposalListItem,
  metadata: ProposalMetadata,
): MultisigProposalListItem {
  const startDate = new Date(
    parseInt(proposal.startDate) * 1000,
  );
  const endDate = new Date(
    parseInt(proposal.endDate) * 1000,
  );
  return {
    id: proposal.id,
    dao: {
      address: proposal.dao.id,
      name: proposal.dao.subdomain,
    },
    creatorAddress: proposal.creator,
    metadata: {
      title: metadata.title,
      summary: metadata.summary,
    },
    approvals: proposal.approvers.map(
      (approver) => approver.id.slice(0, 42),
    ),
    settings: {
      onlyListed: proposal.plugin.onlyListed,
      minApprovals: parseInt(proposal.plugin.minApprovals),
    },
    startDate,
    endDate,
    status: computeProposalStatus(proposal),
  };
}
