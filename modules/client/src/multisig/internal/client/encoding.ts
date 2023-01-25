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
  UpdateMultisigVotingSettingsParams,
} from "../../interfaces";
// @ts-ignore
// todo fix new contracts-ethers
import { Multisig__factory } from "@aragon/core-contracts-ethers";
import { MULTISIG_PLUGIN_ID } from "../constants";
import { defaultAbiCoder } from "@ethersproject/abi";
import { toUtf8Bytes } from "@ethersproject/strings";
import { tokenVotingInstallSchema, updateAddressesSchema, updateMultisigVotingSettingsSchema } from "../schemas";

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
   * @param {MultisigPluginInstallParams} params
   * @return {*}  {IPluginInstallItem}
   * @memberof MultisigClientEncoding
   */
  static getPluginInstallItem(
    params: MultisigPluginInstallParams,
  ): IPluginInstallItem {
    tokenVotingInstallSchema.validateSync(params)
    const hexBytes = defaultAbiCoder.encode(
      // members, [onlyListed, minApprovals]
      [
        "address[]",
        "tuple(bool, uint16)",
      ],
      [
       params.members,
       [
        params.votingSettings.onlyListed,
        params.votingSettings.minApprovals
       ]
      ],
    );
    return {
      id: MULTISIG_PLUGIN_ID,
      data: toUtf8Bytes(hexBytes)
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
    updateAddressesSchema.validateSync(params)
    const multisigInterface = Multisig__factory.createInterface();
    // get hex bytes
    const hexBytes = multisigInterface.encodeFunctionData(
      "addAddresses",
      [params.members],
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
    updateAddressesSchema.validateSync(params)
    const multisigInterface = Multisig__factory.createInterface();
    // get hex bytes
    const hexBytes = multisigInterface.encodeFunctionData(
      "removeAddresses",
      [params.members],
    );
    const data = hexToBytes(strip0x(hexBytes));
    return {
      to: params.pluginAddress,
      value: BigInt(0),
      data,
    };
  }
  /**
   * Computes the parameters to be given when creating a proposal updates multisig settings
   *
   * @param {UpdateMultisigVotingSettingsParams} params
   * @return {*}  {DaoAction}
   * @memberof MultisigClientEncoding
   */
  public updateMultisigVotingSettings(
    params: UpdateMultisigVotingSettingsParams,
  ): DaoAction {
    updateMultisigVotingSettingsSchema.validateSync(params)

    const multisigInterface = Multisig__factory.createInterface();
    // get hex bytes
    const hexBytes = multisigInterface.encodeFunctionData(
      "updateMultisigSettings",
      [params.votingSettings],
    );
    const data = hexToBytes(strip0x(hexBytes));
    return {
      to: params.pluginAddress,
      value: BigInt(0),
      data,
    };
  }
}
