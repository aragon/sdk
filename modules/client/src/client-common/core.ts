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

/**
 * Provides the low level foundation so that subclasses have ready-made access to Web3, IPFS and GraphQL primitives
 */
export abstract class ClientCore implements IClientCore {
  private privateWeb3: IClientWeb3Core;
  private privateIpfs: IClientIpfsCore;
  private privateGraphql: IClientGraphQLCore;

  constructor(context: Context) {
    this.privateWeb3 = new Web3Module(context);
    this.privateIpfs = new IPFSModule(context);
    this.privateGraphql = new GraphqlModule(context);
    Object.freeze(ClientCore.prototype);
  }

  get web3(): IClientWeb3Core {
    return this.privateWeb3;
  }
  get ipfs(): IClientIpfsCore {
    return this.privateIpfs;
  }
  get graphql(): IClientGraphQLCore {
    return this.privateGraphql;
  }
}
