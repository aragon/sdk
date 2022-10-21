import { bytesToHex } from "@aragon/sdk-common";
import { ContextPlugin } from "../../context-plugin";
import { ClientCore } from "../core";
import {
  decodeMintTokenAction,
  decodeUpdatePluginSettingsAction,
  getFunctionFragment,
} from "../encoding/plugins";
import { IInterfaceParams } from "../interfaces/common";
import {
  IClientErc20Decoding,
  IMintTokenParams,
  IPluginSettings,
} from "../interfaces/plugins";

export class ClientErc20Decoding extends ClientCore
  implements IClientErc20Decoding {
  constructor(context: ContextPlugin) {
    super(context);
  }
  /**
   * Decodes a dao metadata from an encoded update metadata action
   *
   * @param {Uint8Array} data
   * @return {*}  {IPluginSettings}
   * @memberof ClientErc20Decoding
   */
  public updatePluginSettingsAction(data: Uint8Array): IPluginSettings {
    return decodeUpdatePluginSettingsAction(data);
  }
  /**
   * Decodes the mint token params from an encoded mint token action
   *
   * @param {Uint8Array} data
   * @return {*}  {IMintTokenParams}
   * @memberof ClientErc20Decoding
   */
  public mintTokenAction(data: Uint8Array): IMintTokenParams {
    return decodeMintTokenAction(data);
  }
  /**
   * Returns the decoded function info given the encoded data of an action
   *
   * @param {Uint8Array} data
   * @return {*}  {(IInterfaceParams | null)}
   * @memberof ClientErc20Decoding
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
