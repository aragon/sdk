import { InvalidCidError } from "./errors";

const IPFS_CID_REGEX =
  /^Qm([1-9A-HJ-NP-Za-km-z]{44,}|b[A-Za-z2-7]{58,}|B[A-Z2-7]{58,}|z[1-9A-HJ-NP-Za-km-z]{48,}|F[0-9A-F]{50,})$/;

const PROTOCOL_REGEX = /^\w+:\/\//;
/** Attempts to parse the given string as a URL and returns the IPFS CiD contained in it.
 * Alternatively it tries to use the raw value after validating it.
 */
export function resolveIpfsCid(data: string): string {
  if (!PROTOCOL_REGEX.test(data)) {
    if (!IPFS_CID_REGEX.test(data)) {
      throw new InvalidCidError();
    }
    return data;
  }

  const metadataCid = data.split(PROTOCOL_REGEX)[1];
  if (!IPFS_CID_REGEX.test(metadataCid)) {
    throw new InvalidCidError();
  }
  return metadataCid;
}
