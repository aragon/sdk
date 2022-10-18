import { InvalidAddressError } from "@aragon/sdk-common";
import { ContextPlugin } from "../context-plugin";
import { ClientCore } from "../internal/core";
import {
  encodeMintTokenAction,
  encodeUpdatePluginSettingsAction,
} from "../internal/encoding/plugins";
import { DaoAction } from "../internal/interfaces/common";
import {
  IClientErc20Encoding,
  IMintTokenParams,
  IPluginSettings,
} from "../internal/interfaces/plugins";
import { isAddress } from "@ethersproject/address";

export class IClientErc20EncodingModule extends ClientCore
  implements IClientErc20Encoding {
  constructor(context: ContextPlugin) {
    super(context);
  }
  /**
   * Computes the parameters to be given when creating a proposal that updates the governance configuration
   *
   * @param {string} pluginAddress
   * @param {IPluginSettings} params
   * @return {*}  {DaoAction}
   * @memberof IClientErc20EncodingModule
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
   * @memberof IClientErc20EncodingModule
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
