import { Signer } from "@ethersproject/abstract-signer";
import { JsonRpcProvider, Networkish } from "@ethersproject/providers";
// import {
//   create as ipfsCreate,
//   IPFSHTTPClient,
//   Options as IpfsOptions,
// } from "ipfs-http-client";
// import { GraphQLClient } from "graphql-request";

// Context input parameters
export interface Web3ContextParams {
  network: Networkish;
  signer: Signer;
  dao: string;
  daoFactoryAddress: string;
  web3Providers?: string | JsonRpcProvider | (string | JsonRpcProvider)[];
}
export interface VocdoniContextParams {
  // Vocdoni
}
export interface IpfsContextParams {
  // ipfs: IpfsOptions;
}
export interface GraphQLContextParams {
  // subgraphURL: string;
}

// Context state data

interface Web3ContextState {
  network: Networkish;
  signer?: Signer;
  dao: string;
  daoFactoryAddress: string;
  web3Providers: JsonRpcProvider[];
}
interface VocdoniContextState {}
interface IpfsContextState {
  // ipfs?: IPFSHTTPClient;
}
interface GraphQLContextState {
  // subgraph?: GraphQLClient;
}

export interface ContextState
  extends Web3ContextState,
    VocdoniContextState,
    IpfsContextState,
    GraphQLContextState {}
