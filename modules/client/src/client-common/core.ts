import {
  IClientCore,
  IClientGraphQLCore,
  IClientIpfsCore,
  IClientWeb3Core,
} from "./interfaces/core";
import { Context } from "./context";
import { Web3Module } from "./modules/web3";
import { IPFSModule } from "./modules/ipfs";
import { GraphqlModule } from "./modules/graphql";

const web3Map = new Map<ClientCore, IClientWeb3Core>();
const ipfsMap = new Map<ClientCore, IClientIpfsCore>();
const graphqlMap = new Map<ClientCore, IClientGraphQLCore>();
/**
 * Provides the low level foundation so that subclasses have ready-made access to Web3, IPFS and GraphQL primitives
 */
export abstract class ClientCore implements IClientCore {
  constructor(context: Context) {
    web3Map.set(this, new Web3Module(context));
    ipfsMap.set(this, new IPFSModule(context));
    graphqlMap.set(this, new GraphqlModule(context));
    Object.freeze(ClientCore.prototype);
  }

  get web3(): IClientWeb3Core {
    return web3Map.get(this)!;
  }
  get ipfs(): IClientIpfsCore {
    return ipfsMap.get(this)!;
  }
  get graphql(): IClientGraphQLCore {
    return graphqlMap.get(this)!;
  }
}
