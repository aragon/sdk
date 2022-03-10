import { Signer } from "@ethersproject/abstract-signer";
// import {
//   create as ipfsCreate,
//   IPFSHTTPClient,
//   Options as IpfsOptions,
// } from "ipfs-http-client";
// import { GraphQLClient } from "graphql-request";

// Context input parameters
interface Web3ContextParams {
  signer: Signer;
  dao: string;
  daoFactoryAddress: string;
}
interface DvoteContextParams {
  // dvote
}
interface IpfsContextParams {
  // ipfs: IpfsOptions;
}
interface GraphQLContextParams {
  // subgraphURL: string;
}

export interface ContextParams
  extends Web3ContextParams,
    DvoteContextParams,
    IpfsContextParams,
    GraphQLContextParams {}

// Context state data

interface Web3ContextState {
  signer?: Signer;
  dao: string;
  daoFactoryAddress: string;
}
interface DvoteContextState {}
interface IpfsContextState {
  // ipfs?: IPFSHTTPClient;
}
interface GraphQLContextState {
  // subgraph?: GraphQLClient;
}

export interface ContextState
  extends Web3ContextState,
    DvoteContextState,
    IpfsContextState,
    GraphQLContextState {}
