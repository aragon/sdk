import {
  ITokenVotingClient,
  ITokenVotingClientDecoding,
  ITokenVotingClientEncoding,
  ITokenVotingClientEstimation,
  ITokenVotingClientMethods,
  ITokenVotingPluginInstall,
} from "./interfaces";
import { TokenVotingClientMethods } from "./internal/client/methods";
import { TokenVotingClientEncoding } from "./internal/client/encoding";
import { TokenVotingClientDecoding } from "./internal/client/decoding";
import { TokenVotingClientEstimation } from "./internal/client/estimation";
import {
  SupportedNetworks,
  ClientCore,
  ContextPlugin,
  IPluginInstallItem,
} from "../client-common";

/**
 * Provider a generic client with high level methods to manage and interact a Token Voting plugin installed in a DAO
 */
export class TokenVotingClient extends ClientCore
  implements ITokenVotingClient {
  private privateMethods: ITokenVotingClientMethods;
  private privateEncoding: ITokenVotingClientEncoding;
  private privateDecoding: ITokenVotingClientDecoding;
  private privateEstimation: ITokenVotingClientEstimation;

  constructor(context: ContextPlugin) {
    super(context);
    this.privateMethods = new TokenVotingClientMethods(context);
    this.privateEncoding = new TokenVotingClientEncoding(context);
    this.privateDecoding = new TokenVotingClientDecoding(context);
    this.privateEstimation = new TokenVotingClientEstimation(context);
    Object.freeze(TokenVotingClient.prototype);
    Object.freeze(this);
  }
  get methods(): ITokenVotingClientMethods {
    return this.privateMethods;
  }
  get encoding(): ITokenVotingClientEncoding {
    return this.privateEncoding;
  }
  get decoding(): ITokenVotingClientDecoding {
    return this.privateDecoding;
  }
  get estimation(): ITokenVotingClientEstimation {
    return this.privateEstimation;
  }

  static encoding = {
    /**
     * Computes the parameters to be given when creating the DAO,
     * so that the plugin is configured
     *
     * @param {ITokenVotingPluginInstall} params
     * @param {SupportedNetworks} [network="mainnet"]
     * @return {*}  {IPluginInstallItem}
     * @memberof TokenVotingClient
     */
    getPluginInstallItem: (
      params: ITokenVotingPluginInstall,
      network: SupportedNetworks = "mainnet",
    ): IPluginInstallItem =>
      TokenVotingClientEncoding.getPluginInstallItem(params, network),
  };
}
