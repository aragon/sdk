import {
  MajorityVotingBase,
  MajorityVotingBase__factory,
} from "@aragon/core-contracts-ethers";
import {
  bytesToHex,
  hexToBytes,
  strip0x,
  UnexpectedActionError,
} from "@aragon/sdk-common";
import { VotingMode, VotingSettings } from "./interfaces/plugin";
import { FunctionFragment, Interface, Result } from "@ethersproject/abi";
import { BigNumber } from "@ethersproject/bignumber";
import {
  votingModeFromContracts,
  votingModeToContracts,
} from "./utils";
import { encodeRatio } from "@aragon/sdk-common";
import { decodeRatio } from "@aragon/sdk-common";

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

export function encodeUpdateVotingSettingsAction(
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
    votingMode: votingModeFromContracts(result[0][0]),
    supportThreshold: decodeRatio(result[0][1], 6),
    minParticipation: decodeRatio(result[0][2], 6),
    minDuration: result[0][3].toNumber(),
    minProposerVotingPower: BigInt(result[0][4]),
  };
}

export function votingSettingsToContract(
  params: VotingSettings,
): MajorityVotingBase.VotingSettingsStruct {
  return {
    votingMode: BigNumber.from(
      votingModeToContracts(params.votingMode || VotingMode.STANDARD),
    ),
    supportThreshold: encodeRatio(params.supportThreshold, 6),
    minParticipation: encodeRatio(params.minParticipation, 6),
    minDuration: BigNumber.from(params.minDuration),
    minProposerVotingPower: BigNumber.from(params.minProposerVotingPower || 0),
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
