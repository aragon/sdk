import {
  IFreezePermissionParams,
  IGrantPermissionParams,
  IRevokePermissionParams,
  IWithdrawParams,
} from "../../interfaces";
import { ClientCore, Context } from "../../client-common";
import { DAO__factory } from "@aragon/core-contracts-ethers";
import { hexToBytes, strip0x } from "@aragon/sdk-common";
import {
  freezeParamsToContract,
  permissionParamsToContract,
  withdrawParamsToContract,
} from "../utils";
import { UnsignedTransaction } from "@ethersproject/transactions";

/**
 * Encoding module the SDK Generic Client
 */
export class ClientEncoding extends ClientCore {
  constructor(context: Context) {
    super(context);
    Object.freeze(ClientEncoding.prototype);
    Object.freeze(this);
  }
  /**
   * Computes the payload to be given when creating a proposal that grants a permission within a DAO
   *
   * @static
   * @param {string} daoAddress
   * @param {IGrantPermissionParams} params
   * @return {*}  {ethers.UnsignedTransaction}
   * @memberof ClientEncoding
   */
  public static grantAction(
    daoAddress: string,
    params: IGrantPermissionParams
  ): UnsignedTransaction {
    const daoInterface = DAO__factory.createInterface();
    const args = permissionParamsToContract({
      who: params.who,
      where: params.where,
      permission: params.permission,
    });
    // get hex bytes
    const hexBytes = daoInterface.encodeFunctionData("grant", args);
    return {
      to: daoAddress,
      value: BigInt(0),
      data: hexBytes,
    };
  }
  /**
   * Computes the payload to be given when creating a proposal that revokes a permission within a DAO
   *
   * @static
   * @param {string} daoAddress
   * @param {IRevokePermissionParams} params
   * @return {*}  {ethers.UnsignedTransaction}
   * @memberof ClientEncoding
   */
  public static revokeAction(
    daoAddress: string,
    params: IRevokePermissionParams
  ): UnsignedTransaction {
    const daoInterface = DAO__factory.createInterface();
    const args = permissionParamsToContract({
      who: params.who,
      where: params.where,
      permission: params.permission,
    });
    // get hex bytes
    const hexBytes = daoInterface.encodeFunctionData("revoke", args);
    const data = hexToBytes(strip0x(hexBytes));
    return {
      to: daoAddress,
      value: BigInt(0),
      data,
    };
  }
  /**
   * Computes the payload to be given when creating a proposal that freezes a permission within a DAO
   *
   * @static
   * @param {string} daoAddress
   * @param {IFreezePermissionParams} params
   * @return {*}  {ethers.UnsignedTransaction}
   * @memberof ClientEncoding
   */
  public static freezeAction(
    daoAddress: string,
    params: IFreezePermissionParams
  ): UnsignedTransaction {
    const daoInterface = DAO__factory.createInterface();
    const args = freezeParamsToContract({
      where: params.where,
      permission: params.permission,
    });
    // get hex bytes
    const hexBytes = daoInterface.encodeFunctionData("freeze", args);
    const data = hexToBytes(strip0x(hexBytes));
    return {
      to: daoAddress,
      value: BigInt(0),
      data,
    };
  }
  /**
   * Computes the payload to be given when creating a proposal that withdraws ether or an ERC20 token from the DAO
   *
   * @static
   * @param {string} daoAddress
   * @param {IWithdrawParams} params
   * @return {*}  {ethers.UnsignedTransaction}
   * @memberof ClientEncoding
   */
  public static withdrawAction(
    daoAddress: string,
    params: IWithdrawParams
  ): UnsignedTransaction {
    const daoInterface = DAO__factory.createInterface();
    const args = withdrawParamsToContract(params);
    // get hex bytes
    const hexBytes = daoInterface.encodeFunctionData("withdraw", args);
    const data = hexToBytes(strip0x(hexBytes));
    return {
      to: daoAddress,
      value: BigInt(0),
      data,
    };
  }

  /**
   * Computes the payload to be given when creating a proposal that updates the metadata the DAO
   *
   * @static
   * @param {string} daoAddress
   * @param {IPFSModule} ipfs
   * @param {IMetadata} params
   * @return {*}  {UnsignedTransaction}
   * @memberof ClientEncoding
   */
  public static updateMetadataAction(
    daoAddress: string,
    cid: string
  ): UnsignedTransaction {
    const daoInterface = DAO__factory.createInterface();
    const args = new TextEncoder().encode(cid);
    const hexBytes = daoInterface.encodeFunctionData("setMetadata", [args]);
    return {
      to: daoAddress,
      value: BigInt(0),
      data: hexBytes,
    };
  }
}
