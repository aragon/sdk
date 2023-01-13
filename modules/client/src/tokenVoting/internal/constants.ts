import {
  IERC20MintableUpgradeable__factory,
  MajorityVotingBase__factory,
} from "@aragon/core-contracts-ethers";

// TODO: This address needs to be set when the plugin has been published and the ID is known
export const TOKEN_VOTING_PLUGIN_ID = "0x2cfeae0b043f989c956d0c2baac1074135a480e7";
export const AVAILABLE_FUNCTION_SIGNATURES: string[] = [
  MajorityVotingBase__factory.createInterface().getFunction("updateVotingSettings")
    .format("minimal"),
  IERC20MintableUpgradeable__factory.createInterface().getFunction("mint")
    .format("minimal"),
];
