import { DAO__factory } from "@aragon/core-contracts-ethers";
import { bytesToHex, hexToBytes, strip0x } from "@aragon/sdk-common";
import { BigNumber } from "@ethersproject/bignumber";
import { AddressZero } from "@ethersproject/constants";
import { FunctionFragment, Interface, Result } from "@ethersproject/abi";
import {
  ContractFreezeParams,
  ContractPermissionParams,
  ContractWithdrawParams,
  IFreezePermissionDecodedParams,
  IFreezePermissionParams,
  IGrantPermissionDecodedParams,
  IGrantPermissionParams,
  IRevokePermissionDecodedParams,
  IRevokePermissionParams,
  IWithdrawParams,
  PermissionIds,
} from "./interfaces/client";
import { keccak256 } from "@ethersproject/keccak256";
import { toUtf8Bytes } from "@ethersproject/strings";
import { AVAILABLE_CLIENT_FUNCTION_SIGNATURES } from "./constants";

export function getFunctionFragment(data: Uint8Array): FunctionFragment {
  const hexBytes = bytesToHex(data, true);
  const inter = new Interface(AVAILABLE_CLIENT_FUNCTION_SIGNATURES);
  return inter.getFunction(hexBytes.substring(0, 10));
}
export function encodeFreezeAction(
  params: IFreezePermissionParams,
): Uint8Array {
  const daoInterface = DAO__factory.createInterface();
  const args = freezeParamsToContract(params);
  // get hex bytes
  const hexBytes = daoInterface.encodeFunctionData("freeze", args);
  return hexToBytes(strip0x(hexBytes));
}

export function decodeFreezeActionData(
  data: Uint8Array,
): IFreezePermissionDecodedParams {
  const daoInterface = DAO__factory.createInterface();
  const hexBytes = bytesToHex(data, true);
  const receivedFunction = daoInterface.getFunction(
    hexBytes.substring(0, 10) as any,
  );
  const expectedFunction = daoInterface.getFunction("freeze");
  if (receivedFunction.name !== expectedFunction.name) {
    throw new Error("The received action is different from the expected one");
  }
  const result = daoInterface.decodeFunctionData("freeze", data);
  return freezeParamsFromContract(result);
}

function freezeParamsToContract(
  params: IFreezePermissionParams,
): ContractFreezeParams {
  return [params.where, keccak256(toUtf8Bytes(params.permission))];
}
function freezeParamsFromContract(
  result: Result,
): IFreezePermissionDecodedParams {
  return {
    where: result[0],
    permissionId: result[1],
    permission: Object.keys(PermissionIds)
      .find((k) => PermissionIds[k] === result[1])
      ?.replace(/_ID$/, "") || "",
  };
}

export function encodeGrantActionData(
  params: IGrantPermissionParams,
): Uint8Array {
  const daoInterface = DAO__factory.createInterface();
  const args = permissionParamsToContract(params);
  // get hex bytes
  const hexBytes = daoInterface.encodeFunctionData("grant", args);
  return hexToBytes(strip0x(hexBytes));
}

export function decodeGrantActionData(
  data: Uint8Array,
): IGrantPermissionDecodedParams {
  const daoInterface = DAO__factory.createInterface();
  const hexBytes = bytesToHex(data, true);
  const receivedFunction = daoInterface.getFunction(
    hexBytes.substring(0, 10) as any,
  );
  const expectedFunction = daoInterface.getFunction("grant");
  if (receivedFunction.name !== expectedFunction.name) {
    throw new Error("The received action is different from the expected one");
  }
  const result = daoInterface.decodeFunctionData("grant", data);
  return permissionParamsFromContract(result);
}

export function encodeRevokeActionData(
  params: IRevokePermissionParams,
): Uint8Array {
  const daoInterface = DAO__factory.createInterface();
  const args = permissionParamsToContract(params);
  // get hex bytes
  const hexBytes = daoInterface.encodeFunctionData("revoke", args);
  return hexToBytes(strip0x(hexBytes));
}

export function decodeRevokeActionData(
  data: Uint8Array,
): IRevokePermissionDecodedParams {
  const daoInterface = DAO__factory.createInterface();
  const hexBytes = bytesToHex(data, true);
  const receivedFunction = daoInterface.getFunction(
    hexBytes.substring(0, 10) as any,
  );
  const expectedFunction = daoInterface.getFunction("revoke");
  if (receivedFunction.name !== expectedFunction.name) {
    throw new Error("The received action is different from the expected one");
  }
  const result = daoInterface.decodeFunctionData("revoke", data);
  return permissionParamsFromContract(result);
}

function permissionParamsToContract(
  params: IGrantPermissionParams | IRevokePermissionParams,
): ContractPermissionParams {
  return [params.where, params.who, keccak256(toUtf8Bytes(params.permission))];
}
function permissionParamsFromContract(
  result: Result,
): IGrantPermissionDecodedParams | IRevokePermissionDecodedParams {
  return {
    where: result[0],
    who: result[1],
    permissionId: result[2],
    permission: Object.keys(PermissionIds)
      .find((k) => PermissionIds[k] === result[2])
      ?.replace(/_ID$/, "") || "",
  };
}

export function encodeWithdrawActionData(params: IWithdrawParams): Uint8Array {
  const daoInterface = DAO__factory.createInterface();
  const args = withdrawParamsToContract(params);
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
    throw new Error("The received action is different from the expected one");
  }
  const result = daoInterface.decodeFunctionData("withdraw", data);
  return withdrawParamsFromContract(result);
}

function withdrawParamsFromContract(result: Result): IWithdrawParams {
  return {
    tokenAddress: result[0],
    recipientAddress: result[1],
    amount: BigInt(result[2]),
    reference: result[3],
  };
}

function withdrawParamsToContract(
  params: IWithdrawParams,
): ContractWithdrawParams {
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
    throw new Error("The received action is different from the expected one");
  }
  const result = daoInterface.decodeFunctionData("setMetadata", data);
  const bytes = hexToBytes(result[0]);
  const cid = new TextDecoder().decode(bytes);
  const ipfsRegex =
    /^Qm([1-9A-HJ-NP-Za-km-z]{44,}|b[A-Za-z2-7]{58,}|B[A-Z2-7]{58,}|z[1-9A-HJ-NP-Za-km-z]{48,}|F[0-9A-F]{50,})$/;
  if (!ipfsRegex.test(cid)) {
    throw new Error("The metadata URL defined on the DAO is invalid");
  }
  return cid;
}
