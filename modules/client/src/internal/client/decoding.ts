import {
  DaoMetadata,
  DecodedApplyUninstallationParams,
  GrantPermissionDecodedParams,
  GrantPermissionWithConditionParams,
  RegisterStandardCallbackParams,
  RevokePermissionDecodedParams,
  UpgradeToAndCallParams,
  WithdrawParams,
} from "../../types";

import { AVAILABLE_FUNCTION_SIGNATURES } from "../constants";
import {
  DAO__factory,
  PluginSetupProcessor__factory,
} from "@aragon/osx-ethers";
import {
  applyInstallatonParamsFromContract,
  permissionParamsFromContract,
  permissionParamsWitConditionFromContract,
  withdrawParamsFromContract,
} from "../utils";
import {
  bytesToHex,
  hexToBytes,
  InvalidActionError,
  IpfsError,
  resolveIpfsCid,
} from "@aragon/sdk-common";
import { erc20ContractAbi } from "../abi/erc20";
import { Contract } from "@ethersproject/contracts";
import { AddressZero } from "@ethersproject/constants";
import { toUtf8String } from "@ethersproject/strings";
import { IClientDecoding } from "../interfaces";
import {
  ClientCore,
  DecodedApplyInstallationParams,
  getFunctionFragment,
  InterfaceParams,
  TokenType,
} from "@aragon/sdk-client-common";

/**
 * Decoding module the SDK Generic Client
 */
export class ClientDecoding extends ClientCore implements IClientDecoding {
  /**
   * @param {data} Uint8Array
   * @return {*}  {DecodedApplyInstallationParams}
   * @memberof ClientDecoding
   */
  public applyInstallationAction(
    data: Uint8Array,
  ): DecodedApplyInstallationParams {
    const pspInterface = PluginSetupProcessor__factory.createInterface();
    const hexBytes = bytesToHex(data);
    const expectedFunction = pspInterface.getFunction("applyInstallation");
    const result = pspInterface.decodeFunctionData(expectedFunction, hexBytes);
    return applyInstallatonParamsFromContract(result);
  }
  /**
   * @param {data} Uint8Array
   * @return {*}  {DecodedApplyInstallationParams}
   * @memberof ClientDecoding
   */
  public applyUninstallationAction(
    data: Uint8Array,
  ): DecodedApplyUninstallationParams {
    const pspInterface = PluginSetupProcessor__factory.createInterface();
    const hexBytes = bytesToHex(data);
    const expectedFunction = pspInterface.getFunction("applyUninstallation");
    const result = pspInterface.decodeFunctionData(expectedFunction, hexBytes);
    return applyInstallatonParamsFromContract(result);
  }
  /**
   * Decodes the permission parameters from an encoded grant action
   *
   * @param {Uint8Array} data
   * @return {*}  {GrantPermissionDecodedParams}
   * @memberof ClientDecoding
   */
  public grantAction(data: Uint8Array): GrantPermissionDecodedParams {
    const daoInterface = DAO__factory.createInterface();
    const hexBytes = bytesToHex(data);
    const expectedFunction = daoInterface.getFunction("grant");
    const result = daoInterface.decodeFunctionData(expectedFunction, hexBytes);
    return permissionParamsFromContract(result);
  }
  /**
   * Decodes the grant permission with condition parameters from an encoded grant with condition action
   *
   * @param {Uint8Array} data
   * @return {*}  {GrantPermissionWithConditionParams}
   * @memberof ClientDecoding
   */
  public grantWithConditionAction(
    data: Uint8Array,
  ): GrantPermissionWithConditionParams {
    const daoInterface = DAO__factory.createInterface();
    const hexBytes = bytesToHex(data);
    const expectedFunction = daoInterface.getFunction("grantWithCondition");
    const result = daoInterface.decodeFunctionData(expectedFunction, hexBytes);
    return permissionParamsWitConditionFromContract(result);
  }
  /**
   * Decodes the permission parameters from an encoded revoke action
   *
   * @param {Uint8Array} data
   * @return {*}  {RevokePermissionDecodedParams}
   * @memberof ClientDecoding
   */
  public revokeAction(data: Uint8Array): RevokePermissionDecodedParams {
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
    throw new InvalidActionError();
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
    } catch (e) {
      throw new IpfsError(e);
    }
  }
  /**
   * Decodes the daoUri from a setDaoUriAction
   *
   * @param {Uint8Array} data
   * @return {*}  {string}
   * @memberof ClientDecoding
   */
  public setDaoUriAction(data: Uint8Array): string {
    const daoInterface = DAO__factory.createInterface();
    const hexBytes = bytesToHex(data);
    const expectedFunction = daoInterface.getFunction("setDaoURI");
    const result = daoInterface.decodeFunctionData(expectedFunction, hexBytes);
    return result[0];
  }
  /**
   * Decodes the RegisterStandardCallbackParams from a registerStandardCallbackAction
   *
   * @param {Uint8Array} data
   * @return {*}  {RegisterStandardCallbackParams}
   * @memberof ClientDecoding
   */
  public registerStandardCallbackAction(
    data: Uint8Array,
  ): RegisterStandardCallbackParams {
    const daoInterface = DAO__factory.createInterface();
    const hexBytes = bytesToHex(data);
    const expectedFunction = daoInterface.getFunction(
      "registerStandardCallback",
    );
    const result = daoInterface.decodeFunctionData(expectedFunction, hexBytes);
    return {
      interfaceId: result[0],
      callbackSelector: result[1],
      magicNumber: result[2],
    };
  }
  /**
   * Decodes the implementation address from an encoded upgradeToAction
   *
   * @param {Uint8Array} data
   * @return {*}  {string}
   * @memberof ClientDecoding
   */
  public setSignatureValidatorAction(
    data: Uint8Array,
  ): string {
    const daoInterface = DAO__factory.createInterface();
    const hexBytes = bytesToHex(data);
    const expectedFunction = daoInterface.getFunction(
      "setSignatureValidator",
    );
    const result = daoInterface.decodeFunctionData(expectedFunction, hexBytes);
    return result[0];
  }
  public upgradeToAction(data: Uint8Array): string {
    const daoInterface = DAO__factory.createInterface();
    const hexBytes = bytesToHex(data);
    const expectedFunction = daoInterface.getFunction(
      "upgradeTo",
    );
    const result = daoInterface.decodeFunctionData(expectedFunction, hexBytes);
    return result[0];
  }
  /**
   * Decodes upgradeToAndCallback params from an upgradeToAndCallAction
   *
   * @param {Uint8Array} data
   * @return {*}  {UpgradeToAndCallParams}
   * @memberof ClientDecoding
   */
  public upgradeToAndCallAction(
    data: Uint8Array,
  ): UpgradeToAndCallParams {
    const daoInterface = DAO__factory.createInterface();
    const hexBytes = bytesToHex(data);
    const expectedFunction = daoInterface.getFunction(
      "upgradeToAndCall",
    );
    const result = daoInterface.decodeFunctionData(expectedFunction, hexBytes);
    return {
      implementationAddress: result[0],
      data: hexToBytes(result[1]),
    };
  }

  /**
   * Returns the decoded function info given the encoded data of an action
   *
   * @param {Uint8Array} data
   * @return {*}  {(InterfaceParams | null)}
   * @memberof ClientDecoding
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
