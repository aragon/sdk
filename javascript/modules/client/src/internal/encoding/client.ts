import { DAO__factory } from "@aragon/core-contracts-ethers";
import { bytesToHex, hexToBytes, strip0x } from "@aragon/sdk-common";
import { Result } from "@ethersproject/abi";
import { BigNumber } from "@ethersproject/bignumber";
import { AddressZero } from "@ethersproject/constants";
import { AVAILABLE_CLIENT_FUNCTION_SIGNATURES } from "../constants/encoding";
import { FunctionFragment } from "@ethersproject/abi";
import { IWithdrawParams } from "../interfaces/client";
import { Interface } from "ethers/lib/utils";


export function getFunctionFragment(data: Uint8Array): FunctionFragment {
  const hexBytes = bytesToHex(data, true);
  const inter = new Interface(AVAILABLE_CLIENT_FUNCTION_SIGNATURES);
  return inter.getFunction(hexBytes.substring(0, 10));
}

export function encodeWithdrawActionData(params: IWithdrawParams): Uint8Array {
  const daoInterface = DAO__factory.createInterface();
  const args = unwrapWithdrawParams(params);
  // get hex bytes
  const hexBytes = daoInterface.encodeFunctionData("withdraw", args);
  return hexToBytes(strip0x(hexBytes));
}

export function decodeWithdrawActionData(data: Uint8Array): IWithdrawParams {
  const daoInterface = DAO__factory.createInterface();
  const hexBytes = bytesToHex(data, true);
  const receivedFunction = daoInterface.getFunction(
    hexBytes.substring(0, 10) as any,
  );
  const expectedFunction = daoInterface.getFunction("withdraw");
  if (receivedFunction.name !== expectedFunction.name) {
    throw new Error(
      "The received action is different from the expected one",
    );
  }
  const result = daoInterface.decodeFunctionData("withdraw", data);
  return wrapWithdrawParams(result);
}

function wrapWithdrawParams(
  result: Result,
): IWithdrawParams {
  return {
    tokenAddress: result[0],
    recipientAddress: result[1],
    amount: BigInt(result[2]),
    reference: result[3],
  };
}

function unwrapWithdrawParams(
  params: IWithdrawParams,
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
  const args = new TextEncoder().encode(ipfsUri);
  const hexBytes = daoInterface.encodeFunctionData("setMetadata", [args]);
  return hexToBytes(strip0x(hexBytes));
}

export function decodeUpdateMetadataAction(data: Uint8Array): string {
  const daoInterface = DAO__factory.createInterface();
  const hexBytes = bytesToHex(data, true);
  const receivedFunction = daoInterface.getFunction(
    hexBytes.substring(0, 10) as any,
  );
  const expectedFunction = daoInterface.getFunction("setMetadata");
  if (receivedFunction.name !== expectedFunction.name) {
    throw new Error(
      "The received action is different from the expected one",
    );
  }
  const result = daoInterface.decodeFunctionData("setMetadata", data);
  const bytes = hexToBytes(result[0]);
  const cid = new TextDecoder().decode(bytes);
  const ipfsRegex =
    /^Qm([1-9A-HJ-NP-Za-km-z]{44,}|b[A-Za-z2-7]{58,}|B[A-Z2-7]{58,}|z[1-9A-HJ-NP-Za-km-z]{48,}|F[0-9A-F]{50,})$/;
  if (!ipfsRegex.test(cid)) {
    throw new Error(
      "The metadata URL defined on the DAO is invalid",
    );
  }
  return cid;
}
