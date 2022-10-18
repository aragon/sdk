import {
  IClientErc20,
  IClientErc20Decoding,
  IClientErc20Encoding,
  IClientErc20Estimation,
  IClientErc20Methods,
  IErc20PluginInstall,
} from "./internal/interfaces/plugins";
import { IClientErc20MethodsModule } from "./modules-erc20/methods";
import { ContextPlugin } from "./context-plugin";
import { IClientErc20EncodingModule } from "./modules-erc20/encoding";
import { IClientErc20DecodingModule } from "./modules-erc20/decoding";
import { IClientErc20EstimationModule } from "./modules-erc20/estimation";
import { IPluginInstallItem } from "./internal/interfaces/common";
import { encodeErc20ActionInit } from "./internal/encoding/plugins";
import { ClientCore } from "./internal/core";

// NOTE: This address needs to be set when the plugin has been published and the ID is known
const PLUGIN_ID = "0x1234567890123456789012345678901234567890";
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
    this.methods = new IClientErc20MethodsModule(context);
    this.encoding = new IClientErc20EncodingModule(context);
    this.decoding = new IClientErc20DecodingModule(context);
    this.estimation = new IClientErc20EstimationModule(context);
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
    getPluginInstallItem: (params: IErc20PluginInstall): IPluginInstallItem => {
      return {
        id: PLUGIN_ID,
        data: encodeErc20ActionInit(params),
      };
    },
  };
}
