import {
  IERC20MintableUpgradeable__factory,
  MajorityVotingBase__factory,
} from "@aragon/osx-ethers";
export const AVAILABLE_FUNCTION_SIGNATURES: string[] = [
  MajorityVotingBase__factory.createInterface().getFunction(
    "updateVotingSettings",
  )
    .format("minimal"),
  IERC20MintableUpgradeable__factory.createInterface().getFunction("mint")
    .format("minimal"),
];

export const INSTALLATION_ABI: string[] = [
  "tuple(uint8, uint64, uint64, uint64, uint256)",
  "tuple(address, string, string)",
  "tuple(address[], uint256[])",
];
