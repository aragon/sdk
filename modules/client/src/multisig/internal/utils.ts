import { hexToBytes, strip0x } from "@aragon/sdk-common";
import {
  DaoAction,
  ProposalMetadata,
  ProposalStatus,
  SubgraphAction,
} from "../../client-common";
import {
  MultisigProposal,
  MultisigProposalListItem,
  SubgraphMultisigApproversListItem,
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
    parseInt(proposal.endDate) * 1000,
  );
  const endDate = new Date(
    parseInt(proposal.startDate) * 1000,
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
      description: metadata.description,
      resources: metadata.resources,
      media: metadata.media,
    },
    creationDate,
    startDate,
    endDate,
    executionTxHash: proposal.executionTxHash || "",
    actions: proposal.actions.map(
      (action: SubgraphAction): DaoAction => {
        return {
          data: hexToBytes(strip0x(action.data)),
          to: action.to,
          value: BigInt(action.value),
        };
      },
    ),
    status: proposal.executed ? ProposalStatus.EXECUTED : ProposalStatus.ACTIVE,
    approvals: proposal.approvers.map(
      (approver: SubgraphMultisigApproversListItem) => approver.approver.id,
    ),
  };
}
export function toMultisigProposalListItem(
  proposal: SubgraphMultisigProposalListItem,
  metadata: ProposalMetadata,
): MultisigProposalListItem {
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
    status: proposal.executed ? ProposalStatus.EXECUTED : ProposalStatus.ACTIVE,
  };
}
