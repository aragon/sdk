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
  SubgraphMultisigApprovalListItem,
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
  return {
    id: proposal.id,
    dao: {
      address: proposal.dao.id,
      name: proposal.dao.name,
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
    approvals: proposal.approvals.map(
      (approval: SubgraphMultisigApprovalListItem) => approval.id,
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
      name: proposal.dao.name,
    },
    creatorAddress: proposal.creator,
    metadata: {
      title: metadata.title,
      summary: metadata.summary,
    },
    status: proposal.executed ? ProposalStatus.EXECUTED : ProposalStatus.ACTIVE,
  };
}
