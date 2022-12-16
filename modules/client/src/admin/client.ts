import { ClientCore, ContextPlugin, IPluginInstallItem } from "../client-common";
import {
  IClientAdmin,
  IClientAdminEncoding,
  IClientAdminEstimation,
  IClientAdminMethods,
} from "./interfaces";
import { ClientAdminEncoding } from "./internal/client/encoding";
import { ClientAdminEstimation } from "./internal/client/estimation";
import { ClientAdminMethods } from "./internal/client/methods";

/**
 * Provides a generic client with high level methods to manage and interact an Admin plugin installed in a DAO
 */
export class ClientAdmin extends ClientCore implements IClientAdmin {
  public methods: IClientAdminMethods;
  public encoding: IClientAdminEncoding;
  public estimation: IClientAdminEstimation;

  constructor(context: ContextPlugin) {
    super(context);
    this.methods = new ClientAdminMethods(context);
    this.encoding = new ClientAdminEncoding(context);
    this.estimation = new ClientAdminEstimation(context);
  }
static encoding = {
    
    /**
     * Computes the parameters to be given when creating the DAO,
     * so that the plugin is configured
     *
     * @param {string} addressOrEns
     * @return {*}  {IPluginInstallItem}
     * @memberof ClientAdmin
     */
    getPluginInstallItem: (addressOrEns: string): IPluginInstallItem =>
      ClientAdminEncoding.getPluginInstallItem(addressOrEns),
  };
}
