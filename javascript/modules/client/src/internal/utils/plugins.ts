import { ProposalStatus } from "../interfaces/common";
import { Erc20Proposal, AllowListProposal, VoteOptions } from "../interfaces/plugins";

// TODO: delete this file

export function getERC20ProposalsWithStatus(proposals: Erc20Proposal[]) {
  const now = new Date();

  return proposals.map(proposal => {
    if (proposal.startDate >= now) {
      return { ...proposal, status: ProposalStatus.PENDING };
    } else if (proposal.endDate >= now) {
      return { ...proposal, status: ProposalStatus.ACTIVE };
    } else if (proposal.executed) {
      return { ...proposal, status: ProposalStatus.EXECUTED };
    } else if (
      proposal.result.yes &&
      proposal.result.no &&
      proposal.result.yes > proposal.result.no
    ) {
      return { ...proposal, status: ProposalStatus.SUCCEEDED };
    } else {
      return { ...proposal, status: ProposalStatus.DEFEATED };
    }
  });
}
export function getAllowListProposalsWithStatus(proposals: AllowListProposal[]) {
  const now = new Date();

  return proposals.map(proposal => {
    if (proposal.startDate >= now) {
      return { ...proposal, status: ProposalStatus.PENDING };
    } else if (proposal.endDate >= now) {
      return { ...proposal, status: ProposalStatus.ACTIVE };
    } else if (proposal.executed) {
      return { ...proposal, status: ProposalStatus.EXECUTED };
    } else if (
      proposal.result.yes &&
      proposal.result.no &&
      proposal.result.yes > proposal.result.no
    ) {
      return { ...proposal, status: ProposalStatus.SUCCEEDED };
    } else {
      return { ...proposal, status: ProposalStatus.DEFEATED };
    }
  });
}
