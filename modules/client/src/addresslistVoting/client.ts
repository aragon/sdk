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
  private privateMethods: IAddresslistVotingClientMethods;
  private privateEncoding: IAddresslistVotingClientEncoding;
  private privateDecoding: IAddresslistVotingClientDecoding;
  private privateEstimation: IAddresslistVotingClientEstimation;

  constructor(context: ContextPlugin) {
    super(context);
    this.privateMethods = new AddresslistVotingClientMethods(context);
    this.privateEncoding = new AddresslistVotingClientEncoding(context);
    this.privateDecoding = new AddresslistVotingClientDecoding(context);
    this.privateEstimation = new AddresslistVotingClientEstimation(context);
    Object.freeze(AddresslistVotingClient.prototype);
    Object.freeze(this);
  }
  get methods(): IAddresslistVotingClientMethods {
    return this.privateMethods;
  }
  get encoding(): IAddresslistVotingClientEncoding {
    return this.privateEncoding;
  }
  get decoding(): IAddresslistVotingClientDecoding {
    return this.privateDecoding;
  }
  get estimation(): IAddresslistVotingClientEstimation {
    return this.privateEstimation;
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
