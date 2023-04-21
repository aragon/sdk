// This file defines the interfaces of the context object holding client settings

import { Signer } from "@ethersproject/abstract-signer";
import { JsonRpcProvider, Network, Networkish } from "@ethersproject/providers";
import { Client as IpfsClient } from "@aragon/sdk-ipfs";
import { GraphQLClient } from "graphql-request";

// Context input parameters

type Web3ContextParams = {
  // Network should be provided
  network?: Networkish;
  // Signer should be provided
  signer: Signer;
  // At least one provider should be  given
  web3Providers: string | JsonRpcProvider | (string | JsonRpcProvider)[];
  // If not provided uses default from LIVE_CONTRACTS in the provided network
  daoFactoryAddress?: string;
  // If not provided uses default from LIVE_CONTRACTS in the provided network
  ensRegistryAddress?: string;
  // If not provided usee default value
  gasFeeEstimationFactor?: number;
};
type IpfsContextParams = {
  ipfsNodes?: { url: string; headers?: Record<string, string> }[];
};
type GraphQLContextParams = {
  graphqlNodes?: { url: string }[];
};

export type ContextParams = Web3ContextParams &
  IpfsContextParams &
  GraphQLContextParams;

// Context state data

type Web3ContextState = {
  network: Network;
  signer: Signer;
  // always going to exist because i'll default to LIVE_CONTRACTS
  daoFactoryAddress: string;
  // may exist depending on the network
  ensRegistryAddress?: string;
  web3Providers: JsonRpcProvider[];
  gasFeeEstimationFactor: number;
};
type IpfsContextState = {
  ipfs: IpfsClient[];
};
type GraphQLContextState = {
  graphql: GraphQLClient[];
};

export type ContextState = Web3ContextState &
  IpfsContextState &
  GraphQLContextState;

export type ContextPluginState = {};
export type ContextPluginParams = ContextParams;
