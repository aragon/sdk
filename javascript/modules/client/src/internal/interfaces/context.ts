// This file defines the interfaces of the context object holding client settings

import { Signer } from "@ethersproject/abstract-signer";
import { JsonRpcProvider, Networkish } from "@ethersproject/providers";
// NOTE: Backing off ipfs-http-client until the UI framework supports it
// import { Options, IPFSHTTPClient } from "ipfs-http-client";
// import { GraphQLClient } from "graphql-request";

// Context input parameters

type Web3ContextParams = {
  network: Networkish;
  signer: Signer;
  dao: string;
  daoFactoryAddress?: string;
  web3Providers?: string | JsonRpcProvider | (string | JsonRpcProvider)[];
  gasFeeEstimationFactor?: number;
};
type IpfsContextParams = {
  // NOTE: Backing off ipfs-http-client until the UI framework supports it
  // ipfsNodes?: Options[];
};
type GraphQLContextParams = {
  // subgraphURL: string;
};

export type ContextParams =
  & Web3ContextParams
  & IpfsContextParams
  & GraphQLContextParams;

// Context state data

type Web3ContextState = {
  network: Networkish;
  signer?: Signer;
  dao: string;
  daoFactoryAddress?: string;
  web3Providers: JsonRpcProvider[];
  gasFeeEstimationFactor: number;
};
type IpfsContextState = {
  // NOTE: Backing off ipfs-http-client until the UI framework supports it
  // ipfs?: IPFSHTTPClient[];
};
type GraphQLContextState = {
  // subgraph?: GraphQLClient;
};

export type ContextState =
  & Web3ContextState
  & IpfsContextState
  & GraphQLContextState;
