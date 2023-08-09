// This file contains the definition of the low level network clients

import { Signer } from "@ethersproject/abstract-signer";
import { Contract, ContractInterface } from "@ethersproject/contracts";
import { JsonRpcProvider } from "@ethersproject/providers";
import { Client as IpfsClient, PinResponse } from "@aragon/sdk-ipfs";
import { GraphQLClient } from "graphql-request";
import { GasFeeEstimation, SupportedNetwork } from "../types";

export interface IClientWeb3Core {
  shiftProvider: () => void;
  getSigner: () => Signer;
  getConnectedSigner: () => Signer;
  getProvider: () => JsonRpcProvider;
  getNetworkName: () => SupportedNetwork;
  getMaxFeePerGas: () => Promise<bigint>;
  isUp: () => Promise<boolean>;
  ensureOnline: () => Promise<void>;
  attachContract: <T>(
    address: string,
    abi: ContractInterface,
  ) => Contract & T;
  readonly daoFactoryAddress: string;
  readonly pluginSetupProcessorAddress: string;
  readonly ensRegistryAddress: string;
  // TODO: remove these
  readonly multisigRepoAddress: string;
  readonly multisigSetupAddress: string;
  readonly adminRepoAddress: string;
  readonly adminSetupAddress: string;
  readonly addresslistVotingRepoAddress: string;
  readonly addresslistVotingSetupAddress: string;
  readonly tokenVotingRepoAddress: string;
  readonly tokenVotingSetupAddress: string;
  getApproximateGasFee: (estimatedFee: bigint) => Promise<GasFeeEstimation>;
}
export interface IClientIpfsCore {
  getClient: () => IpfsClient;
  shiftClient: () => void;
  isUp: () => Promise<boolean>;
  ensureOnline: () => Promise<void>;
  add: (input: string | Uint8Array) => Promise<string>;
  pin: (input: string) => Promise<PinResponse>;
  fetchString: (cid: string) => Promise<string>;
  fetchBytes: (cid: string) => Promise<Uint8Array | undefined>;
}
export interface IClientGraphQLCore {
  getClient: () => GraphQLClient;
  shiftClient: () => void;
  isUp: () => Promise<boolean>;
  ensureOnline: () => Promise<void>;
  request: <T>({ query, params, name }: {
    query: string;
    params: { [key: string]: any };
    name?: string;
  }) => Promise<T>;
}

export interface IClientCore {
  web3: IClientWeb3Core;
  ipfs: IClientIpfsCore;
  graphql: IClientGraphQLCore;
}
