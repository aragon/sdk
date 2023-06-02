import { ContextCore } from "./context-core";
import {
    IClientCore,
    IClientGraphQLCore,
    IClientIpfsCore,
    IClientWeb3Core,
    Web3Module,
    IPFSModule,
    GraphqlModule,
  } from "./internal";
  
  /**
   * Provides the low level foundation so that subclasses have ready-made access to Web3, IPFS and GraphQL primitives
   */
  export abstract class ClientCore implements IClientCore {
    public web3: IClientWeb3Core;
    public ipfs: IClientIpfsCore;
    public graphql: IClientGraphQLCore;
    constructor(context: ContextCore) {
      this.web3 = new Web3Module(context);
      this.ipfs = new IPFSModule(context);
      this.graphql = new GraphqlModule(context);
    }
  }
  