import { ContextParams, ContextState } from "./internal/interfaces/context";
// import { create as ipfsCreate, Options as IpfsOptions } from "ipfs-http-client";
// import { GraphQLClient } from "graphql-request";

// State
let defaultState: ContextState = {
  dao: "",
  daoFactoryAddress: "",
};

export class Context {
  private state: ContextState = Object.assign({}, defaultState);

  // INTERNAL CONTEXT STATE

  /**
   * @param {Object} params
   *
   * @constructor
   */
  constructor(params: Partial<ContextParams>) {
    this.set(params);
  }

  /**
   * Does set and parse the given context configuration object
   *
   * @method setFullContext
   *
   * @returns {void}
   *
   * @private
   */
  setFull(contextParams: ContextParams): void {
    // if (!contextParams.subgraphURL) {
    //   throw new Error("Missing subgraph URL");
    // }
    if (!contextParams.daoFactoryAddress) {
      throw new Error("Missing DAO factory address");
    } else if (!contextParams.signer) {
      throw new Error("Please pass the required signer");
    } else if (!contextParams.dao) {
      throw new Error("No DAO address defined");
    }
    // else if (!contextParams.ipfs) {
    //   throw new Error("No IPFS options defined");
    // }

    this.state = {
      signer: contextParams.signer,
      daoFactoryAddress: contextParams.daoFactoryAddress,
      dao: contextParams.dao,
      // ipfs: ipfsCreate(contextParams.ipfs),
      // subgraph: new GraphQLClient(contextParams.subgraphURL),
    };
  }

  set(contextParams: Partial<ContextParams>) {
    if (contextParams.dao) {
      this.state.dao = contextParams.dao;
    }
    if (contextParams.daoFactoryAddress) {
      this.state.daoFactoryAddress = contextParams.daoFactoryAddress;
    }
    if (contextParams.signer) {
      this.state.signer = contextParams.signer;
    }
    // if (contextParams.ipfs) {
    //   this.state.ipfs = ipfsCreate(contextParams.ipfs);
    // }
    // if (contextParams.subgraphURL) {
    //   this.state.subgraph = new GraphQLClient(contextParams.subgraphURL);
    // }
  }

  // GETTERS

  /**
   * Getter for the Signer
   *
   * @var signer
   *
   * @returns {Signer}
   *
   * @public
   */
  get signer() {
    return this.state.signer || defaultState.signer;
  }

  /**
   * Getter for the GraphQLClient instance of the subgraph
   *
   * @var subgraph
   *
   * @returns {GraphQLClient}
   *
   * @public
   */
  // get subgraph(): GraphQLClient {
  //   return this.state.subgraph || defaultState.subgraph;
  // }

  /**
   * Getter for daoFactoryAddress property
   *
   * @var daoFactoryAddress
   *
   * @returns {string}
   *
   * @public
   */
  get daoFactoryAddress(): string {
    return this.state.daoFactoryAddress || defaultState.daoFactoryAddress;
  }

  /**
   * Getter for the DAO address in the current global context
   *
   * @var dao
   *
   * @returns {string}
   *
   * @public
   */
  get dao(): string {
    return this.state.dao || defaultState.dao;
  }

  /**
   * Getter for the IPFS http client
   *
   * @var ipfs
   *
   * @returns {IPFSHTTPClient}
   *
   * @public
   */
  // get ipfs(): IPFSHTTPClient {
  //   return this.state.ipfs || defaultState.ipfs;
  // }

  // DEFAULT CONTEXT STATE
  static setDefault(params: Partial<ContextParams>) {
    if (params.dao) {
      defaultState.dao = params.dao;
    }
    if (params.daoFactoryAddress) {
      defaultState.daoFactoryAddress = params.daoFactoryAddress;
    }
    if (params.signer) {
      defaultState.signer = params.signer;
    }
    // if (params.ipfs) {
    //   defaultState.ipfs = ipfsCreate(params.ipfs);
    // }
    // if (params.subgraphURL) {
    //   defaultState.subgraph = new GraphQLClient(params.subgraphURL);
    // }
  }
  static getDefault() {
    return defaultState;
  }
}
