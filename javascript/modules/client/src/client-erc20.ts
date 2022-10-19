import {
  IClientErc20,
  IClientErc20Decoding,
  IClientErc20Encoding,
  IClientErc20Estimation,
  IClientErc20Methods,
  IErc20PluginInstall,
} from "./internal/interfaces/plugins";
import { ClientErc20Methods } from "./internal/client-erc20/methods";
import { ContextPlugin } from "./context-plugin";
import { ClientErc20Encoding } from "./internal/client-erc20/encoding";
import { ClientErc20Decoding } from "./internal/client-erc20/decoding";
import { ClientErc20Estimation } from "./internal/client-erc20/estimation";
import { IPluginInstallItem } from "./internal/interfaces/common";
import { ClientCore } from "./internal/core";

/**
 * Provider a generic client with high level methods to manage and interact an ERC20 Voting plugin installed in a DAO
 */
export class ClientErc20 extends ClientCore implements IClientErc20 {
  public methods: IClientErc20Methods;
  public encoding: IClientErc20Encoding;
  public decoding: IClientErc20Decoding;
  public estimation: IClientErc20Estimation;

  constructor(context: ContextPlugin) {
    super(context);
    this.methods = new ClientErc20Methods(context);
    this.encoding = new ClientErc20Encoding(context);
    this.decoding = new ClientErc20Decoding(context);
    this.estimation = new ClientErc20Estimation(context);
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
     * @param {IErc20PluginInstall} params
     * @return {*}  {IPluginInstallItem}
     * @memberof ClientErc20
     */
    getPluginInstallItem: (params: IErc20PluginInstall): IPluginInstallItem =>
      ClientErc20Encoding.getPluginInstallItem(params),
  };
}
