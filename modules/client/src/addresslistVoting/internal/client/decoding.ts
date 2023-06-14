import { bytesToHex } from "@aragon/sdk-common";
import {
  decodeUpdatePluginSettingsAction,
  VotingSettings,
} from "../../../client-common";
import { AVAILABLE_FUNCTION_SIGNATURES } from "../constants";
import { IAddresslistVotingClientDecoding } from "../interfaces";
import { AddresslistVoting__factory } from "@aragon/osx-ethers";
import {
  ClientCore,
  getFunctionFragment,
  InterfaceParams,
} from "@aragon/sdk-client-common";

/**
 * Decoding module for the SDK AddressList Client
 */
export class AddresslistVotingClientDecoding extends ClientCore
  implements IAddresslistVotingClientDecoding {
  /**
   * Decodes a dao metadata from an encoded update metadata action
   *
   * @param {Uint8Array} data
   * @return {*}  {VotingSettings}
   * @memberof AddresslistVotingClientDecoding
   */
  public updatePluginSettingsAction(data: Uint8Array): VotingSettings {
    return decodeUpdatePluginSettingsAction(data);
  }
  /**
   * Decodes a list of addresses from an encoded add members action
   *
   * @param {Uint8Array} data
   * @return {*}  {string[]}
   * @memberof AddresslistVotingClientDecoding
   */
  public addMembersAction(data: Uint8Array): string[] {
    const votingInterface = AddresslistVoting__factory.createInterface();
    const hexBytes = bytesToHex(data);
    const expectedfunction = votingInterface.getFunction("addAddresses");
    const result = votingInterface.decodeFunctionData(
      expectedfunction,
      hexBytes,
    );
    return result[0];
  }
  /**
   * Decodes a list of addresses from an encoded remove members action
   *
   * @param {Uint8Array} data
   * @return {*}  {string[]}
   * @memberof AddresslistVotingClientDecoding
   */
  public removeMembersAction(data: Uint8Array): string[] {
    const votingInterface = AddresslistVoting__factory.createInterface();
    const hexBytes = bytesToHex(data);
    const expectedfunction = votingInterface.getFunction(
      "removeAddresses",
    );
    const result = votingInterface.decodeFunctionData(
      expectedfunction,
      hexBytes,
    );
    return result[0];
  }
  /**
   * Returns the decoded function info given the encoded data of an action
   *
   * @param {Uint8Array} data
   * @return {*}  {(InterfaceParams | null)}
   * @memberof AddresslistVotingClientDecoding
   */
  public findInterface(data: Uint8Array): InterfaceParams | null {
    try {
      const func = getFunctionFragment(data, AVAILABLE_FUNCTION_SIGNATURES);
      return {
        id: func.format("minimal"),
        functionName: func.name,
        hash: bytesToHex(data).substring(0, 10),
      };
    } catch {
      return null;
    }
  }
}
