import { OSX_PROPOSAL_ID_REGEX } from "./constants";
import { InvalidCidError } from "./errors";
import { MultiUri } from "./multiuri";

export function resolveIpfsCid(data: string): string {
  const uri = new MultiUri(data);
  const cid = uri.ipfsCid;
  if (!cid) {
    throw new InvalidCidError();
  }
  return cid;
}

export function isProposalId(proposalId: string): boolean {
  const regex = new RegExp(OSX_PROPOSAL_ID_REGEX);
  return regex.test(proposalId);
}
