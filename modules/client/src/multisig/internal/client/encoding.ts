import {
  hexToBytes,
  InvalidAddressError,
  InvalidAddressOrEnsError,
  strip0x,
} from "@aragon/sdk-common";
import { isAddress } from "@ethersproject/address";
import {
  ClientCore,
  ContextPlugin,
  DaoAction,
  IPluginInstallItem,
} from "../../../client-common";
import {
  IMultisigClientEncoding,
} from "../../interfaces";
// @ts-ignore
// todo fix new contracts-ethers
import { MultisigVoting__factory } from "@aragon/core-contracts-ethers";
import { MULTISIG_PLUGIN_ID } from "../constants";

/**
 * Encoding module for the SDK Multisig Client
 */
export class MultisigClientEncoding extends ClientCore
  implements IMultisigClientEncoding {
  constructor(context: ContextPlugin) {
    super(context);
  }

  /**
   * Computes the parameters to be given when creating the DAO,
   * so that the plugin is configured
   *
   * @param {string[]} members
   * @return {*}  {IPluginInstallItem}
   * @memberof MultisigClientEncoding
   */
  static getPluginInstallItem(
    members: string[],
  ): IPluginInstallItem {
    const multisigInterface = MultisigVoting__factory.createInterface();
    // get hex bytes
    const hexBytes = multisigInterface.encodeFunctionData(
      "initialize",
      [members],
    );
    const data = hexToBytes(strip0x(hexBytes));
    return {
      id: MULTISIG_PLUGIN_ID,
      data,
    };
  }

  /**
   * Computes the parameters to be given when creating a proposal that updates the governance configuration
   *
   * @param {string} pluginAddress
   * @param {string[]} members
   * @return {*}  {DaoAction}
   * @memberof MultisigClientEncoding
   */
  public addMembersAction(
    pluginAddress: string,
    members: string[],
  ): DaoAction {
    if (!isAddress(pluginAddress)) {
      throw new InvalidAddressOrEnsError();
    }
    for (const member of members) {
      if (!isAddress(member)) {
        throw new InvalidAddressError();
      }
    }
    // TODO
    // fix 
    const multisigInterface = MultisigVoting__factory.createInterface();
    const hexBytes = multisigInterface.encodeFunctionData(
      "addAllowedUsers",
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
   * Computes the parameters to be given when creating a proposal that adds addresses to address list
   *
   * @param {string} pluginAddress
   * @param {string[]} members
   * @return {*}  {DaoAction}
   * @memberof MultisigClientEncoding
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
    const multisigInterface = MultisigVoting__factory.createInterface();
    // get hex bytes
    const hexBytes = multisigInterface.encodeFunctionData(
      // TODO: Rename to `addAddresses` as soon as the plugin is updated
      "removeAllowedUsers",
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
