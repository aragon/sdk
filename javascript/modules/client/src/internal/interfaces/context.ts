import { Signer } from "@ethersproject/abstract-signer";
import { JsonRpcProvider } from "@ethersproject/providers";
import { EthNetworkID } from "@aragon/sdk-common";
// import {
//   create as ipfsCreate,
//   IPFSHTTPClient,
//   Options as IpfsOptions,
// } from "ipfs-http-client";
// import { GraphQLClient } from "graphql-request";

// Context input parameters
interface Web3ContextParams {
  network: EthNetworkID;
  signer: Signer;
  dao: string;
  daoFactoryAddress: string;
  endpoints: string | JsonRpcProvider | (string | JsonRpcProvider)[];
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
  network: EthNetworkID;
  signer?: Signer;
  dao: string;
  daoFactoryAddress: string;
  endpoints?: JsonRpcProvider[];
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
