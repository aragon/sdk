// This file contains the definition of the low level network clients

import { Signer } from "@ethersproject/abstract-signer";
import { Contract, ContractInterface } from "@ethersproject/contracts";
import { JsonRpcProvider } from "@ethersproject/providers";
import { Client as IpfsClient } from "@aragon/sdk-ipfs";
import { GasFeeEstimation } from "./common";
import { GraphQLClient } from "graphql-request";

export interface IClientWeb3Core {
  useSigner: (signer: Signer) => void;
  shiftProvider: () => void;
  getSigner: () => Signer | null;
  getConnectedSigner: () => Signer;
  getProvider: () => JsonRpcProvider | null;
  getMaxFeePerGas: () => Promise<bigint>;
  isUp: () => Promise<boolean>;
  attachContract: <T>(
    address: string,
    abi: ContractInterface,
  ) => Contract & T;
  getDaoFactoryAddress: () => string;
  getApproximateGasFee: (estimatedFee: bigint) => Promise<GasFeeEstimation>;
}
export interface IClientIpfsCore {
  getClient: () => IpfsClient;
  shiftClient: () => void;
  isUp: () => Promise<boolean>;
  ensureOnline: () => Promise<void>;
  add: (input: string | Uint8Array) => Promise<string>;
  fetchString: (cid: string) => Promise<string>;
  fetchBytes: (cid: string) => Promise<Uint8Array | undefined>;
}
export interface IClientGraphQLCore {
  // Add here
  getClient: () => GraphQLClient
  isUp: () => Promise<boolean>
}

export interface IClientCore {
  web3: IClientWeb3Core;
  ipfs: IClientIpfsCore;
  subgraph: IClientGraphQLCore;
}
