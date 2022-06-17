// This file contains the definition of the low level network clients

import { Signer } from "@ethersproject/abstract-signer";
import { Contract, ContractInterface } from "@ethersproject/contracts";
import { JsonRpcProvider } from "@ethersproject/providers";
// NOTE: Backing off ipfs-http-client until the UI framework supports it
// import { IPFSHTTPClient } from "ipfs-http-client";

export interface IClientWeb3Core {
  web3: {
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
  };
}
export interface IClientIpfsCore {
  ipfs: {
    // NOTE: Backing off ipfs-http-client until the UI framework supports it

    // shiftClient: () => void;
    // isUp: () => Promise<boolean>;
    // getClient: () => IPFSHTTPClient;
    // pin: (input: string | Uint8Array) => Promise<string>;
    // fetchString: (cid: string) => Promise<string>;
    // fetchBytes: (cid: string) => Promise<Uint8Array | undefined>;
  };
}
export interface IClientGraphQLCore {
  // Add here
}

export interface IClientCore
  extends IClientWeb3Core, IClientIpfsCore, IClientGraphQLCore {}
