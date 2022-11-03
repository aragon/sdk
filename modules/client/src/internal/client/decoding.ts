import { bytesToHex, hexToBytes } from "@aragon/sdk-common";
import {
  IClientDecoding,
  IFreezePermissionDecodedParams,
  IGrantPermissionDecodedParams,
  IMetadata,
  IRevokePermissionDecodedParams,
  IWithdrawParams,
} from "../../interfaces";
import {
  ClientCore,
  Context,
  getFunctionFragment,
  IInterfaceParams,
} from "../../client-common";
import { AVAILABLE_FUNCTION_SIGNATURES } from "../constants";
import { DAO__factory } from "@aragon/core-contracts-ethers";
import { freezeParamsFromContract, permissionParamsFromContract, withdrawParamsFromContract } from "../utils";

/**
 * Decoding module the SDK Generic Client
 */
export class ClientDecoding extends ClientCore implements IClientDecoding {
  constructor(context: Context) {
    super(context);
    Object.freeze(ClientDecoding.prototype);
    Object.freeze(this);
  }
  /**
   * Decodes the permission parameters from an encoded grant action
   *
   * @param {Uint8Array} data
   * @return {*}  {IGrantPermissionDecodedParams}
   * @memberof ClientDecoding
   */
  public grantAction(data: Uint8Array): IGrantPermissionDecodedParams {
    const daoInterface = DAO__factory.createInterface();
    const hexBytes = bytesToHex(data, true);
    const receivedFunction = daoInterface.getFunction(
      hexBytes.substring(0, 10) as any,
    );
    const expectedFunction = daoInterface.getFunction("grant");
    if (receivedFunction.name !== expectedFunction.name) {
      throw new Error("The received action is different from the expected one");
    }
    const result = daoInterface.decodeFunctionData("grant", data);
    return permissionParamsFromContract(result);
  }
  /**
   * Decodes the permission parameters from an encoded revoke action
   *
   * @param {Uint8Array} data
   * @return {*}  {IRevokePermissionDecodedParams}
   * @memberof ClientDecoding
   */
  public revokeAction(data: Uint8Array): IRevokePermissionDecodedParams {
    const daoInterface = DAO__factory.createInterface();
    const hexBytes = bytesToHex(data, true);
    const receivedFunction = daoInterface.getFunction(
      hexBytes.substring(0, 10) as any,
    );
    const expectedFunction = daoInterface.getFunction("revoke");
    if (receivedFunction.name !== expectedFunction.name) {
      throw new Error("The received action is different from the expected one");
    }
    const result = daoInterface.decodeFunctionData("revoke", data);
    return permissionParamsFromContract(result);
  }
  /**
   * Decodes the freeze parameters from an encoded freeze action
   *
   * @param {Uint8Array} data
   * @return {*}  {IFreezePermissionDecodedParams}
   * @memberof ClientDecoding
   */
  public freezeAction(data: Uint8Array): IFreezePermissionDecodedParams {
    const daoInterface = DAO__factory.createInterface();
    const hexBytes = bytesToHex(data, true);
    const receivedFunction = daoInterface.getFunction(
      hexBytes.substring(0, 10) as any,
    );
    const expectedFunction = daoInterface.getFunction("freeze");
    if (receivedFunction.name !== expectedFunction.name) {
      throw new Error("The received action is different from the expected one");
    }
    const result = daoInterface.decodeFunctionData("freeze", data);
    return freezeParamsFromContract(result);
  }
  /**
   * Decodes the withdraw parameters from an encoded withdraw action
   *
   * @param {Uint8Array} data
   * @return {*}  {IWithdrawParams}
   * @memberof ClientDecoding
   */
  public withdrawAction(data: Uint8Array): IWithdrawParams {
    const daoInterface = DAO__factory.createInterface();
    const hexBytes = bytesToHex(data, true);
    const receivedFunction = daoInterface.getFunction(
      hexBytes.substring(0, 10) as any,
    );
    const expectedFunction = daoInterface.getFunction("withdraw");
    if (receivedFunction.name !== expectedFunction.name) {
      throw new Error("The received action is different from the expected one");
    }
    const result = daoInterface.decodeFunctionData("withdraw", data);
    return withdrawParamsFromContract(result);
  }
  /**
   * Decodes a dao metadata ipfs uri from an encoded update metadata action
   *
   * @param {Uint8Array} data
   * @return {*}  {string}
   * @memberof ClientDecoding
   */
  public updateMetadataRawAction(data: Uint8Array): string {
    const daoInterface = DAO__factory.createInterface();
    const hexBytes = bytesToHex(data, true);
    const receivedFunction = daoInterface.getFunction(
      hexBytes.substring(0, 10) as any,
    );
    const expectedFunction = daoInterface.getFunction("setMetadata");
    if (receivedFunction.name !== expectedFunction.name) {
      throw new Error("The received action is different from the expected one");
    }
    const result = daoInterface.decodeFunctionData("setMetadata", data);
    const bytes = hexToBytes(result[0]);
    const cid = new TextDecoder().decode(bytes);
    const ipfsRegex =
      /^Qm([1-9A-HJ-NP-Za-km-z]{44,}|b[A-Za-z2-7]{58,}|B[A-Z2-7]{58,}|z[1-9A-HJ-NP-Za-km-z]{48,}|F[0-9A-F]{50,})$/;
    if (!ipfsRegex.test(cid)) {
      throw new Error("The metadata URL defined on the DAO is invalid");
    }
    return "ipfs://" + cid;
  }
  /**
   * Decodes a dao metadata from an encoded update metadata raw action
   *
   * @param {Uint8Array} data
   * @return {*}  {Promise<IMetadata>}
   * @memberof ClientDecoding
   */
  public async updateMetadataAction(data: Uint8Array): Promise<IMetadata> {
    const daoInterface = DAO__factory.createInterface();
    const hexBytes = bytesToHex(data, true);
    const receivedFunction = daoInterface.getFunction(
      hexBytes.substring(0, 10) as any,
    );
    const expectedFunction = daoInterface.getFunction("setMetadata");
    if (receivedFunction.name !== expectedFunction.name) {
      throw new Error("The received action is different from the expected one");
    }
    const result = daoInterface.decodeFunctionData("setMetadata", data);
    const bytes = hexToBytes(result[0]);
    const cid = new TextDecoder().decode(bytes);
    const ipfsRegex =
      /^Qm([1-9A-HJ-NP-Za-km-z]{44,}|b[A-Za-z2-7]{58,}|B[A-Z2-7]{58,}|z[1-9A-HJ-NP-Za-km-z]{48,}|F[0-9A-F]{50,})$/;
    if (!ipfsRegex.test(cid)) {
      throw new Error("The metadata URL defined on the DAO is invalid");
    }
    try {
      const stringMetadata = await this.ipfs.fetchString(cid);
      return JSON.parse(stringMetadata);
    } catch {
      throw new Error("Error reading data from IPFS");
    }
  }
  /**
   * Returns the decoded function info given the encoded data of an action
   *
   * @param {Uint8Array} data
   * @return {*}  {(IInterfaceParams | null)}
   * @memberof ClientDecoding
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
