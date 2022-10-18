import { bytesToHex } from "@aragon/sdk-common";
import { ContextPlugin } from "../context-plugin";
import { ClientCore } from "../internal/core";
import {
  decodeMintTokenAction,
  decodeUpdatePluginSettingsAction,
  getFunctionFragment,
} from "../internal/encoding/plugins";
import { IInterfaceParams } from "../internal/interfaces/common";
import {
  IClientErc20Decoding,
  IMintTokenParams,
  IPluginSettings,
} from "../internal/interfaces/plugins";

export class IClientErc20DecodingModule extends ClientCore
  implements IClientErc20Decoding {
  constructor(context: ContextPlugin) {
    super(context);
  }
  /**
   * Decodes a dao metadata from an encoded update metadata action
   *
   * @param {Uint8Array} data
   * @return {*}  {IPluginSettings}
   * @memberof IClientErc20DecodingModule
   */
  public updatePluginSettingsAction(data: Uint8Array): IPluginSettings {
    return decodeUpdatePluginSettingsAction(data);
  }
  /**
   * Decodes the mint token params from an encoded mint token action
   *
   * @param {Uint8Array} data
   * @return {*}  {IMintTokenParams}
   * @memberof IClientErc20DecodingModule
   */
  public mintTokenAction(data: Uint8Array): IMintTokenParams {
    return decodeMintTokenAction(data);
  }
  /**
   * Returns the decoded function info given the encoded data of an action
   *
   * @param {Uint8Array} data
   * @return {*}  {(IInterfaceParams | null)}
   * @memberof IClientErc20DecodingModule
   */
  public findInterface(data: Uint8Array): IInterfaceParams | null {
    try {
      const func = getFunctionFragment(data);
      return {
        id: func.format("minimal"),
        functionName: func.name,
        hash: bytesToHex(data, true).substring(0, 10),
      };
    } catch {
      return null;
    }
  }
}
