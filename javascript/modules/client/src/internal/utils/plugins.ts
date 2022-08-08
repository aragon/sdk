import { Random } from "@aragon/sdk-common";
import { ProposalStatus } from "../interfaces/common";
import { Erc20Proposal, MultisigProposal } from "../interfaces/plugins";

// TODO: delete this file

export function getErc20ProposalsWithStatus(proposals: Erc20Proposal[]) {
  const now = new Date();

  return proposals.map(proposal => {
    if (proposal.startDate >= now) {
      return { ...proposal, status: ProposalStatus.PENDING };
    } else if (proposal.endDate >= now) {
      return { ...proposal, status: ProposalStatus.ACTIVE };
      // proposal does not have the executed field
      // so is randomly computed.
      // This function is maybe temporal but the
      // logic to compute de state will be used 
      // in the future
      // } else if (proposal.executed) {
      } else if (Math.round(Random.getFloat()) === 0) {
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
export function getMultisigProposalsWithStatus(proposals: MultisigProposal[]) {
  const now = new Date();

  return proposals.map(proposal => {
    if (proposal.startDate >= now) {
      return { ...proposal, status: ProposalStatus.PENDING };
    } else if (proposal.endDate >= now) {
      return { ...proposal, status: ProposalStatus.ACTIVE };
    // proposal does not have the executed field
    // so is randomly computed.
    // This function is maybe temporal but the
    // logic to compute de state will be used 
    // in the future
    // } else if (proposal.executed) {
    } else if (Math.round(Random.getFloat()) === 0) {
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
