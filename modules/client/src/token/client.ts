import {
  IClientToken,
  IClientTokenDecoding,
  IClientTokenEncoding,
  IClientTokenEstimation,
  IClientTokenMethods,
  ITokenPluginInstall,
} from "./interfaces";
import { ClientTokenMethods } from "./internal/client/methods";
import { ClientTokenEncoding } from "./internal/client/encoding";
import { ClientTokenDecoding } from "./internal/client/decoding";
import { ClientTokenEstimation } from "./internal/client/estimation";
import {
  ClientCore,
  ContextPlugin,
  IPluginInstallItem,
} from "../client-common";

/**
 * Provider a generic client with high level methods to manage and interact an Token Voting plugin installed in a DAO
 */
export class ClientToken extends ClientCore implements IClientToken {
  private privateMethods: IClientTokenMethods;
  private privateEncoding: IClientTokenEncoding;
  private privateDecoding: IClientTokenDecoding;
  private privateEstimation: IClientTokenEstimation;

  constructor(context: ContextPlugin) {
    super(context);
    this.privateMethods = new ClientTokenMethods(context);
    this.privateEncoding = new ClientTokenEncoding(context);
    this.privateDecoding = new ClientTokenDecoding(context);
    this.privateEstimation = new ClientTokenEstimation(context);
    Object.freeze(ClientToken.prototype);
    Object.freeze(this);
  }
  get methods(): IClientTokenMethods {
    return this.privateMethods;
  }
  get encoding(): IClientTokenEncoding {
    return this.privateEncoding;
  }
  get decoding(): IClientTokenDecoding {
    return this.privateDecoding;
  }
  get estimation(): IClientTokenEstimation {
    return this.privateEstimation;
  }

  static encoding = {
    /**
     * Computes the parameters to be given when creating the DAO,
     * so that the plugin is configured
     *
     * @param {ITokenPluginInstall} params
     * @return {*}  {IPluginInstallItem}
     * @memberof ClientToken
     */
    getPluginInstallItem: (params: ITokenPluginInstall): IPluginInstallItem =>
      ClientTokenEncoding.getPluginInstallItem(params),
  };
}
