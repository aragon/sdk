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
