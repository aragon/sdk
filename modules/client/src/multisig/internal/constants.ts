// @ts-ignore
// todo fix new contracts-ethers
import { MultisigVoting__factory } from "@aragon/core-contracts-ethers";

// TODO: This address needs to be set when the plugin has
// been published and the ID is known
export const MULTISIG_PLUGIN_ID = "0x1234567890123456789012345678901234567890";

// TODO update with function names
export const AVAILABLE_FUNCTION_SIGNATURES: string[] = [
  MultisigVoting__factory.createInterface().getFunction("addAllowedUsers")
    .format("minimal"),
  MultisigVoting__factory.createInterface().getFunction(
    "removeAllowedUsers",
  ).format("minimal"),
];
