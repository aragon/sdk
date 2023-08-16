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

export type AvailableAddresses =
  | "daoFactoryAddress"
  | "pluginSetupProcessorAddress"
  | "multisigRepoAddress"
  | "adminRepoAddress"
  | "addresslistVotingRepoAddress"
  | "tokenVotingRepoAddress"
  | "multisigSetupAddress"
  | "adminSetupAddress"
  | "addresslistVotingSetupAddress"
  | "tokenVotingSetupAddress"
  | "ensRegistryAddress";
// Context input parameters

export type Web3ContextParams =
  /** If any contract is not provided it will use the default from LIVE_CONTRACTS in the provided network */
  & {
    [address in AvailableAddresses]?: string;
  }
  & {
    /** Defaults to mainnet */
    network?: Networkish;
    /** Required for Ethereum transactions to work */
    signer?: Signer;
    /** Required for Ethereum connectivity to work */
    web3Providers?: string | JsonRpcProvider | (string | JsonRpcProvider)[];
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

export type Web3ContextState =
  & {
    [address in AvailableAddresses]: string;
  }
  & {
    network: Network;
    signer: Signer;
    web3Providers: JsonRpcProvider[];
    gasFeeEstimationFactor: number;
  };
export type IpfsContextState = {
  ipfs: IpfsClient[];
};
export type GraphQLContextState = {
  graphql: GraphQLClient[];
};
