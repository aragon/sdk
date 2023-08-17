import {
  ITokenVotingClient,
  ITokenVotingClientDecoding,
  ITokenVotingClientEncoding,
  ITokenVotingClientEstimation,
  ITokenVotingClientMethods,
} from "./internal/interfaces";
import { TokenVotingClientMethods } from "./internal/client/methods";
import { TokenVotingClientEncoding } from "./internal/client/encoding";
import { TokenVotingClientDecoding } from "./internal/client/decoding";
import { TokenVotingClientEstimation } from "./internal/client/estimation";
import { Networkish } from "@ethersproject/providers";
import { TokenVotingPluginInstall } from "./types";
import {
  ClientCore,
  Context,
  PluginInstallItem,
} from "@aragon/sdk-client-common";

/**
 * Provider a generic client with high level methods to manage and interact a Token Voting plugin installed in a DAO
 */
export class TokenVotingClient extends ClientCore
  implements ITokenVotingClient {
  public methods: ITokenVotingClientMethods;
  public encoding: ITokenVotingClientEncoding;
  public decoding: ITokenVotingClientDecoding;
  public estimation: ITokenVotingClientEstimation;

  constructor(context: Context) {
    super(context);
    this.methods = new TokenVotingClientMethods(context);
    this.encoding = new TokenVotingClientEncoding(context);
    this.decoding = new TokenVotingClientDecoding(context);
    this.estimation = new TokenVotingClientEstimation(context);
  }
  static encoding = {
    /**
     * Computes the parameters to be given when creating the DAO,
     * so that the plugin is configured
     *
     * @param {TokenVotingPluginInstall} params
     * @param {Networkish} [network="mainnet"]
     * @return {*}  {PluginInstallItem}
     * @memberof TokenVotingClient
     */
    getPluginInstallItem: (
      params: TokenVotingPluginInstall,
      network: Networkish
    ): PluginInstallItem =>
      TokenVotingClientEncoding.getPluginInstallItem(params, network),
  };
}
