import {
  IERC20MintableUpgradeable__factory,
  MajorityVoting__factory,
  WhitelistVoting__factory,
} from "@aragon/core-contracts-ethers";

export const AVAILABLE_PLUGIN_FUNCTION_SIGNATURES: string[] = [
  MajorityVoting__factory.createInterface().getFunction("changeVoteConfig")
    .format("minimal"),
  IERC20MintableUpgradeable__factory.createInterface().getFunction("mint")
    .format("minimal"),
  WhitelistVoting__factory.createInterface().getFunction("addWhitelistedUsers")
    .format("minimal"),
  WhitelistVoting__factory.createInterface().getFunction(
    "removeWhitelistedUsers",
  ).format("minimal"),
];
