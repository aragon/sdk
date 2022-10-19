import { InvalidAddressError } from "@aragon/sdk-common";
import { ContextPlugin } from "../../context-plugin";
import { ClientCore } from "../core";
import {
  encodeErc20ActionInit,
  encodeMintTokenAction,
  encodeUpdatePluginSettingsAction,
} from "../encoding/plugins";
import { DaoAction, IPluginInstallItem } from "../interfaces/common";
import {
  IClientErc20Encoding,
  IErc20PluginInstall,
  IMintTokenParams,
  IPluginSettings,
} from "../interfaces/plugins";
import { isAddress } from "@ethersproject/address";

// NOTE: This address needs to be set when the plugin has been published and the ID is known
const PLUGIN_ID = "0x1234567890123456789012345678901234567890";

export class ClientErc20Encoding extends ClientCore
  implements IClientErc20Encoding {
  constructor(context: ContextPlugin) {
    super(context);
  }
  /**
   * Computes the parameters to be given when creating the DAO,
   * so that the plugin is configured
   *
   * @param {IErc20PluginInstall} params
   * @return {*}  {IPluginInstallItem}
   * @memberof ClientErc20Encoding
   */
  static getPluginInstallItem(params: IErc20PluginInstall): IPluginInstallItem {
    return {
      id: PLUGIN_ID,
      data: encodeErc20ActionInit(params),
    };
  }
  /**
   * Computes the parameters to be given when creating a proposal that updates the governance configuration
   *
   * @param {string} pluginAddress
   * @param {IPluginSettings} params
   * @return {*}  {DaoAction}
   * @memberof ClientErc20Encoding
   */
  public updatePluginSettingsAction(
    pluginAddress: string,
    params: IPluginSettings,
  ): DaoAction {
    if (!isAddress(pluginAddress)) {
      throw new Error("Invalid plugin address");
    }
    // TODO: check if to and value are correct
    return {
      to: pluginAddress,
      value: BigInt(0),
      data: encodeUpdatePluginSettingsAction(params),
    };
  }

  /**
   * Computes the parameters to be given when creating a proposal that mints an amount of ERC-20 tokens to an address
   *
   * @param {string} minterAddress
   * @param {IMintTokenParams} params
   * @return {*}  {DaoAction}
   * @memberof ClientErc20Encoding
   */
  public mintTokenAction(
    minterAddress: string,
    params: IMintTokenParams,
  ): DaoAction {
    if (!isAddress(minterAddress) || !isAddress(params.address)) {
      throw new InvalidAddressError();
    }
    return {
      to: minterAddress,
      value: BigInt(0),
      data: encodeMintTokenAction(params),
    };
  }
}
