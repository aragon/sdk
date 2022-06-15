// This file defines the interfaces of the context object holding client settings

import { Signer } from "@ethersproject/abstract-signer";
import { JsonRpcProvider, Networkish } from "@ethersproject/providers";
// NOTE: Backing off ipfs-http-client until the UI framework supports it
// import { Options, IPFSHTTPClient } from "ipfs-http-client";
// import { GraphQLClient } from "graphql-request";

// Context input parameters

interface Web3ContextParams {
  network: Networkish;
  signer: Signer;
  dao: string;
  daoFactoryAddress?: string;
  web3Providers?: string | JsonRpcProvider | (string | JsonRpcProvider)[];
  gasFeeEstimationFactor?: number;
}
interface IpfsContextParams {
  // NOTE: Backing off ipfs-http-client until the UI framework supports it
  // ipfsNodes?: Options[];
}
interface GraphQLContextParams {
  // subgraphURL: string;
}

export interface ContextParams
  extends Web3ContextParams, IpfsContextParams, GraphQLContextParams {}

// Context state data

interface Web3ContextState {
  network: Networkish;
  signer?: Signer;
  dao: string;
  daoFactoryAddress?: string;
  web3Providers: JsonRpcProvider[];
  gasFeeEstimationFactor: number;
}
interface IpfsContextState {
  // NOTE: Backing off ipfs-http-client until the UI framework supports it
  // ipfs?: IPFSHTTPClient[];
}
interface GraphQLContextState {
  // subgraph?: GraphQLClient;
}

export interface ContextState
  extends Web3ContextState, IpfsContextState, GraphQLContextState {}
