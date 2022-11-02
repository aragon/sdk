import { hexToBytes, InvalidAddressError, strip0x } from "@aragon/sdk-common";
import { isAddress } from "@ethersproject/address";
import {
  ClientCore,
  ContextPlugin,
  DaoAction,
  encodeUpdatePluginSettingsAction,
  IPluginInstallItem,
  IPluginSettings,
} from "../../../client-common";
import { ADDRESSLIST_PLUGIN_ID } from "../constants";
import {
  IAddressListPluginInstall,
  IClientAddressListEncoding,
} from "../../interfaces";
import { WhitelistVoting__factory } from "@aragon/core-contracts-ethers";
import { addressListInitParamsToContract } from "../utils";

export class ClientAddressListEncoding extends ClientCore
  implements IClientAddressListEncoding {
  constructor(context: ContextPlugin) {
    super(context);
    Object.freeze(ClientAddressListEncoding.prototype);
    Object.freeze(this);
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
    const addressListVotingInterface = WhitelistVoting__factory.createInterface();
    const args = addressListInitParamsToContract(params);
    // get hex bytes
    const hexBytes = addressListVotingInterface.encodeFunctionData(
      "initialize",
      args,
    );
    // Strip 0x => encode in Uint8Array
    const data = hexToBytes(strip0x(hexBytes));
    return {
      id: ADDRESSLIST_PLUGIN_ID,
      data,
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
    const votingInterface = WhitelistVoting__factory.createInterface();
    // get hex bytes
    const hexBytes = votingInterface.encodeFunctionData(
      // TODO: Rename to `addAddresses` as soon as the plugin is updated
      "addWhitelistedUsers",
      [members],
    );
    const data = hexToBytes(strip0x(hexBytes));
    return {
      to: pluginAddress,
      value: BigInt(0),
      data,
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
    const votingInterface = WhitelistVoting__factory.createInterface();
    // get hex bytes
    const hexBytes = votingInterface.encodeFunctionData(
      // TODO: Rename to `removeAddresses` as soon as the plugin is updated
      "removeWhitelistedUsers",
      [members],
    );
    const data = hexToBytes(strip0x(hexBytes));
    return {
      to: pluginAddress,
      value: BigInt(0),
      data,
    };
  }
}
