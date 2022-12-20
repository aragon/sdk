import { bytesToHex, UnexpectedActionError } from "@aragon/sdk-common";
import {
  ClientCore,
  ContextPlugin,
  getFunctionFragment,
  IInterfaceParams,
} from "../../../client-common";
import { AVAILABLE_FUNCTION_SIGNATURES } from "../constants";
import { IMultisigClientDecoding } from "../../interfaces";
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
  public addMembersAction(data: Uint8Array): string[] {
    const multisigInterface = MultisigVoting__factory.createInterface();
    const hexBytes = bytesToHex(data, true);
    const receivedFunction = multisigInterface.getFunction(
      hexBytes.substring(0, 10) as any,
    );
    // TODO: Rename to `addAddresses` as soon as the plugin is updated
    const expectedfunction = multisigInterface.getFunction("addAllowedUsers");
    if (receivedFunction.name !== expectedfunction.name) {
      throw new UnexpectedActionError();
    }
    const result = multisigInterface.decodeFunctionData(
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
   * @memberof MultisigClientDecoding
   */
  public removeMembersAction(data: Uint8Array): string[] {
    const multisigInterface = MultisigVoting__factory.createInterface();
    const hexBytes = bytesToHex(data, true);
    const receivedFunction = multisigInterface.getFunction(
      hexBytes.substring(0, 10) as any,
    );
    const expectedfunction = multisigInterface.getFunction(
      // TODO: Rename to `removeAddresses` as soon as the plugin is updated
      "removeAllowedUsers",
    );
    if (receivedFunction.name !== expectedfunction.name) {
      throw new UnexpectedActionError();
    }
    const result = multisigInterface.decodeFunctionData(
      // TODO: Rename to `removeAddresses` as soon as the plugin is updated
      "removeAllowedUsers",
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
