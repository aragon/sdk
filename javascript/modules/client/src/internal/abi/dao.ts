import {
  ContractInterface,
  ContractTransaction,
} from "@ethersproject/contracts";

export const exampleContractAbi: ContractInterface = [
  {
    inputs: [],
    name: "retrieve",
    outputs: [
      {
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "_data",
        type: "bytes",
      },
    ],
    name: "store",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export type ExampleContractMethods = {
  retrieve: () => Promise<string>;
  store: (hexData: string) => Promise<ContractTransaction>;
};
