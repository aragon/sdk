import {
  IAddresslistVotingClient,
  IAddresslistVotingClientDecoding,
  IAddresslistVotingClientEncoding,
  IAddresslistVotingClientEstimation,
  IAddresslistVotingClientMethods,
  IAddresslistVotingPluginInstall,
} from "./interfaces";
import { AddresslistVotingClientMethods } from "./internal/client/methods";
import { AddresslistVotingClientEncoding } from "./internal/client/encoding";
import { AddresslistVotingClientDecoding } from "./internal/client/decoding";
import { AddresslistVotingClientEstimation } from "./internal/client/estimation";
import {
  ClientCore,
  ContextPlugin,
  IPluginInstallItem,
} from "../client-common";
import { Networkish } from "@ethersproject/providers";

/**
 * Provider a generic client with high level methods to manage and interact an Address List Voting plugin installed in a DAO
 */
export class AddresslistVotingClient extends ClientCore
  implements IAddresslistVotingClient {
  public methods: IAddresslistVotingClientMethods;
  public encoding: IAddresslistVotingClientEncoding;
  public decoding: IAddresslistVotingClientDecoding;
  public estimation: IAddresslistVotingClientEstimation;

  constructor(context: ContextPlugin) {
    super(context);
    this.methods = new AddresslistVotingClientMethods(context);
    this.encoding = new AddresslistVotingClientEncoding(context);
    this.decoding = new AddresslistVotingClientDecoding(context);
    this.estimation = new AddresslistVotingClientEstimation(context);
    Object.freeze(AddresslistVotingClient.prototype);
    Object.freeze(this);
  }

  static encoding = {
    /**
     * Computes the parameters to be given when creating the DAO,
     * so that the plugin is configured
     *
     * @param {IAddresslistVotingPluginInstall} params
     * @param {Networkish} [network="mainnet"]
     * @return {*}  {IPluginInstallItem}
     * @memberof AddresslistVotingClient
     */
    getPluginInstallItem: (
      params: IAddresslistVotingPluginInstall,
      network: Networkish = "mainnet",
    ): IPluginInstallItem =>
      AddresslistVotingClientEncoding.getPluginInstallItem(params, network),
  };
}
