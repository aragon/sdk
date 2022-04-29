import { ContextState, ContextParams } from "./internal/interfaces/context";
import { JsonRpcProvider, Networkish } from "@ethersproject/providers";
import { UnsupportedProtocolError } from "@aragon/sdk-common";
// import { create as ipfsCreate, Options as IpfsOptions } from "ipfs-http-client";
// import { GraphQLClient } from "graphql-request";
export { ContextParams } from "./internal/interfaces/context";

const supportedProtocols = ["https:"];
if(typeof process !== "undefined" && process.env?.TESTING) {
  supportedProtocols.push("http:");
}

// State
let defaultState: ContextState = {
  network: "mainnet",
  dao: "",
  daoFactoryAddress: "",
  web3Providers: [],
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
    if (!contextParams.network) {
      throw new Error("Missing network");
    } else if (!contextParams.daoFactoryAddress) {
      throw new Error("Missing DAO factory address");
    } else if (!contextParams.signer) {
      throw new Error("Please pass the required signer");
    } else if (!contextParams.dao) {
      throw new Error("No DAO address defined");
    } else if (!contextParams.web3Providers) {
      throw new Error("No web3 endpoints defined");
    }
    // else if (!contextParams.ipfs) {
    //   throw new Error("No IPFS options defined");
    // }

    this.state = {
      network: contextParams.network,
      signer: contextParams.signer,
      daoFactoryAddress: contextParams.daoFactoryAddress,
      dao: contextParams.dao,
      web3Providers: this.useWeb3Providers(
        contextParams.web3Providers,
        contextParams.network
      ),
      // ipfs: ipfsCreate(contextParams.ipfs),
      // subgraph: new GraphQLClient(contextParams.subgraphURL),
    };
  }

  set(contextParams: Partial<ContextParams>) {
    if (contextParams.network) {
      this.state.network = contextParams.network;
    }
    if (contextParams.dao) {
      this.state.dao = contextParams.dao;
    }
    if (contextParams.daoFactoryAddress) {
      this.state.daoFactoryAddress = contextParams.daoFactoryAddress;
    }
    if (contextParams.signer) {
      this.state.signer = contextParams.signer;
    }
    if (contextParams.web3Providers) {
      this.state.web3Providers = this.useWeb3Providers(
        contextParams.web3Providers,
        this.state.network
      );
    }
    // if (contextParams.ipfs) {
    //   this.state.ipfs = ipfsCreate(contextParams.ipfs);
    // }
    // if (contextParams.subgraphURL) {
    //   this.state.subgraph = new GraphQLClient(contextParams.subgraphURL);
    // }
  }

  useWeb3Providers(
    endpoints: string | JsonRpcProvider | (string | JsonRpcProvider)[],
    network: Networkish
  ): JsonRpcProvider[] {
    if (Array.isArray(endpoints)) {
      return endpoints.map(item => {
        if (typeof item === "string") {
          const url = new URL(item);
          if (!supportedProtocols.includes(url.protocol)) {
            throw new UnsupportedProtocolError(url.protocol);
          }
          return new JsonRpcProvider(url.href, network);
        }
        return item;
      });
    } else if (typeof endpoints === "string") {
      const url = new URL(endpoints);
      if (!supportedProtocols.includes(url.protocol)) {
        throw new UnsupportedProtocolError(url.protocol);
      }
      return [new JsonRpcProvider(url.href, network)];
    } else {
      return [endpoints];
    }
  }

  // GETTERS

  /**
   * Getter for the network
   *
   * @var network
   *
   * @returns {Networkish}
   *
   * @public
   */
  get network() {
    return this.state.network || defaultState.network;
  }

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
   * Getter for the web3 providers
   *
   * @var web3Providers
   *
   * @returns {JsonRpcProvider[]}
   *
   * @public
   */
  get web3Providers() {
    return this.state.web3Providers || defaultState.web3Providers;
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
