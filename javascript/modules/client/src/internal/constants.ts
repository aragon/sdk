import { DAO__factory } from "@aragon/core-contracts-ethers";

export const AVAILABLE_CLIENT_FUNCTION_SIGNATURES: string[] = [
  DAO__factory.createInterface().getFunction("withdraw").format("minimal"),
  DAO__factory.createInterface().getFunction("setMetadata").format("minimal"),
  DAO__factory.createInterface().getFunction("revoke").format("minimal"),
  DAO__factory.createInterface().getFunction("grant").format("minimal"),
  DAO__factory.createInterface().getFunction("freeze").format("minimal"),
];
