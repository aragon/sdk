import {
  IMajorityVoting,
  MajorityVotingBase__factory,
} from "@aragon/core-contracts-ethers";
import {
  bytesToHex,
  decodeRatio,
  encodeRatio,
  hexToBytes,
  strip0x,
  UnexpectedActionError,
} from "@aragon/sdk-common";
import { VotingSettings } from "./interfaces/plugin";
import { FunctionFragment, Interface, Result } from "@ethersproject/abi";
import { BigNumber } from "@ethersproject/bignumber";
import { getVotingMode } from "./utils";

export function decodeUpdatePluginSettingsAction(
  data: Uint8Array,
): VotingSettings {
  const votingInterface = MajorityVotingBase__factory.createInterface();
  const hexBytes = bytesToHex(data, true);
  const receivedFunction = votingInterface.getFunction(
    hexBytes.substring(0, 10) as any,
  );
  const expectedfunction = votingInterface.getFunction("updateVotingSettings");
  if (receivedFunction.name !== expectedfunction.name) {
    throw new UnexpectedActionError();
  }
  const result = votingInterface.decodeFunctionData(
    "updateVotingSettings",
    data,
  );
  return pluginSettingsFromContract(result);
}

export function encodeUpdatePluginSettingsAction(
  params: VotingSettings,
): Uint8Array {
  const votingInterface = MajorityVotingBase__factory.createInterface();
  const args = votingSettingsToContract(params);
  // get hex bytes
  const hexBytes = votingInterface.encodeFunctionData(
    "updateVotingSettings",
    [args],
  );
  // Strip 0x => encode in Uint8Array
  return hexToBytes(strip0x(hexBytes));
}

function pluginSettingsFromContract(result: Result): VotingSettings {
  return {
    minProposerVotingPower: BigInt(result[0][0]),
    supportThreshold: decodeRatio(result[0][1], 2),
    minParticipation: decodeRatio(result[0][2], 2),
    minDuration: result[0][3].toNumber(),
  };
}

export function votingSettingsToContract(
  params: VotingSettings,
): IMajorityVoting.VotingSettingsStruct {
  return {
    votingMode: BigNumber.from(getVotingMode(params)),
    supportThreshold: BigNumber.from(encodeRatio(params.supportThreshold, 2)),
    minParticipation: BigNumber.from(encodeRatio(params.minParticipation, 2)),
    minDuration: BigNumber.from(params.minDuration),
    minProposerVotingPower: BigNumber.from(params.minProposerVotingPower || 1),
  };
}

export function getFunctionFragment(
  data: Uint8Array,
  availableFunctions: string[],
): FunctionFragment {
  const hexBytes = bytesToHex(data, true);
  const inter = new Interface(availableFunctions);
  return inter.getFunction(hexBytes.substring(0, 10));
}
