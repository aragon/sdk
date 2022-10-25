import {
  ERC20Voting__factory,
  IERC20MintableUpgradeable__factory,
} from "@aragon/core-contracts-ethers";
import {
  bytesToHex,
  encodeRatio,
  hexToBytes,
  strip0x,
  UnexpectedActionError,
} from "@aragon/sdk-common";
import { BigNumber } from "@ethersproject/bignumber";
import { AddressZero } from "@ethersproject/constants";

import { Result } from "@ethersproject/abi";
import { ContractErc20InitParams, ContractMintTokenParams, IErc20PluginInstall, IMintTokenParams } from "./interfaces/client";



export function encodeErc20ActionInit(params: IErc20PluginInstall): Uint8Array {
  const erc20votingInterface = ERC20Voting__factory.createInterface();
  const args = erc20InitParamsToContract(params);
  // get hex bytes
  const hexBytes = erc20votingInterface.encodeFunctionData("initialize", args);
  // Strip 0x => encode in Uint8Array
  return hexToBytes(strip0x(hexBytes));
}

function erc20InitParamsToContract(
  params: IErc20PluginInstall,
): ContractErc20InitParams {
  // TODO
  // the SC specifies a token field but there is not format on thhis field
  // or how data should be passed to this in case it is using an existing
  // token or miniting a new one

  let token = "";
  if (params.newToken) {
    token = params.newToken.name;
  } else if (params.useToken) {
    token = params.useToken.address;
  }
  return [
    AddressZero,
    AddressZero,
    BigNumber.from(encodeRatio(params.settings.minTurnout, 2)),
    BigNumber.from(encodeRatio(params.settings.minSupport, 2)),
    BigNumber.from(params.settings.minDuration),
    token,
  ];
}

// MINT ACTION
export function encodeMintTokenAction(params: IMintTokenParams): Uint8Array {
  const votingInterface = IERC20MintableUpgradeable__factory.createInterface();
  const args = mintTokenParamsToContract(params);
  // get hex bytes
  const hexBytes = votingInterface.encodeFunctionData("mint", args);
  return hexToBytes(strip0x(hexBytes));
}
function mintTokenParamsToContract(
  params: IMintTokenParams,
): ContractMintTokenParams {
  return [params.address, BigNumber.from(params.amount)];
}
export function decodeMintTokenAction(data: Uint8Array): IMintTokenParams {
  const votingInterface = IERC20MintableUpgradeable__factory.createInterface();
  const hexBytes = bytesToHex(data, true);
  const receivedFunction = votingInterface.getFunction(
    hexBytes.substring(0, 10) as any,
  );
  const expectedfunction = votingInterface.getFunction("mint");
  if (receivedFunction.name !== expectedfunction.name) {
    throw new UnexpectedActionError();
  }
  const result = votingInterface.decodeFunctionData("mint", data);
  return mintTokenParamsFromContract(result);
}

function mintTokenParamsFromContract(result: Result): IMintTokenParams {
  return {
    address: result[0],
    amount: BigInt(result[1]),
  };
}

