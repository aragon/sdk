import { ClientCore, ContextPlugin, IPluginInstallItem } from "../client-common";
import {
  IAdminClient,
  IAdminClientEncoding,
  IAdminClientEstimation,
  IAdminClientMethods,
} from "./interfaces";
import { AdminClientEncoding } from "./internal/client/encoding";
import { AdminClientEstimation } from "./internal/client/estimation";
import { AdminClientMethods } from "./internal/client/methods";

/**
 * Provides a generic client with high level methods to manage and interact an Admin plugin installed in a DAO
 */
export class AdminClient extends ClientCore implements IAdminClient {
  public methods: IAdminClientMethods;
  public encoding: IAdminClientEncoding;
  public estimation: IAdminClientEstimation;

  constructor(context: ContextPlugin) {
    super(context);
    this.methods = new AdminClientMethods(context);
    this.encoding = new AdminClientEncoding(context);
    this.estimation = new AdminClientEstimation(context);
  }
static encoding = {
    
    /**
     * Computes the parameters to be given when creating the DAO,
     * so that the plugin is configured
     *
     * @param {string} addressOrEns
     * @return {*}  {IPluginInstallItem}
     * @memberof AdminClient
     */
    getPluginInstallItem: (addressOrEns: string): IPluginInstallItem =>
      AdminClientEncoding.getPluginInstallItem(addressOrEns),
  };
}
