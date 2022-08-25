import { DAO__factory } from "@aragon/core-contracts-ethers";
import { strip0x, hexToBytes } from "@aragon/sdk-common";
import { Result } from "@ethersproject/abi";
import { BigNumber } from "@ethersproject/bignumber";
import { AddressZero } from "@ethersproject/constants";
import { IWithdrawParams } from "../interfaces/client";

export function encodeWithdrawActionData(params: IWithdrawParams): Uint8Array {
  const daoInterface = DAO__factory.createInterface();
  const args = unwrapWithdrawParams(params);
  // get hex bytes
  const hexBytes = daoInterface.encodeFunctionData("withdraw", args);
  // Strip 0x => cast to ASCII => encode in Uint8Array
  return hexToBytes((strip0x(hexBytes)));
}

export function decodeWithdrawActionData(data: Uint8Array): IWithdrawParams {
  const daoInterface = DAO__factory.createInterface();
  // get hex bytes
  const result: Result = daoInterface.decodeFunctionData("withdraw", data);
  // Strip 0x => cast to ASCII => encode in Uint8Array
  return wrapWithdrawParams(result);
}

function wrapWithdrawParams(
  result: Result
): IWithdrawParams {
  return {
    tokenAddress: result[0],
    recipientAddress: result[1],
    amount: BigInt(result[2]),
    reference: result[3]
  }
}

function unwrapWithdrawParams(
  params: IWithdrawParams
): [string, string, BigNumber, string] {
  return [
    params.tokenAddress ?? AddressZero,
    params.recipientAddress,
    BigNumber.from(params.amount),
    params.reference ?? "",
  ];
}

export function encodeUpdateMetadataAction(ipfsUri: string): Uint8Array {
  const daoInterface = DAO__factory.createInterface();
  const args = new TextEncoder().encode(ipfsUri)
  const hexBytes = daoInterface.encodeFunctionData("setMetadata", [args])
  return hexToBytes((strip0x(hexBytes)));
}

export function decodeUpdateMetadataAction(data: Uint8Array): string {
  const daoInterface = DAO__factory.createInterface();
  const result: Result = daoInterface.decodeFunctionData("setMetadata", data)
  const bytes = hexToBytes(result[0])
  return new TextDecoder().decode(bytes);
}
