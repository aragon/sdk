import { hexToBytes, InvalidProposalStatus, strip0x } from "@aragon/sdk-common";
import {
  DaoAction,
  ProposalMetadata,
  ProposalStatus,
  SubgraphAction,
} from "../../client-common";
import {
  AdminProposal,
  AdminProposalListItem,
  SubgraphAdminProposal,
  SubgraphAdminProposalListItem,
} from "../interfaces";

export function toAdminProposal(
  proposal: SubgraphAdminProposal,
  metadata: ProposalMetadata,
): AdminProposal {
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
    metadata,
    creationDate,
    adminAddress: proposal.adminstrator.address,
    status: proposal.executed
      ? ProposalStatus.EXECUTED
      : ProposalStatus.SUCCEEDED,
    actions: proposal.actions.map(
      (action: SubgraphAction): DaoAction => {
        return {
          data: hexToBytes(strip0x(action.data)),
          to: action.to,
          value: BigInt(action.value),
        };
      },
    ),
    pluginAddress: proposal.plugin.id,
    proposalId: BigInt(proposal.proposalId),
  };
}
export function toAdminProposalListItem(
  proposal: SubgraphAdminProposalListItem,
  metadata: ProposalMetadata,
): AdminProposalListItem {
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
    metadata,
    creationDate,
    adminAddress: proposal.adminstrator.address,
    status: proposal.executed
      ? ProposalStatus.EXECUTED
      : ProposalStatus.SUCCEEDED,
  };
}

export function computeProposalStatusFilter(
  status: ProposalStatus,
): Object {
  let where = {};
  switch (status) {
    case ProposalStatus.EXECUTED:
      where = { executed: true };
      break;
    case ProposalStatus.SUCCEEDED:
      where = { executed: false };
      break;
    default:
      throw new InvalidProposalStatus();
  }
  return where;
}
