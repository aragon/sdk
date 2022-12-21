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
import {
  VotingMode,
  VotingSettings,
} from "./interfaces/plugin";
import { FunctionFragment, Interface, Result } from "@ethersproject/abi";
import { BigNumber } from "@ethersproject/bignumber";

export function decodeUpdateVotingSettingsAction(
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
  const result = votingInterface.decodeFunctionData("updateVotingSettings", data);
  return votingSettingsFromContract(result);
}

export function encodeUpdateVotingSettingsAction(
  params: VotingSettings,
): Uint8Array {
  const votingInterface = MajorityVotingBase__factory.createInterface();
  const args = votingSettingsToContract(params);
  // get hex bytes
  const hexBytes = votingInterface.encodeFunctionData("updateVotingSettings", [
    args,
  ]);
  // Strip 0x => encode in Uint8Array
  return hexToBytes(strip0x(hexBytes));
}

function votingSettingsFromContract(result: Result): VotingSettings {
  return {
    minParticipation: decodeRatio(result[0], 2),
    supportThreshold: decodeRatio(result[0], 2),
    minDuration: result[2].toNumber(),
  };
}

function votingSettingsToContract(
  params: VotingSettings,
): IMajorityVoting.VotingSettingsStruct {
  return {
    votingMode: params.votingMode || VotingMode.STANDARD,
    supportThreshold: BigNumber.from(encodeRatio(params.supportThreshold, 2)),
    minParticipation: BigNumber.from(encodeRatio(params.minParticipation, 2)),
    minDuration: BigNumber.from(params.minDuration),
    minProposerVotingPower: params.minProposerVotingPower || BigInt(1),
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
