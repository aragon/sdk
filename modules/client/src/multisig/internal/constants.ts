// @ts-ignore
// todo fix new contracts-ethers
import { Multisig__factory } from "@aragon/osx-ethers";
import { MetadataAbiInput } from "@aragon/sdk-client-common";

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

// TODO:
// use abi from plugin metadata
export const UPDATE_ABI: { [build: number]: MetadataAbiInput[] } = {
  1: [],
};

// TODO:
// use abi from plugin metadata
export const INSTALLATION_ABI: MetadataAbiInput[] = [
  {
    internalType: "address[]",
    name: "members",
    type: "address[]",
    description: "The addresses of the initial members to be added.",
  },
  {
    components: [
      {
        internalType: "bool",
        name: "onlyListed",
        type: "bool",
        description:
          "Whether only listed addresses can create a proposal or not.",
      },
      {
        internalType: "uint16",
        name: "minApprovals",
        type: "uint16",
        description:
          "The minimal number of approvals required for a proposal to pass.",
      },
    ],
    internalType: "struct Multisig.MultisigSettings",
    name: "multisigSettings",
    type: "tuple",
    description: "The inital multisig settings.",
  },
];
