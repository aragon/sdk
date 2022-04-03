import { Wallet } from "@ethersproject/wallet";
import { Signer } from "@ethersproject/abstract-signer";
import {
  digestVocdoniMessage,
  digestVocdoniTransaction,
  isValidRaw,
  recoverPublicKeyRaw,
  signRaw,
} from "./common";

export namespace BytesSignature {
  /**
   * Prefix and Sign a binary payload using the given Ethers wallet or signer.
   * @param messageBytes
   * @param walletOrSigner
   */
  export function signMessage(
    messageBytes: Uint8Array,
    walletOrSigner: Wallet | Signer
  ): Promise<string> {
    if (!walletOrSigner) throw new Error("Invalid wallet/signer");
    const digestedRequest = digestVocdoniMessage(messageBytes);

    return signRaw(digestedRequest, walletOrSigner);
  }

  /**
   * Checks whether the given public key signed the given message
   *
   * @param signature Hex encoded signature (created with the Ethereum prefix)
   * @param publicKey
   * @param messageBytes Uint8Array of the message
   */
  export function isValidMessage(
    messageBytes: Uint8Array,
    signature: string,
    publicKey: string
  ): boolean {
    if (!publicKey) return true;
    else if (!signature) return false;
    const digestedMessage = digestVocdoniMessage(messageBytes);

    return isValidRaw(signature, publicKey, digestedMessage);
  }

  /**
   * Returns the public key that signed the given message
   *
   * @param messageBytes The payload being signed
   * @param signature Hex encoded signature (created with the Ethereum prefix)
   * @param expanded Whether the resulting public key should be expanded or not (default: no)
   */
  export function recoverMessagePublicKey(
    messageBytes: Uint8Array,
    signature: string,
    expanded: boolean = false
  ): string {
    if (!signature) throw new Error("Invalid signature");
    else if (!messageBytes) throw new Error("Invalid body");

    const digestedRequest = digestVocdoniMessage(messageBytes);

    return recoverPublicKeyRaw(digestedRequest, signature, expanded);
  }

  // TRANSACTIONS

  /**
   * Prefix and Sign a binary payload using the given Ethers wallet or signer.
   *
   * @param messageBytes
   * @param chainId The ID of the Vocdoni blockchain deployment for which the message is intended to
   * @param walletOrSigner
   */
  export function signTransaction(
    messageBytes: Uint8Array,
    chainId: string,
    walletOrSigner: Wallet | Signer
  ): Promise<string> {
    if (!walletOrSigner) throw new Error("Invalid wallet/signer");
    const digestedMessage = digestVocdoniTransaction(messageBytes, chainId);

    return signRaw(digestedMessage, walletOrSigner);
  }

  /**
   * Checks whether the given public key signed the given transaction
   *
   * @param signature Hex encoded signature (created with the Ethereum prefix)
   * @param publicKey
   * @param messageBytes Uint8Array of the message
   * @param chainId The ID of the Vocdoni blockchain deployment for which the message is intended to
   */
  export function isValidTransaction(
    messageBytes: Uint8Array,
    chainId: string,
    signature: string,
    publicKey: string
  ): boolean {
    if (!publicKey) return true;
    else if (!signature) return false;
    const digestedRequest = digestVocdoniTransaction(messageBytes, chainId);

    return isValidRaw(signature, publicKey, digestedRequest);
  }

  /**
   * Returns the public key that signed the given transaction
   *
   * @param messageBytes The payload being signed
   * @param chainId The id of the chain
   * @param signature Hex encoded signature (created with the Ethereum prefix)
   * @param expanded Whether the resulting public key should be expanded or not (default: no)
   */
  export function recoverTransactionPublicKey(
    messageBytes: Uint8Array,
    chainId: string,
    signature: string,
    expanded: boolean = false
  ): string {
    if (!signature) throw new Error("Invalid signature");
    else if (!messageBytes) throw new Error("Invalid body");

    const digestedRequest = digestVocdoniTransaction(messageBytes, chainId);

    return recoverPublicKeyRaw(digestedRequest, signature, expanded);
  }
}
