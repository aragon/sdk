import { ContractInterface } from "@ethersproject/contracts";

export const erc20ContractAbi: ContractInterface = [
  {
    name: "Transfer",
    inputs: [
      { type: "address", name: "sender", indexed: true },
      { type: "address", name: "receiver", indexed: true },
      { type: "uint256", name: "value", indexed: false },
    ],
    anonymous: false,
    type: "event",
  },
  {
    name: "Approval",
    inputs: [
      { type: "address", name: "owner", indexed: true },
      { type: "address", name: "spender", indexed: true },
      { type: "uint256", name: "value", indexed: false },
    ],
    anonymous: false,
    type: "event",
  },
  {
    name: "transfer",
    outputs: [{ type: "bool", name: "" }],
    inputs: [
      { type: "address", name: "_to" },
      { type: "uint256", name: "_value" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    name: "approve",
    outputs: [{ type: "bool", name: "" }],
    inputs: [
      { type: "address", name: "_spender" },
      { type: "uint256", name: "_value" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    name: "symbol",
    outputs: [{ type: "string", name: "" }],
    inputs: [],
    stateMutability: "view",
    type: "function",
  },
  {
    name: "decimals",
    outputs: [{ type: "uint256", name: "" }],
    inputs: [],
    stateMutability: "view",
    type: "function",
  },
  {
    name: "balanceOf",
    outputs: [{ type: "uint256", name: "" }],
    inputs: [{ type: "address", name: "arg0" }],
    stateMutability: "view",
    type: "function",
  },
  {
    name: "allowance",
    outputs: [{ type: "uint256", name: "" }],
    inputs: [
      { type: "address", name: "arg0" },
      { type: "address", name: "arg1" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    name: "totalSupply",
    outputs: [{ type: "uint256", name: "" }],
    inputs: [],
    stateMutability: "view",
    type: "function",
  },
];
