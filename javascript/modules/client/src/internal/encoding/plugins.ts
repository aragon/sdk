import {
  ERC20Voting__factory,
  IERC20MintableUpgradeable__factory,
  MajorityVoting__factory,
  WhitelistVoting__factory,
} from "@aragon/core-contracts-ethers";
import {
  bytesToHex,
  decodeRatio,
  encodeRatio,
  hexToBytes,
  strip0x,
  UnexpectedActionError,
} from "@aragon/sdk-common";
import { BigNumber } from "@ethersproject/bignumber";
import { AddressZero } from "@ethersproject/constants";
import {
  ContractAddressListInitParams,
  ContractErc20InitParams,
  ContractMintTokenParams,
  ContractPluginSettings,
  IAddressListPluginInstall,
  IErc20PluginInstall,
  IMintTokenParams,
  IPluginSettings,
} from "../interfaces/plugins";

import { FunctionFragment, Interface, Result } from "@ethersproject/abi";
import { AVAILABLE_PLUGIN_FUNCTION_SIGNATURES } from "../constants/encoding";

export function getFunctionFragment(data: Uint8Array): FunctionFragment {
  const hexBytes = bytesToHex(data, true);
  const inter = new Interface(AVAILABLE_PLUGIN_FUNCTION_SIGNATURES);
  return inter.getFunction(hexBytes.substring(0, 10));
}

export function encodeAddressListActionInit(
  params: IAddressListPluginInstall
): Uint8Array {
  const addressListVotingInterface = WhitelistVoting__factory.createInterface();
  const args = addressListInitParamsToContract(params);
  // get hex bytes
  const hexBytes = addressListVotingInterface.encodeFunctionData(
    "initialize",
    args
  );
  // Strip 0x => encode in Uint8Array
  return hexToBytes(strip0x(hexBytes));
}

function addressListInitParamsToContract(
  params: IAddressListPluginInstall
): ContractAddressListInitParams {
  // TODO
  // not sure if the IDao and gsn params will be needed after
  // this is converted into a plugin
  return [
    AddressZero,
    AddressZero,
    BigNumber.from(encodeRatio(params.settings.minTurnout, 2)),
    BigNumber.from(encodeRatio(params.settings.minSupport, 2)),
    BigNumber.from(params.settings.minDuration),
    params.addresses,
  ];
}

export function encodeErc20ActionInit(params: IErc20PluginInstall): Uint8Array {
  const erc20votingInterface = ERC20Voting__factory.createInterface();
  const args = erc20InitParamsToContract(params);
  // get hex bytes
  const hexBytes = erc20votingInterface.encodeFunctionData("initialize", args);
  // Strip 0x => encode in Uint8Array
  return hexToBytes(strip0x(hexBytes));
}

function erc20InitParamsToContract(
  params: IErc20PluginInstall
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

export function encodeUpdatePluginSettingsAction(
  params: IPluginSettings
): Uint8Array {
  const votingInterface = MajorityVoting__factory.createInterface();
  const args = pluginSettingsToContract(params);
  // get hex bytes
  const hexBytes = votingInterface.encodeFunctionData("changeVoteConfig", args);
  // Strip 0x => encode in Uint8Array
  return hexToBytes(strip0x(hexBytes));
}

function pluginSettingsToContract(
  params: IPluginSettings
): ContractPluginSettings {
  return [
    BigNumber.from(encodeRatio(params.minTurnout, 2)),
    BigNumber.from(encodeRatio(params.minSupport, 2)),
    BigNumber.from(params.minDuration),
  ];
}

export function decodeUpdatePluginSettingsAction(
  data: Uint8Array
): IPluginSettings {
  const votingInterface = MajorityVoting__factory.createInterface();
  const hexBytes = bytesToHex(data, true);
  const receivedFunction = votingInterface.getFunction(
    hexBytes.substring(0, 10) as any
  );
  const expectedfunction = votingInterface.getFunction("changeVoteConfig");
  if (receivedFunction.name !== expectedfunction.name) {
    throw new UnexpectedActionError();
  }
  const result = votingInterface.decodeFunctionData("changeVoteConfig", data);
  return pluginSettingsFromContract(result);
}

function pluginSettingsFromContract(result: Result): IPluginSettings {
  return {
    minTurnout: decodeRatio(result[0], 2),
    minSupport: decodeRatio(result[0], 2),
    minDuration: result[2].toNumber(),
  };
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
  params: IMintTokenParams
): ContractMintTokenParams {
  return [params.address, BigNumber.from(params.amount)];
}
export function decodeMintTokenAction(data: Uint8Array): IMintTokenParams {
  const votingInterface = IERC20MintableUpgradeable__factory.createInterface();
  const hexBytes = bytesToHex(data, true);
  const receivedFunction = votingInterface.getFunction(
    hexBytes.substring(0, 10) as any
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

// ADD MEMBERS ACTION
export function encodeAddMembersAction(members: string[]): Uint8Array {
  const votingInterface = WhitelistVoting__factory.createInterface();
  // get hex bytes
  const hexBytes = votingInterface.encodeFunctionData(
    // TODO: Rename to `addAddresses` as soon as the plugin is updated
    "addWhitelistedUsers",
    [members]
  );
  return hexToBytes(strip0x(hexBytes));
}

export function decodeAddMemebersAction(data: Uint8Array): string[] {
  const votingInterface = WhitelistVoting__factory.createInterface();
  const hexBytes = bytesToHex(data, true);
  const receivedFunction = votingInterface.getFunction(
    hexBytes.substring(0, 10) as any
  );
  // TODO: Rename to `addAddresses` as soon as the plugin is updated
  const expectedfunction = votingInterface.getFunction("addWhitelistedUsers");
  if (receivedFunction.name !== expectedfunction.name) {
    throw new UnexpectedActionError();
  }
  const result = votingInterface.decodeFunctionData(
    // TODO: Rename to `addAddresses` as soon as the plugin is updated
    "addWhitelistedUsers",
    data
  );
  return result[0];
}
// REMOVE MEMBERS ACTION
export function encodeRemoveMembersAction(members: string[]): Uint8Array {
  const votingInterface = WhitelistVoting__factory.createInterface();
  // get hex bytes
  const hexBytes = votingInterface.encodeFunctionData(
    // TODO: Rename to `removeAddresses` as soon as the plugin is updated
    "removeWhitelistedUsers",
    [members]
  );
  return hexToBytes(strip0x(hexBytes));
}
export function decodeRemoveMemebersAction(data: Uint8Array): string[] {
  const votingInterface = WhitelistVoting__factory.createInterface();
  const hexBytes = bytesToHex(data, true);
  const receivedFunction = votingInterface.getFunction(
    hexBytes.substring(0, 10) as any
  );
  const expectedfunction = votingInterface.getFunction(
    // TODO: Rename to `removeAddresses` as soon as the plugin is updated
    "removeWhitelistedUsers"
  );
  if (receivedFunction.name !== expectedfunction.name) {
    throw new UnexpectedActionError();
  }
  const result = votingInterface.decodeFunctionData(
    // TODO: Rename to `removeAddresses` as soon as the plugin is updated
    "removeWhitelistedUsers",
    data
  );
  return result[0];
}
