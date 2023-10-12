import {
  DaoMetadata,
  GrantPermissionDecodedParams,
  GrantPermissionWithConditionParams,
  InitializeFromParams,
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
  decodeApplyUpdateAction,
  decodeGrantAction,
  decodeInitializeFromAction,
  decodeUpgradeToAndCallAction,
  findInterface,
  permissionParamsFromContract,
  permissionParamsWitConditionFromContract,
  withdrawParamsFromContract,
} from "../utils";
import { abi as ERC20_ABI } from "@openzeppelin/contracts/build/contracts/ERC20.json";
import { abi as ERC721_ABI } from "@openzeppelin/contracts/build/contracts/ERC721.json";
import { abi as ERC1155_ABI } from "@openzeppelin/contracts/build/contracts/ERC1155.json";
import { Contract } from "@ethersproject/contracts";
import { AddressZero } from "@ethersproject/constants";
import { toUtf8String } from "@ethersproject/strings";
import { IClientDecoding } from "../interfaces";
import {
  AddressOrEnsSchema,
  BigintSchema,
  bytesToHex,
  ClientCore,
  DecodedApplyInstallationParams,
  DecodedApplyUninstallationParams,
  DecodedApplyUpdateParams,
  InterfaceParams,
  InvalidActionError,
  IpfsError,
  resolveIpfsCid,
  TokenType,
  Uint8ArraySchema,
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
    Uint8ArraySchema.strict().validateSync(data);
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
    Uint8ArraySchema.strict().validateSync(data);
    const pspInterface = PluginSetupProcessor__factory.createInterface();
    const hexBytes = bytesToHex(data);
    const expectedFunction = pspInterface.getFunction("applyUninstallation");
    const result = pspInterface.decodeFunctionData(expectedFunction, hexBytes);
    return applyInstallatonParamsFromContract(result);
  }

  /**
   * Decodes the apply update parameters from an encoded apply update action
   *
   * @param {Uint8Array} data
   * @return {*}  {DecodedApplyUpdateParams}
   * @memberof ClientDecoding
   */
  public applyUpdateAction(
    data: Uint8Array,
  ): DecodedApplyUpdateParams {
    return decodeApplyUpdateAction(data);
  }

  /**
   * Decodes the permission parameters from an encoded grant action
   *
   * @param {Uint8Array} data
   * @return {*}  {GrantPermissionDecodedParams}
   * @memberof ClientDecoding
   */
  public grantAction(data: Uint8Array): GrantPermissionDecodedParams {
    Uint8ArraySchema.strict().validate(data);
    return decodeGrantAction(data);
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
    Uint8ArraySchema.strict().validateSync(data);
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
    Uint8ArraySchema.strict().validateSync(data);
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
    AddressOrEnsSchema.strict().validateSync(to);
    BigintSchema.strict().validateSync(value);
    Uint8ArraySchema.strict().validateSync(data);
    // Native
    if (!data?.length) {
      return {
        type: TokenType.NATIVE,
        recipientAddressOrEns: to,
        amount: value,
      };
    }

    // ERC20 and other
    const abiObjects = [
      {
        tokenStandard: TokenType.ERC20,
        abi: ERC20_ABI,
        batch: false,
        function: "transfer",
      },
      {
        tokenStandard: TokenType.ERC721,
        abi: ERC721_ABI,
        batch: false,
        function: "safeTransferFrom(address,address,uint256)",
      },
      {
        tokenStandard: TokenType.ERC1155,
        abi: ERC1155_ABI,
        batch: true,
        function:
          "safeBatchTransferFrom(address,address,uint256[],uint256[],bytes)",
      },
      {
        tokenStandard: TokenType.ERC1155,
        abi: ERC1155_ABI,
        batch: false,
        function: "safeTransferFrom(address,address,uint256,uint256,bytes)",
      },
    ];
    for (const abiObject of abiObjects) {
      try {
        const hexBytes = bytesToHex(data);
        const iface = new Contract(AddressZero, abiObject.abi).interface;
        const expectedFunction = iface.getFunction(abiObject.function);
        const result = iface.decodeFunctionData(expectedFunction, hexBytes);
        return withdrawParamsFromContract(
          to,
          value,
          result,
          abiObject.tokenStandard,
          abiObject.batch,
        );
      } catch (e) {
        continue;
      }
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
    Uint8ArraySchema.strict().validateSync(data);
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
    await Uint8ArraySchema.strict().validate(data);
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
    Uint8ArraySchema.strict().validateSync(data);
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
    Uint8ArraySchema.strict().validateSync(data);
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
    Uint8ArraySchema.strict().validateSync(data);
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
    Uint8ArraySchema.strict().validate(data);
    return decodeUpgradeToAndCallAction(data);
  }

  /**
   * Decodes the initializeFrom params from an initializeFromAction
   *
   * @param {Uint8Array} data
   * @return {*}  {InitializeFromParams}
   * @memberof ClientDecoding
   */
  public initializeFromAction(data: Uint8Array): InitializeFromParams {
    Uint8ArraySchema.strict().validate(data);
    return decodeInitializeFromAction(data);
  }

  /**
   * Returns the decoded function info given the encoded data of an action
   *
   * @param {Uint8Array} data
   * @return {*}  {(InterfaceParams | null)}
   * @memberof ClientDecoding
   */
  public findInterface(data: Uint8Array): InterfaceParams | null {
    Uint8ArraySchema.strict().validate(data);
    return findInterface(data, AVAILABLE_FUNCTION_SIGNATURES);
  }
}
