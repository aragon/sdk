import {
  IMajorityVoting,
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
import { etherToUnitInterval, votingModeToContracts } from "./utils";
import { parseEther } from "@ethersproject/units";

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
    minProposerVotingPower: BigInt(result[0][0]),
    supportThreshold: etherToUnitInterval(result[0][1]),
    minParticipation: etherToUnitInterval(result[0][2]),
    minDuration: result[0][3].toNumber(),
  };
}

export function votingSettingsToContract(
  params: VotingSettings,
): IMajorityVoting.VotingSettingsStruct {
  return {
    votingMode: BigNumber.from(
      votingModeToContracts(params.votingMode || VotingMode.STANDARD),
    ),
    supportThreshold: parseEther(params.supportThreshold.toString()),
    minParticipation: parseEther(params.minParticipation.toString()),
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
