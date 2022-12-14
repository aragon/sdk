import { ClientCore, ContextPlugin } from "../client-common";
import {
  IClientAdmin,
  IClientAdminDecoding,
  IClientAdminEncoding,
  IClientAdminEstimation,
  IClientAdminMethods,
} from "./interfaces";
import { ClientAdminDecoding } from "./internal/client/decoding";
import { ClientAdminEncoding } from "./internal/client/encoding";
import { ClientAdminEstimation } from "./internal/client/estimation";
import { ClientAdminMethods } from "./internal/client/methods";

export class ClientAdmin extends ClientCore implements IClientAdmin {
  public methods: IClientAdminMethods;
  public encoding: IClientAdminEncoding;
  public decoding: IClientAdminDecoding;
  public estimation: IClientAdminEstimation;

  constructor(context: ContextPlugin) {
    super(context);
    this.methods = new ClientAdminMethods(context);
    this.encoding = new ClientAdminEncoding(context);
    this.decoding = new ClientAdminDecoding(context);
    this.estimation = new ClientAdminEstimation(context);
  }

  static encoding = {
    /**
     * Computes the parameters to be given when creating the DAO,
     * so that the plugin is configured
     *
     * @param {IAdminPluginInstall} params
     * @return {*}  {IPluginInstallItem}
     * @memberof ClientAdmin
     */
    getPluginInstallItem: (params: IAdminPluginInstall): IPluginInstallItem =>
      ClientAdminEncoding.getPluginInstallItem(params),
  };
}
