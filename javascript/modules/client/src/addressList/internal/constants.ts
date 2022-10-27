import {
  MajorityVoting__factory,
  WhitelistVoting__factory,
} from "@aragon/core-contracts-ethers";

// NOTE: This address needs to be set when the plugin has been published and the ID is known
export const ADDRESSLIST_PLUGIN_ID =
  "0x1234567890123456789012345678901234567890";

export const AVAILABLE_FUNCTION_SIGNATURES: string[] = [
  MajorityVoting__factory.createInterface().getFunction("changeVoteConfig")
    .format("minimal"),
  WhitelistVoting__factory.createInterface().getFunction("addWhitelistedUsers")
    .format("minimal"),
  WhitelistVoting__factory.createInterface().getFunction(
    "removeWhitelistedUsers",
  ).format("minimal"),
];
