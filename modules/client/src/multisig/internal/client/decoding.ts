import { bytesToHex } from "@aragon/sdk-common";
import { AVAILABLE_FUNCTION_SIGNATURES } from "../constants";
import { MultisigVotingSettings } from "../../types";
// @ts-ignore
// todo fix new contracts-ethers
import { Multisig__factory } from "@aragon/osx-ethers";
import { IMultisigClientDecoding } from "../interfaces";
import {
  ClientCore,
  getFunctionFragment,
  InterfaceParams,
} from "@aragon/sdk-client-common";

/**
 * Decoding module for the SDK AddressList Client
 */
export class MultisigClientDecoding extends ClientCore
  implements IMultisigClientDecoding {
  /**
   * Decodes a list of addresses from an encoded add members action
   *
   * @param {Uint8Array} data
   * @return {*}  {string[]}
   * @memberof MultisigClientDecoding
   */
  public addAddressesAction(data: Uint8Array): string[] {
    const multisigInterface = Multisig__factory.createInterface();
    const hexBytes = bytesToHex(data);

    const expectedfunction = multisigInterface.getFunction("addAddresses");
    const result = multisigInterface.decodeFunctionData(
      expectedfunction,
      hexBytes
    );
    return result[0];
  }
  /**
   * Decodes a list of addresses from an encoded remove members action
   *
   * @param {Uint8Array} data
   * @return {*}  {string[]}
   * @memberof MultisigClientDecoding
   */
  public removeAddressesAction(data: Uint8Array): string[] {
    const multisigInterface = Multisig__factory.createInterface();
    const hexBytes = bytesToHex(data);
    const expectedfunction = multisigInterface.getFunction("removeAddresses");
    const result = multisigInterface.decodeFunctionData(
      expectedfunction,
      hexBytes
    );
    return result[0];
  }
  /**
   * Decodes a list of min approvals from an encoded update min approval action
   *
   * @param {Uint8Array} data
   * @return {*}  {MultisigVotingSettings}
   * @memberof MultisigClientDecoding
   */
  public updateMultisigVotingSettings(
    data: Uint8Array
  ): MultisigVotingSettings {
    const multisigInterface = Multisig__factory.createInterface();
    const hexBytes = bytesToHex(data);
    const expectedfunction = multisigInterface.getFunction(
      "updateMultisigSettings"
    );
    const result = multisigInterface.decodeFunctionData(
      expectedfunction,
      hexBytes
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
   * @return {*}  {(InterfaceParams | null)}
   * @memberof MultisigClientDecoding
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
