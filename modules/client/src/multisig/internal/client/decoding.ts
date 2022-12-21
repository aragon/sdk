import { bytesToHex, UnexpectedActionError } from "@aragon/sdk-common";
import {
  ClientCore,
  ContextPlugin,
  getFunctionFragment,
  IInterfaceParams,
} from "../../../client-common";
import { AVAILABLE_FUNCTION_SIGNATURES } from "../constants";
import { IMultisigClientDecoding, MultisigPluginSettings } from "../../interfaces";
// @ts-ignore
// todo fix new contracts-ethers
import { MultisigVoting__factory } from "@aragon/core-contracts-ethers";

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
   * @param {Uint8Array} data
   * @return {*}  {string[]}
   * @memberof MultisigClientDecoding
   */
  public addAddressesAction(data: Uint8Array): MultisigPluginSettings {
    const multisigInterface = MultisigVoting__factory.createInterface();
    const hexBytes = bytesToHex(data, true);
    const receivedFunction = multisigInterface.getFunction(
      hexBytes.substring(0, 10) as any,
    );
    const expectedfunction = multisigInterface.getFunction("addAddresses");
    if (receivedFunction.name !== expectedfunction.name) {
      throw new UnexpectedActionError();
    }
    const result = multisigInterface.decodeFunctionData(
      "addAddresses",
      data,
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
  public removeAddressesAction(data: Uint8Array): MultisigPluginSettings {
    const multisigInterface = MultisigVoting__factory.createInterface();
    const hexBytes = bytesToHex(data, true);
    const receivedFunction = multisigInterface.getFunction(
      hexBytes.substring(0, 10) as any,
    );
    const expectedfunction = multisigInterface.getFunction(
      "removeAddresses",
    );
    if (receivedFunction.name !== expectedfunction.name) {
      throw new UnexpectedActionError();
    }
    const result = multisigInterface.decodeFunctionData(
      "removeAddresses",
      data,
    );
    return result[0];
  }
  /**
   * Decodes a list of min approvals from an encoded update min approval action
   *
   * @param {Uint8Array} data
   * @return {*}  {bigint}
   * @memberof MultisigClientDecoding
   */
  public updateMinApprovalsAction(data: Uint8Array): bigint {
    const multisigInterface = MultisigVoting__factory.createInterface();
    const hexBytes = bytesToHex(data, true);
    const receivedFunction = multisigInterface.getFunction(
      hexBytes.substring(0, 10) as any,
    );
    const expectedfunction = multisigInterface.getFunction(
      "updateMinApprovals",
    );
    if (receivedFunction.name !== expectedfunction.name) {
      throw new UnexpectedActionError();
    }
    const result = multisigInterface.decodeFunctionData(
      "updateMinApprovals",
      data,
    );
    return result[0];
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
        hash: bytesToHex(data, true).substring(0, 10),
      };
    } catch {
      return null;
    }
  }
}
