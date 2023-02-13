import {
  DaoMetadata,
  IClientDecoding,
  IGrantPermissionDecodedParams,
  IRevokePermissionDecodedParams,
  TokenType,
  WithdrawParams,
} from "../../interfaces";
import {
  ClientCore,
  Context,
  getFunctionFragment,
  IInterfaceParams,
} from "../../client-common";
import { AVAILABLE_FUNCTION_SIGNATURES } from "../constants";
import { DAO__factory } from "@aragon/core-contracts-ethers";
import {
  permissionParamsFromContract,
  withdrawParamsFromContract,
} from "../utils";
import { bytesToHex, resolveIpfsCid } from "@aragon/sdk-common";
import { erc20ContractAbi } from "../abi/erc20";
import { Contract } from "@ethersproject/contracts";
import { AddressZero } from "@ethersproject/constants";
import { toUtf8String } from "@ethersproject/strings";

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
    const hexBytes = bytesToHex(data);
    const expectedFunction = daoInterface.getFunction("grant");
    const result = daoInterface.decodeFunctionData(expectedFunction, hexBytes);
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
    const hexBytes = bytesToHex(data);
    const expectedFunction = daoInterface.getFunction("revoke");
    const result = daoInterface.decodeFunctionData(expectedFunction, hexBytes);
    return permissionParamsFromContract(result);
  }
  /**
   * Decodes the withdraw parameters from an encoded withdraw action
   *
   * @param {Uint8Array} data
   * @return {*}  {WithdrawParams}
   * @memberof ClientDecoding
   */
  public withdrawAction(
    to: string,
    value: bigint,
    data: Uint8Array,
  ): WithdrawParams {
    // Native
    if (!data?.length) {
      return {
        type: TokenType.NATIVE,
        recipientAddressOrEns: to,
        amount: value,
      };
    }

    // ERC20 and other
    const abiObjects = [{
      tokenStandard: TokenType.ERC20,
      abi: erc20ContractAbi,
    }];
    for (const abiObject of abiObjects) {
      const hexBytes = bytesToHex(data);
      const iface = new Contract(AddressZero, abiObject.abi).interface;
      const expectedFunction = iface.getFunction("transfer");
      const result = iface.decodeFunctionData(expectedFunction, hexBytes);
      return withdrawParamsFromContract(
        to,
        value,
        result,
        abiObject.tokenStandard,
      );
    }
    throw new Error("The received action is not recognized");
  }
  /**
   * Decodes a dao metadata ipfs uri from an encoded update metadata action
   *
   * @param {Uint8Array} data
   * @return {*}  {string}
   * @memberof ClientDecoding
   */
  public updateDaoMetadataRawAction(data: Uint8Array): string {
    const daoInterface = DAO__factory.createInterface();
    const hexBytes = bytesToHex(data);
    const expectedFunction = daoInterface.getFunction("setMetadata");
    const result = daoInterface.decodeFunctionData(expectedFunction, hexBytes);
    const metadataUri = toUtf8String(result[0]);
    resolveIpfsCid(metadataUri);
    return metadataUri;
  }
  /**
   * Decodes a dao metadata from an encoded update metadata raw action
   *
   * @param {Uint8Array} data
   * @return {*}  {Promise<DaoMetadata>}
   * @memberof ClientDecoding
   */
  public async updateDaoMetadataAction(data: Uint8Array): Promise<DaoMetadata> {
    const daoInterface = DAO__factory.createInterface();
    const hexBytes = bytesToHex(data);
    const expectedFunction = daoInterface.getFunction("setMetadata");
    const result = daoInterface.decodeFunctionData(expectedFunction, hexBytes);
    const metadataUri = toUtf8String(result[0]);
    const ipfsCid = resolveIpfsCid(metadataUri);
    try {
      const stringMetadata = await this.ipfs.fetchString(ipfsCid);
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
        hash: bytesToHex(data).substring(0, 10),
      };
    } catch {
      return null;
    }
  }
}