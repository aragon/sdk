import {
  IClientErc20,
  IClientErc20Decoding,
  IClientErc20Encoding,
  IClientErc20Estimation,
  IClientErc20Methods,
  IErc20PluginInstall,
} from "./internal/interfaces";
import { ClientErc20Methods } from "./internal/client/methods";
import { ClientErc20Encoding } from "./internal/client/encoding";
import { ClientErc20Decoding } from "./internal/client/decoding";
import { ClientErc20Estimation } from "./internal/client/estimation";
import {
  ClientCore,
  ContextPlugin,
  IPluginInstallItem,
} from "../client-common";

/**
 * Provider a generic client with high level methods to manage and interact an ERC20 Voting plugin installed in a DAO
 */
export class ClientErc20 extends ClientCore implements IClientErc20 {
  private privateMethods: IClientErc20Methods;
  private privateEncoding: IClientErc20Encoding;
  private privateDecoding: IClientErc20Decoding;
  private privateEstimation: IClientErc20Estimation;

  constructor(context: ContextPlugin) {
    super(context);
    this.privateMethods = new ClientErc20Methods(context);
    this.privateEncoding = new ClientErc20Encoding(context);
    this.privateDecoding = new ClientErc20Decoding(context);
    this.privateEstimation = new ClientErc20Estimation(context);
  }
  get methods(): IClientErc20Methods {
    return this.privateMethods;
  }
  get encoding(): IClientErc20Encoding {
    return this.privateEncoding;
  }
  get decoding(): IClientErc20Decoding {
    return this.privateDecoding;
  }
  get estimation(): IClientErc20Estimation {
    return this.privateEstimation;
  }

  static encoding = {
    /**
     * Computes the parameters to be given when creating the DAO,
     * so that the plugin is configured
     *
     * @param {IErc20PluginInstall} params
     * @return {*}  {IPluginInstallItem}
     * @memberof ClientErc20
     */
    getPluginInstallItem: (params: IErc20PluginInstall): IPluginInstallItem =>
      ClientErc20Encoding.getPluginInstallItem(params),
  };
}
