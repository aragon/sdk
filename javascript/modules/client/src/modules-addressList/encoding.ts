import { InvalidAddressError } from "@aragon/sdk-common";
import { ContextPlugin } from "../context-plugin";
import { ClientCore } from "../internal/core";
import {
  encodeAddMembersAction,
  encodeRemoveMembersAction,
  encodeUpdatePluginSettingsAction,
} from "../internal/encoding/plugins";
import { DaoAction } from "../internal/interfaces/common";
import {
  IClientAddressListEncoding,
  IPluginSettings,
} from "../internal/interfaces/plugins";
import { isAddress } from "@ethersproject/address";

export class IClientAddressListEncodingModule extends ClientCore
  implements IClientAddressListEncoding {
  constructor(context: ContextPlugin) {
    super(context);
  }
  
  /**
   * Computes the parameters to be given when creating a proposal that updates the governance configuration
   *
   * @param {string} pluginAddress
   * @param {IPluginSettings} params
   * @return {*}  {DaoAction}
   * @memberof IClientAddressListEncodingModule
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
   * Computes the parameters to be given when creating a proposal that adds addresses to address list
   *
   * @param {string} pluginAddress
   * @param {string[]} members
   * @return {*}  {DaoAction}
   * @memberof IClientAddressListEncodingModule
   */
  public addMembersAction(
    pluginAddress: string,
    members: string[],
  ): DaoAction {
    if (!isAddress(pluginAddress)) {
      throw new InvalidAddressError();
    }
    for (const member of members) {
      if (!isAddress(member)) {
        throw new InvalidAddressError();
      }
    }
    return {
      to: pluginAddress,
      value: BigInt(0),
      data: encodeAddMembersAction(members),
    };
  }
  /**
   * Computes the parameters to be given when creating a proposal that removes addresses from the address list
   *
   * @param {string} pluginAddress
   * @param {string[]} members
   * @return {*}  {DaoAction}
   * @memberof IClientAddressListEncodingModule
   */
  public removeMembersAction(
    pluginAddress: string,
    members: string[],
  ): DaoAction {
    if (!isAddress(pluginAddress)) {
      throw new InvalidAddressError();
    }
    for (const member of members) {
      if (!isAddress(member)) {
        throw new InvalidAddressError();
      }
    }
    return {
      to: pluginAddress,
      value: BigInt(0),
      data: encodeRemoveMembersAction(members),
    };
  }
}
