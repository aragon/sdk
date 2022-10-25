import { MajorityVoting__factory } from "@aragon/core-contracts-ethers";
import {
  bytesToHex,
  decodeRatio,
  encodeRatio,
  hexToBytes,
  strip0x,
  UnexpectedActionError,
} from "@aragon/sdk-common";
import { ContractPluginSettings, IPluginSettings } from "./interfaces";
import { FunctionFragment, Interface, Result } from "@ethersproject/abi";
import { AVAILABLE_PLUGIN_FUNCTION_SIGNATURES } from "./constants";
import { BigNumber } from "@ethersproject/bignumber";

export function decodeUpdatePluginSettingsAction(
  data: Uint8Array,
): IPluginSettings {
  const votingInterface = MajorityVoting__factory.createInterface();
  const hexBytes = bytesToHex(data, true);
  const receivedFunction = votingInterface.getFunction(
    hexBytes.substring(0, 10) as any,
  );
  const expectedfunction = votingInterface.getFunction("changeVoteConfig");
  if (receivedFunction.name !== expectedfunction.name) {
    throw new UnexpectedActionError();
  }
  const result = votingInterface.decodeFunctionData("changeVoteConfig", data);
  return pluginSettingsFromContract(result);
}

export function encodeUpdatePluginSettingsAction(
  params: IPluginSettings,
): Uint8Array {
  const votingInterface = MajorityVoting__factory.createInterface();
  const args = pluginSettingsToContract(params);
  // get hex bytes
  const hexBytes = votingInterface.encodeFunctionData("changeVoteConfig", args);
  // Strip 0x => encode in Uint8Array
  return hexToBytes(strip0x(hexBytes));
}

function pluginSettingsFromContract(result: Result): IPluginSettings {
  return {
    minTurnout: decodeRatio(result[0], 2),
    minSupport: decodeRatio(result[0], 2),
    minDuration: result[2].toNumber(),
  };
}

function pluginSettingsToContract(
  params: IPluginSettings,
): ContractPluginSettings {
  return [
    BigNumber.from(encodeRatio(params.minTurnout, 2)),
    BigNumber.from(encodeRatio(params.minSupport, 2)),
    BigNumber.from(params.minDuration),
  ];
}

export function getFunctionFragment(data: Uint8Array): FunctionFragment {
  const hexBytes = bytesToHex(data, true);
  const inter = new Interface(AVAILABLE_PLUGIN_FUNCTION_SIGNATURES);
  return inter.getFunction(hexBytes.substring(0, 10));
}
