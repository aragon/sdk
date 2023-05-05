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
  ClientCore,
  ContextPlugin,
  IPluginInstallItem,
} from "../client-common";
import { Networkish } from "@ethersproject/providers";

/**
 * Provider a generic client with high level methods to manage and interact a Token Voting plugin installed in a DAO
 */
export class TokenVotingClient extends ClientCore
  implements ITokenVotingClient {
  public methods: ITokenVotingClientMethods;
  public encoding: ITokenVotingClientEncoding;
  public decoding: ITokenVotingClientDecoding;
  public estimation: ITokenVotingClientEstimation;

  constructor(context: ContextPlugin) {
    super(context);
    this.methods = new TokenVotingClientMethods(context);
    this.encoding = new TokenVotingClientEncoding(context);
    this.decoding = new TokenVotingClientDecoding(context);
    this.estimation = new TokenVotingClientEstimation(context);
    Object.freeze(TokenVotingClient.prototype);
    Object.freeze(this);
  }
  static encoding = {
    /**
     * Computes the parameters to be given when creating the DAO,
     * so that the plugin is configured
     *
     * @param {ITokenVotingPluginInstall} params
     * @param {Networkish} [network="mainnet"]
     * @return {*}  {IPluginInstallItem}
     * @memberof TokenVotingClient
     */
    getPluginInstallItem: (
      params: ITokenVotingPluginInstall,
      network: Networkish = "mainnet",
    ): IPluginInstallItem =>
      TokenVotingClientEncoding.getPluginInstallItem(params, network),
  };
}
