// @ts-ignore
// todo fix new contracts-ethers
import { activeContractsList, Multisig__factory } from "@aragon/core-contracts-ethers";

// TODO: This address needs to be set when the plugin has
// been published and the ID is known
export const MULTISIG_PLUGIN_ID = "0x39e04b9728db34650110f99161AE6d2521D7Cf67";

// TODO update with function names
export const AVAILABLE_FUNCTION_SIGNATURES: string[] = [
  Multisig__factory.createInterface().getFunction("addAddresses")
    .format("minimal"),
  Multisig__factory.createInterface().getFunction(
    "removeAddresses",
  ).format("minimal"),
  Multisig__factory.createInterface().getFunction(
    "updateMultisigSettings",
  ).format("minimal"),
];
