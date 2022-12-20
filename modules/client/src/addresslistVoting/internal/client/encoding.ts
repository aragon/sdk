import { hexToBytes, strip0x } from "@aragon/sdk-common";
import {
  addressOrEnsSchema,
  ClientCore,
  ContextPlugin,
  ContractVotingSettings,
  DaoAction,
  encodeUpdateVotingSettingsAction,
  IPluginInstallItem,
  VotingSettings,
  votingSettingsToContract,
  votingSettingsSchema,
} from "../../../client-common";
import { ADDRESSLIST_PLUGIN_ID } from "../constants";
import {
  IAddresslistVotingPluginInstall,
  IAddresslistVotingClientEncoding,
} from "../../interfaces";
import { AddresslistVoting__factory } from "@aragon/core-contracts-ethers";
import { defaultAbiCoder } from "@ethersproject/abi";
import { toUtf8Bytes } from "@ethersproject/strings";
import { addressListPluginInstallSchema, membersSchema } from "../../schemas";

/**
 * Encoding module for the SDK AddressList Client
 */
export class AddresslistVotingClientEncoding extends ClientCore
  implements IAddresslistVotingClientEncoding {
  constructor(context: ContextPlugin) {
    super(context);
    Object.freeze(AddresslistVotingClientEncoding.prototype);
    Object.freeze(this);
  }

  /**
   * Computes the parameters to be given when creating the DAO,
   * so that the plugin is configured
   *
   * @param {IAddresslistVotingPluginInstall} params
   * @return {*}  {IPluginInstallItem}
   * @memberof AddresslistVotingClientEncoding
   */
  static getPluginInstallItem(
    params: IAddresslistVotingPluginInstall,
  ): IPluginInstallItem {
    addressListPluginInstallSchema.validateSync(params);
    const hexBytes = defaultAbiCoder.encode(
      // ["votingMode","supportThreshold", "minParticipation", "minDuration"], "members"]
      [
        "tuple(uint8, uint64, uint64, uint64, uint256)",
        "address[]",
      ],
      [
        Object.values(
          votingSettingsToContract(params.votingSettings),
        ) as ContractVotingSettings,
        params.addresses,
      ],
    );
    return {
      id: ADDRESSLIST_PLUGIN_ID,
      data: toUtf8Bytes(hexBytes),
    };
  }

  /**
   * Computes the parameters to be given when creating a proposal that updates the governance configuration
   *
   * @param {string} pluginAddress
   * @param {VotingSettings} params
   * @return {*}  {DaoAction}
   * @memberof AddresslistVotingClientEncoding
   */
  public updatePluginSettingsAction(
    pluginAddress: string,
    params: VotingSettings,
  ): DaoAction {
    addressOrEnsSchema.validateSync(pluginAddress);
    votingSettingsSchema.validateSync(params);
    return {
      to: pluginAddress,
      value: BigInt(0),
      data: encodeUpdateVotingSettingsAction(params),
    };
  }
  /**
   * Computes the parameters to be given when creating a proposal that adds addresses to address list
   *
   * @param {string} pluginAddress
   * @param {string[]} members
   * @return {*}  {DaoAction}
   * @memberof AddresslistVotingClientEncoding
   */
  public addMembersAction(pluginAddress: string, members: string[]): DaoAction {
    addressOrEnsSchema.validateSync(pluginAddress);
    membersSchema.validateSync(members);
    const votingInterface = AddresslistVoting__factory.createInterface();
    // get hex bytes
    const hexBytes = votingInterface.encodeFunctionData(
      "addAddresses",
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
   * @memberof AddresslistVotingClientEncoding
   */
  public removeMembersAction(
    pluginAddress: string,
    members: string[],
  ): DaoAction {
    addressOrEnsSchema.validateSync(pluginAddress);
    membersSchema.validateSync(members);
    const votingInterface = AddresslistVoting__factory.createInterface();
    // get hex bytes
    const hexBytes = votingInterface.encodeFunctionData(
      "removeAddresses",
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
