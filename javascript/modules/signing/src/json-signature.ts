import { Wallet } from "@ethersproject/wallet";
import { Signer } from "@ethersproject/abstract-signer";
import { BytesSignature } from "./bytes-signature";
import { TextEncoder } from "util";

export type JsonLike =
  | boolean
  | number
  | string
  | JsonLike[]
  | { [k: string]: JsonLike }
  | null;

export namespace JsonSignature {
  // MESSAGES

  /**
   * Sign a JSON message using the given Ethers wallet or signer.
   * Ensures that the object keys are alphabetically sorted.
   * @param message JSON object of the `response` or `error` fields
   * @param walletOrSigner
   */
  export function signMessage(
    message: JsonLike,
    walletOrSigner: Wallet | Signer
  ): Promise<string> {
    if (!walletOrSigner) throw new Error("Invalid wallet/signer");

    const strMessage = normalizedJsonString(message);
    const msgBytes = new TextEncoder().encode(strMessage);

    return BytesSignature.signMessage(msgBytes, walletOrSigner);
  }

  /**
   * Checks whether the given public key signed the given JSON message with its fields
   * sorted alphabetically
   * @param message JSON object of the `response` or `error` fields
   * @param signature Hex encoded signature (created with the Ethereum prefix)
   * @param publicKey
   */
  export function isValidMessage(
    message: JsonLike,
    signature: string,
    publicKey: string
  ): boolean {
    if (!publicKey) return true;
    else if (!signature) return false;

    const strMessage = normalizedJsonString(message);
    const msgBytes = new TextEncoder().encode(strMessage);

    return BytesSignature.isValidMessage(msgBytes, signature, publicKey);
  }

  /**
   * Returns the public key that signed the given JSON message, having its fields sorted alphabetically
   *
   * @param message JSON object of the `response` or `error` fields
   * @param signature Hex encoded signature (created with the Ethereum prefix)
   * @param expanded Whether the resulting public key should be expanded or not (default: no)
   */
  export function recoverMessagePublicKey(
    message: JsonLike,
    signature: string,
    expanded: boolean = false
  ): string {
    if (!signature) throw new Error("Invalid signature");
    else if (!message) throw new Error("Invalid body");

    const strMessage = normalizedJsonString(message);
    const msgBytes = new TextEncoder().encode(strMessage);

    return BytesSignature.recoverMessagePublicKey(
      msgBytes,
      signature,
      expanded
    );
  }

  // TRANSACTIONS

  /**
   * Sign a JSON transaction using the given Ethers wallet or signer.
   * Ensures that the object keys are alphabetically sorted.
   * @param message JSON object
   * @param chainId
   * @param walletOrSigner
   */
  export function signTransaction(
    message: JsonLike,
    chainId: string,
    walletOrSigner: Wallet | Signer
  ): Promise<string> {
    if (!walletOrSigner) throw new Error("Invalid wallet/signer");

    const strMessage = normalizedJsonString(message);
    const msgBytes = new TextEncoder().encode(strMessage);

    return BytesSignature.signTransaction(msgBytes, chainId, walletOrSigner);
  }

  /**
   * Checks whether the given public key signed the given JSON transaction with its fields
   * sorted alphabetically
   * @param message JSON object
   * @param chainId
   * @param signature Hex encoded signature (created with the Ethereum prefix)
   * @param publicKey
   */
  export function isValidTransaction(
    message: JsonLike,
    chainId: string,
    signature: string,
    publicKey: string
  ): boolean {
    if (!publicKey) return true;
    else if (!signature) return false;

    const strMessage = normalizedJsonString(message);
    const msgBytes = new TextEncoder().encode(strMessage);

    return BytesSignature.isValidTransaction(
      msgBytes,
      chainId,
      signature,
      publicKey
    );
  }

  /**
   * Returns the public key that signed the given JSON transaction, having its fields sorted alphabetically
   *
   * @param message JSON object
   * @param chainId
   * @param signature Hex encoded signature (created with the Ethereum prefix)
   * @param expanded Whether the resulting public key should be expanded or not (default: no)
   */
  export function recoverTransactionPublicKey(
    message: JsonLike,
    chainId: string,
    signature: string,
    expanded: boolean = false
  ): string {
    if (!signature) throw new Error("Invalid signature");
    else if (!message) throw new Error("Invalid body");

    const strMessage = normalizedJsonString(message);
    const msgBytes = new TextEncoder().encode(strMessage);

    return BytesSignature.recoverTransactionPublicKey(
      msgBytes,
      chainId,
      signature,
      expanded
    );
  }

  // HELPERS

  export function normalizedJsonString(body: JsonLike): string {
    const sortedRequest = sort(body);
    return JSON.stringify(sortedRequest);
  }

  /**
   * Returns a copy of the JSON data so that fields are ordered alphabetically and signatures are 100% reproducible
   * @param data Any valid JSON payload
   */
  export function sort<T extends JsonLike>(data: T): T {
    switch (typeof data) {
      case "bigint":
      case "function":
      case "symbol":
        throw new Error(
          "JSON objects with " + typeof data + " values are not supported"
        );
      case "undefined":
      case "boolean":
      case "number":
      case "string":
        return data;
    }

    if (Array.isArray(data)) return data.map(item => sort(item)) as typeof data;

    // Ensure ordered key names
    // @ts-ignore
    return Object.keys(data)
      .sort()
      .reduce((prev, cur) => {
        // @ts-ignore
        prev[cur] = sort(data[cur]);
        return prev;
      }, {}) as typeof data;
  }
}
