import { DAO__factory } from "@aragon/core-contracts-ethers";
import { strip0x, hexToBytes } from "@aragon/sdk-common";
import { BigNumber } from "@ethersproject/bignumber";
import { AddressZero } from "@ethersproject/constants";
import { IWithdrawParams } from "../interfaces/plugins";

export function encodeWithdrawActionData(params: IWithdrawParams): Uint8Array {
  const daoInterface = DAO__factory.createInterface();
  const args = unwrapWithdrawParams(params);
  // get hex bytes
  const hexBytes = daoInterface.encodeFunctionData("withdraw", args);
  // Strip 0x => cast to ASCII => encode in Uint8Array
  return hexToBytes((strip0x(hexBytes)));
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