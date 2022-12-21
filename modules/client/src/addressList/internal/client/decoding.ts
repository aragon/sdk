import { bytesToHex, UnexpectedActionError } from "@aragon/sdk-common";
import {
  ClientCore,
  ContextPlugin,
  decodeUpdatePluginSettingsAction,
  getFunctionFragment,
  IInterfaceParams,
  IPluginSettings,
} from "../../../client-common";
import { AVAILABLE_FUNCTION_SIGNATURES } from "../constants";
import { IClientAddressListDecoding } from "../../interfaces";
import { AddresslistVoting__factory } from "@aragon/core-contracts-ethers";

/**
 * Decoding module for the SDK AddressList Client
 */
export class ClientAddressListDecoding extends ClientCore
  implements IClientAddressListDecoding {
  constructor(context: ContextPlugin) {
    super(context);
    Object.freeze(ClientAddressListDecoding.prototype);
    Object.freeze(this);
  }

  /**
   * Decodes a dao metadata from an encoded update metadata action
   *
   * @param {Uint8Array} data
   * @return {*}  {IPluginSettings}
   * @memberof ClientAddressListDecoding
   */
  public updatePluginSettingsAction(data: Uint8Array): IPluginSettings {
    return decodeUpdatePluginSettingsAction(data);
  }
  /**
   * Decodes a list of addresses from an encoded add members action
   *
   * @param {Uint8Array} data
   * @return {*}  {string[]}
   * @memberof ClientAddressListDecoding
   */
  public addAddressesAction(data: Uint8Array): string[] {
    const votingInterface = AddresslistVoting__factory.createInterface();
    const hexBytes = bytesToHex(data, true);
    const receivedFunction = votingInterface.getFunction(
      hexBytes.substring(0, 10) as any,
    );
    // TODO: Rename to `addAddresses` as soon as the plugin is updated
    const expectedfunction = votingInterface.getFunction("addAddresses");
    if (receivedFunction.name !== expectedfunction.name) {
      throw new UnexpectedActionError();
    }
    const result = votingInterface.decodeFunctionData(
      // TODO: Rename to `addAddresses` as soon as the plugin is updated
      "addAllowedUsers",
      data,
    );
    return result[0];
  }
  /**
   * Decodes a list of addresses from an encoded remove members action
   *
   * @param {Uint8Array} data
   * @return {*}  {string[]}
   * @memberof ClientAddressListDecoding
   */
  public removeAddressesAction(data: Uint8Array): string[] {
    const votingInterface = AddresslistVoting__factory.createInterface();
    const hexBytes = bytesToHex(data, true);
    const receivedFunction = votingInterface.getFunction(
      hexBytes.substring(0, 10) as any,
    );
    const expectedfunction = votingInterface.getFunction(
      "removeAddresses",
    );
    if (receivedFunction.name !== expectedfunction.name) {
      throw new UnexpectedActionError();
    }
    const result = votingInterface.decodeFunctionData(
      "removeAddresses",
      data,
    );
    return result[0];
  }
  /**
   * Returns the decoded function info given the encoded data of an action
   *
   * @param {Uint8Array} data
   * @return {*}  {(IInterfaceParams | null)}
   * @memberof ClientAddressListDecoding
   */
  public findInterface(data: Uint8Array): IInterfaceParams | null {
    try {
      const func = getFunctionFragment(data, AVAILABLE_FUNCTION_SIGNATURES);
      return {
        id: func.format("minimal"),
        functionName: func.name,
        hash: bytesToHex(data, true).substring(0, 10),
      };
    } catch {
      return null;
    }
  }
}
