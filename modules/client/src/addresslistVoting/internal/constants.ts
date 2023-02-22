import {
  AddresslistVoting__factory,
  MajorityVotingBase__factory
} from "@aragon/core-contracts-ethers";

// NOTE: This address needs to be set when the plugin has been published and the ID is known
// TODO: Find a way around this
// This shouldnt be hardcoded, but the active contracts need the current network
// thes means we cannot have it here if we move it to the function where this is used we 
// still dont have access to the network because is a static function and the context is 
// not defined. Maybe defining the ens here instead of the address?
export const ADDRESSLIST_PLUGIN_ID =
  "0x583E48C1d7dBd9a65b7866A5fF6956339458d001";

export const AVAILABLE_FUNCTION_SIGNATURES: string[] = [
  MajorityVotingBase__factory.createInterface().getFunction("updateVotingSettings")
    .format("minimal"),
  AddresslistVoting__factory.createInterface().getFunction("addAddresses")
    .format("minimal"),
  AddresslistVoting__factory.createInterface().getFunction(
    "removeAddresses",
  ).format("minimal"),
];
