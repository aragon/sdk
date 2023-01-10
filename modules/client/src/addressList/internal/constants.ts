import {
  AddresslistVoting__factory,
  MajorityVotingBase__factory
} from "@aragon/core-contracts-ethers";

// NOTE: This address needs to be set when the plugin has been published and the ID is known
export const ADDRESSLIST_PLUGIN_ID =
  "0x1234567890123456789012345678901234567890";

export const AVAILABLE_FUNCTION_SIGNATURES: string[] = [
  MajorityVotingBase__factory.createInterface().getFunction("updateVotingSettings")
    .format("minimal"),
  AddresslistVoting__factory.createInterface().getFunction("addAddresses")
    .format("minimal"),
  AddresslistVoting__factory.createInterface().getFunction(
    "removeAddresses",
  ).format("minimal"),
];
