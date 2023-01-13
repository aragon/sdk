import {
  AddresslistVoting__factory,
  MajorityVotingBase__factory
} from "@aragon/core-contracts-ethers";

// NOTE: This address needs to be set when the plugin has been published and the ID is known
export const ADDRESSLIST_PLUGIN_ID =
  "0x8aa3acd377008d72ad79f27ec19d54f9291f68c0";

export const AVAILABLE_FUNCTION_SIGNATURES: string[] = [
  MajorityVotingBase__factory.createInterface().getFunction("updateVotingSettings")
    .format("minimal"),
  AddresslistVoting__factory.createInterface().getFunction("addAddresses")
    .format("minimal"),
  AddresslistVoting__factory.createInterface().getFunction(
    "removeAddresses",
  ).format("minimal"),
];
