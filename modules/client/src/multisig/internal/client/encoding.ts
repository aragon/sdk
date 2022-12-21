import {
  hexToBytes,
  InvalidAddressError,
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
  MultisigPluginInstallParams,
  UpdateAddressesParams,
  UpdateMinApprovalsParams,
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
    params: MultisigPluginInstallParams,
  ): IPluginInstallItem {
    const multisigInterface = MultisigVoting__factory.createInterface();
    // get hex bytes
    const hexBytes = multisigInterface.encodeFunctionData(
      "initialize",
      [params.minApprovals, params.members],
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
   * @param {UpdateAddressesParams} params
   * @return {*}  {DaoAction}
   * @memberof MultisigClientEncoding
   */
  public addAddressesAction(
    params: UpdateAddressesParams,
  ): DaoAction {
    if (!isAddress(params.pluginAddress)) {
      throw new InvalidAddressError();
    }
    // TODO yup validation
    for (const member of params.members) {
      if (!isAddress(member)) {
        throw new InvalidAddressError();
      }
    }
    const multisigInterface = MultisigVoting__factory.createInterface();
    // get hex bytes
    const hexBytes = multisigInterface.encodeFunctionData(
      "addAddresses",
      [params.members, params.minApprovals],
    );
    const data = hexToBytes(strip0x(hexBytes));
    return {
      to: params.pluginAddress,
      value: BigInt(0),
      data,
    };
  }
  /**
   * Computes the parameters to be given when creating a proposal that adds addresses to address list
   *
   * @param {UpdateAddressesParams} params
   * @return {*}  {DaoAction}
   * @memberof MultisigClientEncoding
   */
  public removeAddressesAction(
    params: UpdateAddressesParams,
  ): DaoAction {
    if (!isAddress(params.pluginAddress)) {
      throw new InvalidAddressError();
    }
    // TODO yup validation
    for (const member of params.members) {
      if (!isAddress(member)) {
        throw new InvalidAddressError();
      }
    }
    const multisigInterface = MultisigVoting__factory.createInterface();
    // get hex bytes
    const hexBytes = multisigInterface.encodeFunctionData(
      "removeAddresses",
      [params.members, params.minApprovals],
    );
    const data = hexToBytes(strip0x(hexBytes));
    return {
      to: params.pluginAddress,
      value: BigInt(0),
      data,
    };
  }
  /**
   * Computes the parameters to be given when creating a proposal updates the min approvals parameter
   *
   * @param {UpdateMinApprovalsParams} params
   * @return {*}  {DaoAction}
   * @memberof MultisigClientEncoding
   */
  public updateMinApprovalsAction(
    params: UpdateMinApprovalsParams,
  ): DaoAction {
    if (!isAddress(params.pluginAddress)) {
      throw new InvalidAddressError();
    }
    const multisigInterface = MultisigVoting__factory.createInterface();
    // get hex bytes
    const hexBytes = multisigInterface.encodeFunctionData(
      "updateMinApprovals",
      [params.minApprovals],
    );
    const data = hexToBytes(strip0x(hexBytes));
    return {
      to: params.pluginAddress,
      value: BigInt(0),
      data,
    };
  }
}
