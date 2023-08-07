import { Signer } from "@ethersproject/abstract-signer";
import { JsonRpcProvider, Network, Networkish } from "@ethersproject/providers";
import { Client as IpfsClient } from "@aragon/sdk-ipfs";
import { GraphQLClient } from "graphql-request";

export type NetworkDeployment = {
  daoFactory: string;
  pluginSetupProcessor: string;
  multisigRepo: string;
  adminRepo: string;
  addresslistVotingRepo: string;
  tokenVotingRepo: string;
  multisigSetup: string;
  adminSetup: string;
  addresslistVotingSetup: string;
  tokenVotingSetup: string;
  ensRegistry?: string;
};
// Context input parameters

export type Web3ContextParams = {
  /** Defaults to mainnet */
  network?: Networkish;
  /** Required for Ethereum transactions to work */
  signer?: Signer;
  /** Required for Ethereum connectivity to work */
  web3Providers?: string | JsonRpcProvider | (string | JsonRpcProvider)[];
  /** If any contract is not provided it will use the default from LIVE_CONTRACTS in the provided network */
  // TODO
  // when plugin split happens, remove this and put them on each specific context
  daoFactoryAddress?: string;
  pluginSetupProcessorAddress?: string;
  multisigRepoAddress?: string;
  adminRepoAddress?: string;
  addresslistVotingRepoAddress?: string;
  tokenVotingRepoAddress?: string;
  multisigSetupAddress?: string;
  adminSetupAddress?: string;
  addresslistVotingSetupAddress?: string;
  tokenVotingSetupAddress?: string;
  ensRegistryAddress?: string;
  /** If not provided uses default value */
  gasFeeEstimationFactor?: number;
};
export type IpfsContextParams = {
  /** If not provided uses default value */
  ipfsNodes?: { url: string; headers?: Record<string, string> }[];
};
export type GraphQLContextParams = {
  /** If not provided uses default value */
  graphqlNodes?: { url: string }[];
};

export type Web3ContextState = {
  network: Network;
  signer: Signer;
  // always going to exist because i'll default to LIVE_CONTRACTS
  daoFactoryAddress: string;
  pluginSetupProcessorAddress: string;
  multisigRepoAddress: string;
  adminRepoAddress: string;
  addresslistVotingRepoAddress: string;
  tokenVotingRepoAddress: string;
  multisigSetupAddress: string;
  adminSetupAddress: string;
  addresslistVotingSetupAddress: string;
  tokenVotingSetupAddress: string;
  // may exist depending on the network
  ensRegistryAddress?: string;
  web3Providers: JsonRpcProvider[];
  gasFeeEstimationFactor: number;
};
export type IpfsContextState = {
  ipfs: IpfsClient[];
};
export type GraphQLContextState = {
  graphql: GraphQLClient[];
};
