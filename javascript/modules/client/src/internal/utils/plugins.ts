import { ProposalStatus } from "../interfaces/common";


export function getProposalStatus(startDate: Date, endDate: Date, executed: boolean, yes?: bigint, no?: bigint): ProposalStatus {
  const now = new Date();
  if (startDate >= now) {
    return ProposalStatus.PENDING
  } else if (endDate >= now) {
    return ProposalStatus.ACTIVE
  } else if (executed) {
    return ProposalStatus.EXECUTED
  } else if (yes && no && yes > no) {
    return ProposalStatus.SUCCEEDED
  } else {
    return ProposalStatus.DEFEATED
  }
}

