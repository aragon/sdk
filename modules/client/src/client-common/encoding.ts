import {
  MajorityVotingBase,
  MajorityVotingBase__factory,
} from "@aragon/osx-ethers";
import {
  bytesToHex,
  decodeRatio,
  encodeRatio,
  hexToBytes,
} from "@aragon/sdk-common";
import { VotingMode, VotingSettings } from "./types/plugin";
import { Result } from "@ethersproject/abi";
import { BigNumber } from "@ethersproject/bignumber";
import { votingModeFromContracts, votingModeToContracts } from "./utils";

export function decodeUpdatePluginSettingsAction(
  data: Uint8Array,
): VotingSettings {
  const votingInterface = MajorityVotingBase__factory.createInterface();
  const hexBytes = bytesToHex(data);
  const expectedfunction = votingInterface.getFunction("updateVotingSettings");
  const result = votingInterface.decodeFunctionData(
    expectedfunction,
    hexBytes,
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
  return hexToBytes(hexBytes);
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
