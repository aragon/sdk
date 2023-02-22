import {
  IERC20MintableUpgradeable__factory,
  MajorityVotingBase__factory,
} from "@aragon/core-contracts-ethers";

// TODO: This address needs to be set when the plugin has been published and the ID is known
// TODO: Find a way around this
// This shouldnt be hardcoded, but the active contracts need the current network
// thes means we cannot have it here if we move it to the function where this is used we 
// still dont have access to the network because is a static function and the context is 
// not defined. Maybe defining the ens here instead of the address?
export const TOKEN_VOTING_PLUGIN_ID = "0x2b5D9CCb5c9676680aac70a19f22c4F46af5b1F5";
export const AVAILABLE_FUNCTION_SIGNATURES: string[] = [
  MajorityVotingBase__factory.createInterface().getFunction("updateVotingSettings")
    .format("minimal"),
  IERC20MintableUpgradeable__factory.createInterface().getFunction("mint")
    .format("minimal"),
];
