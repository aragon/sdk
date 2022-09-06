import {
  DAO__factory,
  MajorityVoting__factory,
} from "@aragon/core-contracts-ethers";

export const AVAILABLE_PLUGIN_FUNCTION_SIGNATURES: string[] = [
  MajorityVoting__factory.createInterface().getFunction("changeVoteConfig")
    .format("minimal"),
];
export const AVAILABLE_CLIENT_FUNCTION_SIGNATURES: string[] = [
  DAO__factory.createInterface().getFunction("withdraw").format("minimal"),
  DAO__factory.createInterface().getFunction("setMetadata").format("minimal"),
];
