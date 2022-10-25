import { InvalidAddressError } from "@aragon/sdk-common";
import { isAddress } from "@ethersproject/address";
import { ClientCore } from "../../../internal/core";
import {
  DaoAction,
  IPluginInstallItem,
} from "../../../internal/interfaces/common";
import {
  ContextPlugin,
  encodeUpdatePluginSettingsAction,
  IPluginSettings,
} from "../../../plugin-common";
import { ADDRESSLIST_PLUGIN_ID } from "../constant";
import {
  encodeAddMembersAction,
  encodeAddressListActionInit,
  encodeRemoveMembersAction,
} from "../encoding";
import {
  IAddressListPluginInstall,
  IClientAddressListEncoding,
} from "../interfaces/client";

export class ClientAddressListEncoding extends ClientCore
  implements IClientAddressListEncoding {
  constructor(context: ContextPlugin) {
    super(context);
  }

  /**
   * Computes the parameters to be given when creating the DAO,
   * so that the plugin is configured
   *
   * @param {IAddressListPluginInstall} params
   * @return {*}  {IPluginInstallItem}
   * @memberof ClientAddressListEncoding
   */
  static getPluginInstallItem(
    params: IAddressListPluginInstall,
  ): IPluginInstallItem {
    return {
      id: ADDRESSLIST_PLUGIN_ID,
      data: encodeAddressListActionInit(params),
    };
  }

  /**
   * Computes the parameters to be given when creating a proposal that updates the governance configuration
   *
   * @param {string} pluginAddress
   * @param {IPluginSettings} params
   * @return {*}  {DaoAction}
   * @memberof ClientAddressListEncoding
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
   * @memberof ClientAddressListEncoding
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
   * @memberof ClientAddressListEncoding
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
