import {
  IAddresslistVotingClient,
  IAddresslistVotingClientDecoding,
  IAddresslistVotingClientEncoding,
  IAddresslistVotingClientEstimation,
  IAddresslistVotingClientMethods,
} from "./internal/interfaces";
import { AddresslistVotingClientMethods } from "./internal/client/methods";
import { AddresslistVotingClientEncoding } from "./internal/client/encoding";
import { AddresslistVotingClientDecoding } from "./internal/client/decoding";
import { AddresslistVotingClientEstimation } from "./internal/client/estimation";
import { Networkish } from "@ethersproject/providers";
import { AddresslistVotingPluginInstall } from "./types";
import {
  ClientCore,
  Context,
  PluginInstallItem,
} from "@aragon/sdk-client-common";

/**
 * Provider a generic client with high level methods to manage and interact an Address List Voting plugin installed in a DAO
 */
export class AddresslistVotingClient extends ClientCore
  implements IAddresslistVotingClient {
  public methods: IAddresslistVotingClientMethods;
  public encoding: IAddresslistVotingClientEncoding;
  public decoding: IAddresslistVotingClientDecoding;
  public estimation: IAddresslistVotingClientEstimation;

  constructor(context: Context) {
    super(context);
    this.methods = new AddresslistVotingClientMethods(context);
    this.encoding = new AddresslistVotingClientEncoding(context);
    this.decoding = new AddresslistVotingClientDecoding(context);
    this.estimation = new AddresslistVotingClientEstimation(context);
  }

  static encoding = {
    /**
     * Computes the parameters to be given when creating the DAO,
     * so that the plugin is configured
     *
     * @param {AddresslistVotingPluginInstall} params
     * @param {Networkish} [network="mainnet"]
     * @return {*}  {PluginInstallItem}
     * @memberof AddresslistVotingClient
     */
    getPluginInstallItem: (
      params: AddresslistVotingPluginInstall,
      network: Networkish,
    ): PluginInstallItem =>
      AddresslistVotingClientEncoding.getPluginInstallItem(params, network),
  };
}
