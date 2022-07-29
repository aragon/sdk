import { ContextParams, ContextState } from "./internal/interfaces/context";
import { JsonRpcProvider, Networkish } from "@ethersproject/providers";
import { UnsupportedProtocolError } from "@aragon/sdk-common";
import { activeContractsList } from "@aragon/core-contracts-ethers";
import { Client as IpfsClient } from "@aragon/sdk-ipfs";
import { GraphQLClient } from "graphql-request";
// import { GraphQLClient } from "graphql-request";

export { ContextParams } from "./internal/interfaces/context";

const DEFAULT_GAS_FEE_ESTIMATION_FACTOR = 0.625;
const supportedProtocols = ["https:"];
if (typeof process !== "undefined" && process.env?.TESTING) {
  supportedProtocols.push("http:");
}

// State
const defaultState: ContextState = {
  network: "mainnet",
  dao: "",
  web3Providers: [],
  gasFeeEstimationFactor: DEFAULT_GAS_FEE_ESTIMATION_FACTOR,
};

export class Context {
  protected state: ContextState = Object.assign({}, defaultState);
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
    } else if (!contextParams.gasFeeEstimationFactor) {
      throw new Error("No gas fee reducer defined");
    } else if (!contextParams.ipfsNodes?.length) {
      throw new Error("No IPFS nodes defined");
    } else if (!contextParams.subgraphURLs?.length) {
      throw new Error("No Subgraph URL defined");
    }

    this.state = {
      network: contextParams.network,
      signer: contextParams.signer,
      daoFactoryAddress: contextParams.daoFactoryAddress,
      dao: contextParams.dao,
      web3Providers: this.useWeb3Providers(
        contextParams.web3Providers,
        contextParams.network,
      ),
      gasFeeEstimationFactor: Context.resolveGasFeeEstimationFactor(
        contextParams.gasFeeEstimationFactor,
      ),
      ipfs: contextParams.ipfsNodes.map((config) =>
        new IpfsClient(config.url, config.headers)
      ),
      subgraph: contextParams.subgraphURLs.map((url) =>
        new GraphQLClient(url)
      ),
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
    } else if (this.state.network.toString() in activeContractsList) {
      this.state.daoFactoryAddress = activeContractsList[
        this.state.network.toString() as keyof typeof activeContractsList
      ].DAOFactory;
    }
    if (contextParams.signer) {
      this.state.signer = contextParams.signer;
    }
    if (contextParams.web3Providers) {
      this.state.web3Providers = this.useWeb3Providers(
        contextParams.web3Providers,
        this.state.network,
      );
    }
    if (contextParams.gasFeeEstimationFactor) {
      this.state.gasFeeEstimationFactor = Context.resolveGasFeeEstimationFactor(
        contextParams.gasFeeEstimationFactor,
      );
    }

    if (contextParams.ipfsNodes?.length) {
      this.state.ipfs = contextParams.ipfsNodes.map((config) =>
        new IpfsClient(config.url, config.headers)
      );
    }
    if (contextParams.subgraphURLs?.length) {
      this.state.subgraph = contextParams.subgraphURLs.map((url) =>
        new GraphQLClient(url)
      );
    }
  }

  useWeb3Providers(
    endpoints: string | JsonRpcProvider | (string | JsonRpcProvider)[],
    network: Networkish,
  ): JsonRpcProvider[] {
    if (Array.isArray(endpoints)) {
      return endpoints.map((item) => {
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
   * Getter for daoFactoryAddress property
   *
   * @var daoFactoryAddress
   *
   * @returns {string}
   *
   * @public
   */
  get daoFactoryAddress(): string | undefined {
    return this.state.daoFactoryAddress;
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
   * Getter for the gas fee reducer used in estimations
   *
   * @var gasFeeEstimationFactor
   *
   * @returns {number}
   *
   * @public
   */
  get gasFeeEstimationFactor(): number {
    return (
      this.state.gasFeeEstimationFactor || defaultState.gasFeeEstimationFactor
    );
  }

  /**
   * Getter for the IPFS http client
   *
   * @var ipfs
   *
   * @returns {IpfsClient[] | undefined}
   *
   * @public
   */
  get ipfs(): IpfsClient[] | undefined {
    return this.state.ipfs || defaultState.ipfs;
  }

  /**
   * Getter for the GraphQL client
   *
   * @var subgraph
   *
   * @returns {GraphQLClient[] | undefined}
   *
   * @public
   */
  get subgraph(): GraphQLClient[] | undefined {
    return this.state.subgraph || defaultState.subgraph;
  }

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
  }
  static getDefault() {
    return defaultState;
  }

  // INTERNAL HELPERS

  private static resolveGasFeeEstimationFactor(
    gasFeeEstimationFactor: number,
  ): number {
    if (typeof gasFeeEstimationFactor === "undefined") return 1;
    else if (gasFeeEstimationFactor < 0 || gasFeeEstimationFactor > 1) {
      throw new Error(
        "Gas estimation factor value should be a number between 0 and 1",
      );
    }
    return gasFeeEstimationFactor;
  }
}
