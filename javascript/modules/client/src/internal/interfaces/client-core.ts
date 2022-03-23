import { Signer } from "@ethersproject/abstract-signer";
import { Contract, ContractInterface } from "@ethersproject/contracts";
import { JsonRpcProvider } from "@ethersproject/providers";
import { GraphQLClient } from "graphql-request";

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
  // Add here
}
export interface IClientGraphQLCore extends IClientGraphQLRequests {
  graphQL: GraphQLClient | undefined;
  checkGraphQLStatus(): Promise<boolean>;
}
export interface IClientGraphQLRequests {
  graph: {
    raw: (query: string, variables?: object) => Promise<any>;
    daoList: (offset: number, limit: number) => Promise<any>;
  }
}

export interface IClientCore
  extends IClientWeb3Core,
    IClientVocdoniCore,
    IClientIpfsCore,
    IClientGraphQLCore {}
