import {
  hexToBytes,
  InvalidAddressError,
  UnsupportedNetworkError,
} from "@aragon/sdk-common";
import { isAddress } from "@ethersproject/address";
import {
  ClientCore,
  ContextPlugin,
  DaoAction,
  IPluginInstallItem,
  SupportedNetworks,
  SupportedNetworksArray,
} from "../../../client-common";
import {
  AddAddressesParams,
  IMultisigClientEncoding,
  MultisigPluginInstallParams,
  RemoveAddressesParams,
  UpdateMultisigVotingSettingsParams,
} from "../../interfaces";
// @ts-ignore
// todo fix new contracts-ethers
import { Multisig__factory } from "@aragon/osx-ethers";
import { defaultAbiCoder } from "@ethersproject/abi";
import { LIVE_CONTRACTS } from "../../../client-common/constants";
import { getNetwork, Networkish } from "@ethersproject/providers";

/**
 * Encoding module for the SDK Multisig Client
 */
export class MultisigClientEncoding extends ClientCore
  implements IMultisigClientEncoding {
  constructor(context: ContextPlugin) {
    super(context);
    Object.freeze(MultisigClientEncoding.prototype);
    Object.freeze(this);
  }

  /**
   * Computes the parameters to be given when creating the DAO,
   * so that the plugin is configured
   *
   * @param {MultisigPluginInstallParams} params
   * @param {Networkish} network
   *
   * @return {*}  {IPluginInstallItem}
   * @memberof MultisigClientEncoding
   */
  static getPluginInstallItem(
    params: MultisigPluginInstallParams,
    network: Networkish,
  ): IPluginInstallItem {
    const networkName = getNetwork(network).name as SupportedNetworks
    if (!SupportedNetworksArray.includes(networkName)) {
      throw new UnsupportedNetworkError(networkName);
    }
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
          params.votingSettings.minApprovals,
        ],
      ],
    );
    return {
      id: LIVE_CONTRACTS[networkName].multisigRepo,
      data: hexToBytes(hexBytes),
    };
  }

  /**
   * Computes the parameters to be given when creating a proposal that updates the governance configuration
   *
   * @param {AddAddressesParams} params
   * @return {*}  {DaoAction[]}
   * @memberof MultisigClientEncoding
   */
  public addAddressesAction(
    params: AddAddressesParams,
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
    const multisigInterface = Multisig__factory.createInterface();
    // get hex bytes
    const hexBytes = multisigInterface.encodeFunctionData(
      "addAddresses",
      [params.members],
    );
    return {
      to: params.pluginAddress,
      value: BigInt(0),
      data: hexToBytes(hexBytes),
    };
  }
  /**
   * Computes the parameters to be given when creating a proposal that adds addresses to address list
   *
   * @param {RemoveAddressesParams} params
   * @return {*}  {DaoAction[]}
   * @memberof MultisigClientEncoding
   */
  public removeAddressesAction(
    params: RemoveAddressesParams,
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
    const multisigInterface = Multisig__factory.createInterface();
    // get hex bytes
    const hexBytes = multisigInterface.encodeFunctionData(
      "removeAddresses",
      [params.members],
    );
    return {
      to: params.pluginAddress,
      value: BigInt(0),
      data: hexToBytes(hexBytes),
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
    if (!isAddress(params.pluginAddress)) {
      throw new InvalidAddressError();
    }
    const multisigInterface = Multisig__factory.createInterface();
    // get hex bytes
    const hexBytes = multisigInterface.encodeFunctionData(
      "updateMultisigSettings",
      [params.votingSettings],
    );
    return {
      to: params.pluginAddress,
      value: BigInt(0),
      data: hexToBytes(hexBytes),
    };
  }
}
