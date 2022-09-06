import { DAO__factory, MajorityVoting__factory } from "@aragon/core-contracts-ethers";

export const AVAILABLE_FUNCTION_SIGNATURES: string[] = [
  MajorityVoting__factory.createInterface().getFunction('changeVoteConfig').format('minimal'),
  DAO__factory.createInterface().getFunction('withdraw').format('minimal'),
  DAO__factory.createInterface().getFunction('setMetadata').format('minimal'),
];
