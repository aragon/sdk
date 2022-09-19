import { ProposalStatus } from "../interfaces/common";

export function computeProposalStatus(
  startDate: Date,
  endDate: Date,
  executed: boolean,
  yes?: bigint,
  no?: bigint,
): ProposalStatus {
  const now = new Date();
  if (startDate >= now) {
    return ProposalStatus.PENDING;
  } else if (endDate >= now) {
    return ProposalStatus.ACTIVE;
  } else if (executed) {
    return ProposalStatus.EXECUTED;
  } else if (yes && no && yes > no) {
    return ProposalStatus.SUCCEEDED;
  } else {
    return ProposalStatus.DEFEATED;
  }
}

export function isProposalId(propoosalId: string): boolean {
  const regex = new RegExp(/^0x[A-Fa-f0-9]{40}_0x[A-Fa-f0-9]{1,}$/i);
  return regex.test(propoosalId);
}
