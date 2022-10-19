import { ContextPlugin } from "./context-plugin";
import {
  IAddressListPluginInstall,
  IClientAddressList,
  IClientAddressListDecoding,
  IClientAddressListEncoding,
  IClientAddressListEstimation,
  IClientAddressListMethods,
} from "./internal/interfaces/plugins";
import { ClientAddressListMethods } from "./internal/client-addressList/methods";
import { ClientAddressListEncoding } from "./internal/client-addressList/encoding";
import { ClientAddressListDecoding } from "./internal/client-addressList/decoding";
import { ClientAddressListEstimation } from "./internal/client-addressList/estimation";
import { IPluginInstallItem } from "./internal/interfaces/common";
import { ClientCore } from "./internal/core";

/**
 * Provider a generic client with high level methods to manage and interact an Address List Voting plugin installed in a DAO
 */
export class ClientAddressList extends ClientCore
  implements IClientAddressList {
  public methods: IClientAddressListMethods;
  public encoding: IClientAddressListEncoding;
  public decoding: IClientAddressListDecoding;
  public estimation: IClientAddressListEstimation;

  constructor(context: ContextPlugin) {
    super(context);
    this.methods = new ClientAddressListMethods(context);
    this.encoding = new ClientAddressListEncoding(context);
    this.decoding = new ClientAddressListDecoding(context);
    this.estimation = new ClientAddressListEstimation(context);
    Object.freeze(this.methods);
    Object.freeze(this.encoding);
    Object.freeze(this.decoding);
    Object.freeze(this.estimation);
  }
  static encoding = {
    /**
     * Computes the parameters to be given when creating the DAO,
     * so that the plugin is configured
     *
     * @param {IAddressListPluginInstall} params
     * @return {*}  {IPluginInstallItem}
     * @memberof ClientAddressList
     */
    getPluginInstallItem: (
      params: IAddressListPluginInstall,
    ): IPluginInstallItem =>
      ClientAddressListEncoding.getPluginInstallItem(params),
  };
}
