// @ts-ignore
// todo fix new contracts-ethers
import { Multisig__factory } from "@aragon/osx-ethers";

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
