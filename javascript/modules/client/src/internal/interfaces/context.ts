import { Signer } from "@ethersproject/abstract-signer";
import { JsonRpcProvider, Networkish } from "@ethersproject/providers";
// import {
//   create as ipfsCreate,
//   IPFSHTTPClient,
//   Options as IpfsOptions,
// } from "ipfs-http-client";
// import { GraphQLClient } from "graphql-request";

// Context input parameters
interface Web3ContextParams {
  network: Networkish;
  signer: Signer;
  dao: string;
  daoFactoryAddress: string;
  web3Providers?: string | JsonRpcProvider | (string | JsonRpcProvider)[];
}
interface VocdoniContextParams {
  // Vocdoni
}
interface IpfsContextParams {
  // ipfs: IpfsOptions;
}
interface GraphQLContextParams {
  // subgraphURL: string;
}

export interface ContextParams
  extends Web3ContextParams,
    VocdoniContextParams,
    IpfsContextParams,
    GraphQLContextParams {}

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
