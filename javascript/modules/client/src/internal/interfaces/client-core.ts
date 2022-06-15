import { Signer } from "@ethersproject/abstract-signer";
import { Contract, ContractInterface } from "@ethersproject/contracts";
import { JsonRpcProvider } from "@ethersproject/providers";
// NOTE: Backing off ipfs-http-client until the UI framework supports it
// import { IPFSHTTPClient } from "ipfs-http-client";

export interface IClientWeb3Core {
  useSigner(signer: Signer): this;
  shiftWeb3Node(): this;
  signer: Signer | null;
  web3: JsonRpcProvider | null;
  isWeb3NodeUp(): Promise<boolean>;
  attachContract<T>(address: string, abi: ContractInterface): Contract & T;
}
export interface IClientVocdoniCore {
  // Add here
}
export interface IClientIpfsCore {
  // NOTE: Backing off ipfs-http-client until the UI framework supports it
  // shiftIpfsNode(): this;
  // isIpfsNodeUp(): Promise<boolean>;
  // ipfs: IPFSHTTPClient;
  // pin(input: string | Uint8Array): Promise<string>;
  // fetchString(cid: string): Promise<string>;
  // fetchBytes(cid: string): Promise<Uint8Array | undefined>;
}
export interface IClientGraphQLCore {
  // Add here
}

export interface IClientCore
  extends
    IClientWeb3Core,
    IClientVocdoniCore,
    IClientIpfsCore,
    IClientGraphQLCore {}
