/** Decodes a hex string and returns it as a buffer */
export function hexToBytes(hexString: string): Uint8Array {
  if (!hexString) return new Uint8Array();
  else if (!/^(0x)?[0-9a-fA-F]+$/.test(hexString)) {
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

/** Encodes a buffer into a hex string with the "0x" prefix */
export function bytesToHex(buff: Uint8Array, skip0x?: boolean): string {
  const bytes: string[] = [];
  for (let i = 0; i < buff.length; i++) {
    if (buff[i] >= 16) bytes.push(buff[i].toString(16));
    else bytes.push("0" + buff[i].toString(16));
  }
  if (skip0x) return bytes.join("");
  return "0x" + bytes.join("");
}

/** Encodes the given big integer as a 32 byte big endian buffer */
export function bigIntToBuffer(number: bigint): Uint8Array {
  let hexNumber = number.toString(16);
  while (hexNumber.length < 64) hexNumber = "0" + hexNumber;
  return hexToBytes(hexNumber);
}

/** Encodes the given big integer as a 32 byte little endian buffer */
export function bigIntToLeBuffer(number: bigint): Uint8Array {
  return bigIntToBuffer(number).reverse();
}

/** Transforms the given (big endian) buffer into a big int */
export function bufferToBigInt(bytes: Buffer | Uint8Array): bigint {
  // Ensure that it is a buffer
  bytes = Buffer.from(bytes);
  return BigInt(ensure0x(bytes.toString("hex")));
}

/** Transforms the given (little endian) buffer into a endian big int */
export function bufferLeToBigInt(bytes: Buffer | Uint8Array): bigint {
  bytes = Buffer.from(bytes);
  return bufferToBigInt(bytes.reverse());
}

export function ensure0x(value: string): string {
  return value.startsWith("0x") ? value : "0x" + value;
}

export function strip0x(value: string): string {
  return value.startsWith("0x") ? value.substring(2) : value;
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

/** Encodes the particles of a proposalId into a globally unque value */
export function encodeProposalId(pluginAddress: string, id: number): string {
  if (!/^0x[A-Za-z0-9]{40}$/.test(pluginAddress)) {
    throw new Error("Invalid address");
  }

  let nonceFragment = id.toString(16).padStart(64, "0");

  return `${pluginAddress}_0x${nonceFragment}`;
}

/** Decodes a proposalId and returns the original pluginAddress and the nonce */
export function decodeProposalId(
  proposalId: string,
): { pluginAddress: string; id: number } {
  if (!/^0x[A-Za-z0-9]{40}_0x[A-Za-z0-9]{64}$/.test(proposalId)) {
    throw new Error("Invalid proposalId");
  }

  // matching array
  const matchedRegexResult =
    proposalId.match(/^(0x[A-Za-z0-9]{40})_(0x[A-Za-z0-9]{64})$/) || [];
  if (matchedRegexResult.length !== 3) {
    throw new Error("Failed to deconstruct proposalId");
  }

  return {
    pluginAddress: matchedRegexResult[1],
    id: parseInt(strip0x(matchedRegexResult[2]), 16),
  };
}

/** Transforms an array of booleans into a bitmap big integer */
export function boolArrayToBitmap(bools?: Array<boolean>) {
  if (!bools || !bools.length) return BigInt(0);
  else if (bools.length > 256) throw new Error("The array is too big");

  let result = BigInt(0);
  for (let i = 0; i < 256; i++) {
    if (!bools[i]) continue;
    result |= BigInt(1) << BigInt(i);
  }

  return result;
}

/** Transforms an array of booleans into a bitmap big integer */
export function bitmapToBoolArray(bitmap: bigint): Array<boolean> {
  if (bitmap >= (BigInt(1) << BigInt(256))) {
    throw new Error("The bitmap value is too big");
  }

  const result: Array<boolean> = [];
  for (let i = 0; i < 256; i++) {
    const mask = BigInt(1) << BigInt(i);
    result.push((bitmap & mask) != BigInt(0));
  }

  return result;
}
