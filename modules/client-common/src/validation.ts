import { OSX_PROPOSAL_ID_REGEX } from "./constants";
import { InvalidCidError } from "./errors";
import { MultiUri } from "./multiuri";

/**
 * Attempts to parse the given string as a URL and returns the IPFS CiD contained in it.
 * Alternatively it tries to use the raw value after validating it.
 *
 * @export
 * @param {string} data
 * @return {*}  {string}
 */
export function resolveIpfsCid(data: string): string {
  const uri = new MultiUri(data);
  const cid = uri.ipfsCid;
  if (!cid) {
    throw new InvalidCidError();
  }
  return cid;
}

/**
 * Checks if the given string is a valid proposal ID
 *
 * @export
 * @param {string} proposalId
 * @return {*}  {boolean}
 */
export function isProposalId(proposalId: string): boolean {
  const regex = new RegExp(OSX_PROPOSAL_ID_REGEX);
  return regex.test(proposalId);
}
