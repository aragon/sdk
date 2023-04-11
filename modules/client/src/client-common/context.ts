import { ContextParams, ContextState } from "./interfaces/context";
import {
  getNetwork,
  JsonRpcProvider,
  Network,
  Networkish,
} from "@ethersproject/providers";
import {
  EnsUnsuportedByNetworkError,
  // UndefinedParameterError,
  UnsupportedNetworkError,
  UnsupportedProtocolError,
} from "@aragon/sdk-common";
import { Client as IpfsClient } from "@aragon/sdk-ipfs";
import { GraphQLClient } from "graphql-request";
import { LIVE_CONTRACTS } from "./constants";
import { SupportedNetworks, SupportedNetworksArray } from "./interfaces/common";
import { isAddress } from "@ethersproject/address";
import { Signer } from "@ethersproject/abstract-signer";
export { ContextParams } from "./interfaces/context";

const DEFAULT_GAS_FEE_ESTIMATION_FACTOR = 0.625;
const supportedProtocols = ["https:"];
if (typeof process !== "undefined" && process.env?.TESTING) {
  supportedProtocols.push("http:");
}

export class Context {
  protected state: ContextState = {} as ContextState;
  // INTERNAL CONTEXT STATE
  /**
   * @param {Object} params
   *
   * @constructor
   */
  constructor(params: Partial<ContextParams>) {
    // UNCOMMENT FOR MANDATORY PARAMS
    // check mandatory params
    // if (!params.network && this.state.network) {
    //   throw new UndefinedParameterError("network");
    // }
    // if (!params.signer) {
    //   throw new UndefinedParameterError("signer");
    // }
    // if (
    //   !params.web3Providers ||
    //   (Array.isArray(params.web3Providers) && !params.web3Providers.length)
    // ) {
    //   throw new UndefinedParameterError("web3 providers");
    // }
    // if (!params.graphqlNodes || !params.graphqlNodes.length) {
    //   throw new UndefinedParameterError("graphql nodes");
    // }
    // if (!params.ipfsNodes || !params.ipfsNodes.length) {
    //   throw new UndefinedParameterError("ipfs nodes");
    // }
    this.set(params);
  }

  set(contextParams: Partial<ContextParams>) {
    if (contextParams.network) {
      this.state.network = Context.resolveNetwork(
        contextParams.network,
        contextParams.ensRegistryAddress,
      );
    }
    if (contextParams.signer) {
      this.state.signer = contextParams.signer;
    }
    if (
      contextParams.web3Providers ||
      (Array.isArray(contextParams.web3Providers) &&
        contextParams.web3Providers.length)
    ) {
      this.state.web3Providers = Context.resolveWeb3Providers(
        contextParams.web3Providers,
        this.state.network,
      );
    }
    if (contextParams.graphqlNodes?.length) {
      this.state.graphql = Context.resolveGraphql(contextParams.graphqlNodes);
    }
    if (contextParams.ipfsNodes?.length) {
      this.state.ipfs = Context.resolveIpfs(contextParams.ipfsNodes);
    }
    if (contextParams.daoFactoryAddress) {
      this.state.daoFactoryAddress = contextParams.daoFactoryAddress;
    }
    if (contextParams.ensRegistryAddress) {
      this.state.ensRegistryAddress = contextParams.ensRegistryAddress;
    }
    if (contextParams.gasFeeEstimationFactor) {
      this.state.gasFeeEstimationFactor = Context.resolveGasFeeEstimationFactor(
        contextParams.gasFeeEstimationFactor,
      );
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
    return this.state.network;
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
  get ensRegistryAddress(): string | undefined {
    return this.state.ensRegistryAddress ||
      LIVE_CONTRACTS[this.state.network.name as SupportedNetworks].ensRegistry;
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
  get signer(): Signer {
    return this.state.signer;
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
  get web3Providers(): JsonRpcProvider[] {
    return this.state.web3Providers;
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
  get daoFactoryAddress(): string {
    return this.state.daoFactoryAddress ||
      LIVE_CONTRACTS[this.state.network.name as SupportedNetworks].daoFactory;
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
      this.state.gasFeeEstimationFactor || DEFAULT_GAS_FEE_ESTIMATION_FACTOR
    );
  }

  /**
   * Getter for the IPFS http client
   *
   * @var ipfs
   *
   * @returns {IpfsClient[]}
   *
   * @public
   */
  get ipfs(): IpfsClient[] {
    return this.state.ipfs;
  }

  /**
   * Getter for the GraphQL client
   *
   * @var graphql
   *
   * @returns {GraphQLClient[]}
   *
   * @public
   */
  get graphql(): GraphQLClient[] {
    return this.state.graphql;
  }

  // INTERNAL HELPERS
  private static resolveNetwork(
    networkish: Networkish,
    ensRegistryAddress?: string,
  ): Network {
    const network = getNetwork(networkish);
    const networkName = network.name as SupportedNetworks;
    if (!SupportedNetworksArray.includes(networkName)) {
      throw new UnsupportedNetworkError(networkName);
    }
    if (ensRegistryAddress) {
      if (!isAddress(ensRegistryAddress)) {
        console.warn("invalid address, using default");
        // throw new InvalidAddressError()
      } else {
        network.ensAddress = ensRegistryAddress;
      }
    }
    if (!network.ensAddress) {
      const ensAddress = LIVE_CONTRACTS[networkName].ensRegistry;
      if (!ensAddress) {
        throw new EnsUnsuportedByNetworkError(networkName);
      }
      network.ensAddress = ensAddress;
    }
    return network;
  }

  private static resolveWeb3Providers(
    endpoints: string | JsonRpcProvider | (string | JsonRpcProvider)[],
    network: Network,
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

  private static resolveIpfs(
    configs: {
      url: string;
      headers?: Record<string, string>;
    }[],
  ): IpfsClient[] {
    let clients: IpfsClient[] = [];
    configs.forEach((config) => {
      const url = new URL(config.url);
      if (!supportedProtocols.includes(url.protocol)) {
        throw new UnsupportedProtocolError(url.protocol);
      }
      clients.push(new IpfsClient(url, config.headers));
    });
    return clients;
  }

  private static resolveGraphql(endpoints: { url: string }[]): GraphQLClient[] {
    let clients: GraphQLClient[] = [];
    endpoints.forEach((endpoint) => {
      const url = new URL(endpoint.url);
      if (!supportedProtocols.includes(url.protocol)) {
        throw new UnsupportedProtocolError(url.protocol);
      }
      clients.push(new GraphQLClient(url.href));
    });
    return clients;
  }

  private static resolveGasFeeEstimationFactor(
    gasFeeEstimationFactor: number,
  ): number {
    if (gasFeeEstimationFactor < 0 || gasFeeEstimationFactor > 1) {
      throw new Error(
        "Gas estimation factor value should be a number between 0 and 1",
      );
    }
    return gasFeeEstimationFactor;
  }
}
