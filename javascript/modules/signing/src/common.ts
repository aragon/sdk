import { Wallet, verifyMessage } from "@ethersproject/wallet";
import { Signer } from "@ethersproject/abstract-signer";
import { JsonRpcSigner } from "@ethersproject/providers";
import { keccak256 } from "@ethersproject/keccak256";
import { strip0x, ensure0x } from "@aragon/sdk-common";
import { computeAddress } from "@ethersproject/transactions";
import {
  recoverPublicKey as signingKeyRecoverPublicKey,
  computePublicKey,
} from "@ethersproject/signing-key";
import { hashMessage } from "@ethersproject/hash";
import { arrayify } from "@ethersproject/bytes";
import { TextEncoder } from "util";

// RAW SIGNING

/**
 * Sign a binary payload using the given Ethers wallet or signer.
 *
 * @param request
 * @param walletOrSigner
 */
export function signRaw(
  request: Uint8Array,
  walletOrSigner: Wallet | Signer
): Promise<string> {
  if (!walletOrSigner) throw new Error("Invalid wallet/signer");

  if (walletOrSigner instanceof Wallet) {
    return walletOrSigner.signMessage(request);
  } else if (!(walletOrSigner instanceof JsonRpcSigner)) {
    // Unexpected case, try to sign with eth_sign, even if we would prefer `personal_sign`
    return walletOrSigner.signMessage(request);
  }

  // Some providers will use eth_sign without prepending the Ethereum prefix.
  // This will break signatures in some cases (Wallet Connect, Ledger, Trezor, etc).
  // Using personal_sign instead
  return walletOrSigner
    .getAddress()
    .then(address =>
      walletOrSigner.provider.send("personal_sign", [
        uint8ArrayToArray(request),
        address.toLowerCase(),
      ])
    );
}

/**
 * Checks whether the given public key signed the given payload
 *
 * @param signature Hex encoded signature (created with the Ethereum prefix)
 * @param publicKey
 * @param messageBytes Uint8Array of the message
 */
export function isValidRaw(
  signature: string,
  publicKey: string,
  messageBytes: Uint8Array
): boolean {
  if (!publicKey) return true;
  else if (!signature) return false;

  const actualAddress = verifyMessage(messageBytes, ensure0x(signature));
  const expectedAddress = computeAddress(ensure0x(publicKey));

  return (actualAddress &&
    expectedAddress &&
    actualAddress === expectedAddress) as boolean;
}

/**
 * Returns the public key that signed the given message
 *
 * @param messageBytes
 * @param signature Hex encoded signature (created with the Ethereum prefix)
 * @param expanded Whether the resulting public key should be expanded or not (default: no)
 */
export function recoverPublicKeyRaw(
  messageBytes: Uint8Array,
  signature: string,
  expanded: boolean = false
): string {
  if (!signature) throw new Error("Invalid signature");
  else if (!messageBytes) throw new Error("Invalid messageBytes");

  const msgHash = hashMessage(messageBytes);
  const msgHashBytes = arrayify(msgHash);

  const expandedPubKey = signingKeyRecoverPublicKey(msgHashBytes, signature);

  if (expanded) return expandedPubKey;
  return computePublicKey(expandedPubKey, true);
}

// DIGEST

export function digestVocdoniMessage(payload: string | Uint8Array): Uint8Array {
  const prefix = "Vocdoni signed message:\n";

  return digestVocdoniPayload(payload, prefix);
}

export function digestVocdoniTransaction(
  payload: string | Uint8Array,
  chainId: string
): Uint8Array {
  const prefix = "Vocdoni signed transaction:\n" + chainId + "\n";

  return digestVocdoniPayload(payload, prefix);
}

function digestVocdoniPayload(
  payload: string | Uint8Array,
  prefix: string
): Uint8Array {
  const encoder = new TextEncoder();

  const payloadBytes =
    typeof payload === "string" ? encoder.encode(payload) : payload;
  const digestedPayload = strip0x(keccak256(payloadBytes));

  return encoder.encode(prefix + digestedPayload);
}

// HELPERS

function uint8ArrayToArray(buff: Uint8Array): number[] {
  const result = [];
  for (let i = 0; i < buff.length; ++i) {
    result.push(buff[i]);
  }
  return result;
}
