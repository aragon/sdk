import { ContextPlugin } from "./context-plugin";
import {
  IAddressListPluginInstall,
  IClientAddressList,
  IClientAddressListDecoding,
  IClientAddressListEncoding,
  IClientAddressListEstimation,
  IClientAddressListMethods,
} from "./internal/interfaces/plugins";
import { IClientAddressListMethodsModule } from "./modules-addressList/methods";
import { IClientAddressListEncodingModule } from "./modules-addressList/encoding";
import { IClientAddressListDecodingModule } from "./modules-addressList/decoding";
import { IClientAddressListEstimationModule } from "./modules-addressList/estimation";
import { IPluginInstallItem } from "./internal/interfaces/common";
import { encodeAddressListActionInit } from "./internal/encoding/plugins";
import { ClientCore } from "./internal/core";

// NOTE: This address needs to be set when the plugin has been published and the ID is known
const PLUGIN_ID = "0x1234567890123456789012345678901234567890";

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
    this.methods = new IClientAddressListMethodsModule(context);
    this.encoding = new IClientAddressListEncodingModule(context);
    this.decoding = new IClientAddressListDecodingModule(context);
    this.estimation = new IClientAddressListEstimationModule(context);
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
    ): IPluginInstallItem => {
      return {
        id: PLUGIN_ID,
        data: encodeAddressListActionInit(params),
      };
    },
  };
}
