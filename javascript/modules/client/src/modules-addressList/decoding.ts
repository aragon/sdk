import { bytesToHex } from "@aragon/sdk-common";
import { ContextPlugin } from "../context-plugin";
import { ClientCore } from "../internal/core";
import {
  decodeAddMemebersAction,
  decodeRemoveMemebersAction,
  decodeUpdatePluginSettingsAction,
  getFunctionFragment,
} from "../internal/encoding/plugins";
import { IInterfaceParams } from "../internal/interfaces/common";
import {
  IClientAddressListDecoding,
  IPluginSettings,
} from "../internal/interfaces/plugins";

export class IClientAddressListDecodingModule extends ClientCore
  implements IClientAddressListDecoding {
  constructor(context: ContextPlugin) {
    super(context);
  }

  /**
   * Decodes a dao metadata from an encoded update metadata action
   *
   * @param {Uint8Array} data
   * @return {*}  {IPluginSettings}
   * @memberof IClientAddressListDecodingModule
   */
  public updatePluginSettingsAction(data: Uint8Array): IPluginSettings {
    return decodeUpdatePluginSettingsAction(data);
  }
  /**
   * Decodes a list of addresses from an encoded add members action
   *
   * @param {Uint8Array} data
   * @return {*}  {string[]}
   * @memberof IClientAddressListDecodingModule
   */
  public addMembersAction(data: Uint8Array): string[] {
    return decodeAddMemebersAction(data);
  }
  /**
   * Decodes a list of addresses from an encoded remove members action
   *
   * @param {Uint8Array} data
   * @return {*}  {string[]}
   * @memberof IClientAddressListDecodingModule
   */
  public removeMembersAction(data: Uint8Array): string[] {
    return decodeRemoveMemebersAction(data);
  }
  /**
   * Returns the decoded function info given the encoded data of an action
   *
   * @param {Uint8Array} data
   * @return {*}  {(IInterfaceParams | null)}
   * @memberof IClientAddressListDecodingModule
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
