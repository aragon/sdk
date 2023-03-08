import { bytesToHex } from "@aragon/sdk-common";
import {
  ClientCore,
  ContextPlugin,
  getFunctionFragment,
  IInterfaceParams,
} from "../../../client-common";
import { AVAILABLE_FUNCTION_SIGNATURES } from "../constants";
import {
  IMultisigClientDecoding,
  MultisigPluginSettings,
  MultisigVotingSettings,
} from "../../interfaces";
// @ts-ignore
// todo fix new contracts-ethers
import { Multisig__factory } from "@aragon/osx-ethers";

/**
 * Decoding module for the SDK AddressList Client
 */
export class MultisigClientDecoding extends ClientCore
  implements IMultisigClientDecoding {
  constructor(context: ContextPlugin) {
    super(context);
  }
  /**
   * Decodes a list of addresses from an encoded add members action
   *
   * @param {Uint8Array[]} data
   * @return {*}  {MultisigPluginSettings}
   * @memberof MultisigClientDecoding
   */
  public addAddressesAction(data: Uint8Array[]): MultisigPluginSettings {
    const multisigInterface = Multisig__factory.createInterface();
    const hexBytes = bytesToHex(data[0]);

    const expectedfunction = multisigInterface.getFunction("addAddresses");
    const result = multisigInterface.decodeFunctionData(
      expectedfunction,
      hexBytes,
    );
    const votingSettings = this.updateMultisigVotingSettings(data[1]);
    return {
      members: result[0],
      votingSettings,
    };
  }
  /**
   * Decodes a list of addresses from an encoded remove members action
   *
   * @param {Uint8Array[]} data
   * @return {*}  {MultisigPluginSettings}
   * @memberof MultisigClientDecoding
   */
  public removeAddressesAction(data: Uint8Array[]): MultisigPluginSettings {
    const multisigInterface = Multisig__factory.createInterface();
    const hexBytes = bytesToHex(data[1]);
    const expectedfunction = multisigInterface.getFunction(
      "removeAddresses",
    );
    const result = multisigInterface.decodeFunctionData(
      expectedfunction,
      hexBytes,
    );
    const votingSettings = this.updateMultisigVotingSettings(data[0]);
    return {
      members: result[0],
      votingSettings,
    };
  }
  /**
   * Decodes a list of min approvals from an encoded update min approval action
   *
   * @param {Uint8Array} data
   * @return {*}  {MultisigVotingSettings}
   * @memberof MultisigClientDecoding
   */
  public updateMultisigVotingSettings(
    data: Uint8Array,
  ): MultisigVotingSettings {
    const multisigInterface = Multisig__factory.createInterface();
    const hexBytes = bytesToHex(data);
    const expectedfunction = multisigInterface.getFunction(
      "updateMultisigSettings",
    );
    const result = multisigInterface.decodeFunctionData(
      expectedfunction,
      hexBytes,
    );
    return {
      minApprovals: result[0].minApprovals,
      onlyListed: result[0].onlyListed,
    };
  }
  /**
   * Returns the decoded function info given the encoded data of an action
   *
   * @param {Uint8Array} data
   * @return {*}  {(IInterfaceParams | null)}
   * @memberof MultisigClientDecoding
   */
  public findInterface(data: Uint8Array): IInterfaceParams | null {
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
