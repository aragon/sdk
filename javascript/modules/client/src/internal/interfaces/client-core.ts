import { Signer } from "@ethersproject/abstract-signer";
import { Contract, ContractInterface } from "@ethersproject/contracts";
import { JsonRpcProvider } from "@ethersproject/providers";

export interface IClientWeb3Core {
  // useSigner(signer: Signer): this;
  shiftWeb3Node(): this;
  signer: Signer | null;
  web3: JsonRpcProvider | null;
  checkWeb3Status(): Promise<boolean>;
  attachContract<T>(address: string, abi: ContractInterface): Contract & T;
}
export interface IClientVocdoniCore {
  // Add here
}
export interface IClientIpfsCore {
  pin(input: string | Uint8Array): Promise<string>;
  fetchString(cid: string): Promise<string>;
  fetchBytes(cid: string): Promise<Uint8Array | undefined>;
}
export interface IClientGraphQLCore {
  // Add here
}

export interface IClientCore
  extends IClientWeb3Core,
    IClientVocdoniCore,
    IClientIpfsCore,
    IClientGraphQLCore {}
