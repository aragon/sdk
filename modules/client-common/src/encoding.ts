import { Zero } from "@ethersproject/constants";
import { Interface } from "@ethersproject/abi";
import { HEX_STRING_REGEX, OSX_PROPOSAL_ID_REGEX } from "./constants";
import { isProposalId } from "./validation";

/**
 * Ensures that a hex string has the "0x" prefix
 *
 * @export
 * @param {string} value
 * @return {*}  {string}
 */
export function ensure0x(value: string): string {
  return value.startsWith("0x") ? value : "0x" + value;
}

/**
 * Strips the "0x" prefix from a hex string
 *
 * @export
 * @param {string} value
 * @return {*}  {string}
 */
export function strip0x(value: string): string {
  return value.startsWith("0x") ? value.substring(2) : value;
}

/**
 * Encodes a buffer into a hex string with the "0x" prefix
 *
 * @export
 * @param {string} hexString
 * @return {*}  {Uint8Array}
 */
export function hexToBytes(hexString: string): Uint8Array {
  if (!hexString) return new Uint8Array();
  else if (!HEX_STRING_REGEX.test(hexString)) {
    throw new Error("Invalid hex string");
  } else if (hexString.length % 2 !== 0) {
    throw new Error("The hex string has an odd length");
  }

  hexString = strip0x(hexString);
  const bytes = [];
  for (let i = 0; i < hexString.length; i += 2) {
    bytes.push(
      parseInt(hexString.substring(i, i + 2), 16),
    );
  }
  return Uint8Array.from(bytes);
}

/**
 * Encodes a buffer into a hex string with the "0x" prefix
 *
 * @export
 * @param {Uint8Array} buff
 * @param {boolean} [skip0x]
 * @return {*}  {string}
 */
export function bytesToHex(buff: Uint8Array, skip0x?: boolean): string {
  const bytes: string[] = [];
  for (let i = 0; i < buff.length; i++) {
    if (buff[i] >= 16) bytes.push(buff[i].toString(16));
    else bytes.push("0" + buff[i].toString(16));
  }
  if (skip0x) return bytes.join("");
  return ensure0x(bytes.join(""));
}

/**
 * Encodes a 0-1 ratio within the given digit precision for storage on a smart contract
 *
 * @export
 * @param {number} ratio
 * @param {number} digits
 * @return {*}  {bigint}
 */
export function encodeRatio(ratio: number, digits: number): number {
  if (ratio < 0 || ratio > 1) {
    throw new Error("The ratio value should range between 0 and 1");
  } else if (!Number.isInteger(digits) || digits < 1 || digits > 15) {
    throw new Error(
      "The number of digits should range between 1 and 15",
    );
  }
  return Math.round(ratio * (10 ** digits));
}

/**
 * Decodes a value received from a smart contract to a number with
 *
 * @export
 * @param {bigint} onChainValue
 * @param {number} digits
 * @return {*}  {number}
 */
export function decodeRatio(
  onChainValue: bigint | number,
  digits: number,
): number {
  if (!Number.isInteger(digits) || digits < 1 || digits > 15) {
    throw new Error(
      "The number of digits should be a positive integer between 1 and 15",
    );
  } else if (onChainValue > 10 ** digits) {
    throw new Error("The value is out of range");
  }

  return Number(onChainValue) / (10 ** digits);
}

/**
 * Encodes the particles of a proposalId into a globally unique value for subgraph
 *
 * @export
 * @param {string} pluginAddress
 * @param {number} id
 * @return {*}
 */
export function encodeProposalId(pluginAddress: string, id: number) {
  if (!/^0x[A-Fa-f0-9]{40}$/.test(pluginAddress)) {
    throw new Error("Invalid address");
  }

  return `${pluginAddress}_0x${id.toString(16)}`;
}

/**
 * Decodes a proposalId from subgraph and returns the original pluginAddress and the nonce
 *
 * @export
 * @param {string} proposalId
 * @return {*}  {{ pluginAddress: string; id: number }}
 */
export function decodeProposalId(
  proposalId: string,
): { pluginAddress: string; id: number } {
  if (!isProposalId(proposalId)) {
    throw new Error("Invalid proposalId");
  }

  const matchedRegexResult = proposalId.match(OSX_PROPOSAL_ID_REGEX) || [];
  if (matchedRegexResult.length !== 3) {
    throw new Error("Could not parse the proposal ID");
  }

  return {
    pluginAddress: matchedRegexResult[1],
    id: parseInt(strip0x(matchedRegexResult[2]), 16),
  };
}

/**
 * Gets the interfaceId of a given interface
 *
 * @export
 * @param {Interface} iface
 * @return {*}  {string}
 */
export function getInterfaceId(iface: Interface): string {
  let interfaceId = Zero;
  const functions: string[] = Object.keys(iface.functions);
  for (const func of functions) {
    interfaceId = interfaceId.xor(iface.getSighash(func));
  }
  return interfaceId.toHexString();
}
