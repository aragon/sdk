import { hexToBytes, InvalidAddressError } from "@aragon/sdk-common";
import { isAddress } from "@ethersproject/address";
import {
  ClientCore,
  ContextPlugin,
  // ContractVotingSettings,
  DaoAction,
  encodeUpdateVotingSettingsAction,
  IPluginInstallItem,
  VotingSettings,
  votingSettingsToContract,
} from "../../../client-common";
import {
  IAddresslistVotingClientEncoding,
  IAddresslistVotingPluginInstall,
} from "../../interfaces";
import {
  activeContractsList,
  AddresslistVoting__factory,
} from "@aragon/core-contracts-ethers";
import { defaultAbiCoder } from "@ethersproject/abi";
import { Networkish } from "@ethersproject/providers";

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
    network: Networkish,
  ): IPluginInstallItem {
    const {
      votingMode,
      supportThreshold,
      minParticipation,
      minDuration,
      minProposerVotingPower,
    } = votingSettingsToContract(params.votingSettings);

    const hexBytes = defaultAbiCoder.encode(
      [
        "tuple(uint8 votingMode, uint64 supportThreshold, uint64 minParticipation, uint64 minDuration, uint256 minProposerVotingPower) votingSettings",
        "address[] members",
      ],
      [
        [
          votingMode,
          supportThreshold,
          minParticipation,
          minDuration,
          minProposerVotingPower,
        ],
        params.addresses,
      ],
    );

    return {
      // TODO remove tsiginore once all the networks have the same properties
      // @ts-ignore
      id: activeContractsList[
        network.toString() as keyof typeof activeContractsList
      ]["address-list-voting-repo"],
      data: hexToBytes(hexBytes),
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
    if (!isAddress(pluginAddress)) {
      throw new InvalidAddressError();
    }
    // TODO: check if to and value are correct
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
    if (!isAddress(pluginAddress)) {
      throw new InvalidAddressError();
    }
    for (const member of members) {
      if (!isAddress(member)) {
        throw new InvalidAddressError();
      }
    }
    const votingInterface = AddresslistVoting__factory.createInterface();
    // get hex bytes
    const hexBytes = votingInterface.encodeFunctionData(
      "addAddresses",
      [members],
    );
    return {
      to: pluginAddress,
      value: BigInt(0),
      data: hexToBytes(hexBytes),
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
    if (!isAddress(pluginAddress)) {
      throw new InvalidAddressError();
    }
    for (const member of members) {
      if (!isAddress(member)) {
        throw new InvalidAddressError();
      }
    }
    const votingInterface = AddresslistVoting__factory.createInterface();
    // get hex bytes
    const hexBytes = votingInterface.encodeFunctionData(
      "removeAddresses",
      [members],
    );
    return {
      to: pluginAddress,
      value: BigInt(0),
      data: hexToBytes(hexBytes),
    };
  }
}
