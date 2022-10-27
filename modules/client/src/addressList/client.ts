import {
  IAddressListPluginInstall,
  IClientAddressList,
  IClientAddressListDecoding,
  IClientAddressListEncoding,
  IClientAddressListEstimation,
  IClientAddressListMethods,
} from "./interfaces";
import { ClientAddressListMethods } from "./internal/client/methods";
import { ClientAddressListEncoding } from "./internal/client/encoding";
import { ClientAddressListDecoding } from "./internal/client/decoding";
import { ClientAddressListEstimation } from "./internal/client/estimation";
import {
  ClientCore,
  ContextPlugin,
  IPluginInstallItem,
} from "../client-common";

/**
 * Provider a generic client with high level methods to manage and interact an Address List Voting plugin installed in a DAO
 */
export class ClientAddressList extends ClientCore
  implements IClientAddressList {
  private privateMethods: IClientAddressListMethods;
  private privateEncoding: IClientAddressListEncoding;
  private privateDecoding: IClientAddressListDecoding;
  private privateEstimation: IClientAddressListEstimation;

  constructor(context: ContextPlugin) {
    super(context);
    this.privateMethods = new ClientAddressListMethods(context);
    this.privateEncoding = new ClientAddressListEncoding(context);
    this.privateDecoding = new ClientAddressListDecoding(context);
    this.privateEstimation = new ClientAddressListEstimation(context);
    Object.freeze(ClientAddressList.prototype);
    Object.freeze(this);
  }
  get methods(): IClientAddressListMethods {
    return this.privateMethods;
  }
  get encoding(): IClientAddressListEncoding {
    return this.privateEncoding;
  }
  get decoding(): IClientAddressListDecoding {
    return this.privateDecoding;
  }
  get estimation(): IClientAddressListEstimation {
    return this.privateEstimation;
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
