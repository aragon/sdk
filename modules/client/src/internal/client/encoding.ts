import {
  IFreezePermissionParams,
  IGrantPermissionParams,
  IMetadata,
  IRevokePermissionParams,
  IWithdrawParams,
} from "../../interfaces";
import { DAO__factory } from "@aragon/core-contracts-ethers";
import { hexToBytes, strip0x } from "@aragon/sdk-common";
import {
  freezeParamsToContract,
  permissionParamsToContract,
  withdrawParamsToContract,
} from "../utils";
import { ClientCore, Context, EncodingResultType } from "../../client-common";
import { arrayify } from "@ethersproject/bytes";
import { isAddress } from "@ethersproject/address";

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
   * @param {string} daoAddress
   * @param {IGrantPermissionParams} params
   * @return {*}  {IEncodingResult}
   * @memberof ClientEncoding
   */
  public grantAction(
    daoAddress: string,
    params: IGrantPermissionParams
  ): EncodingResultType {
    const daoInterface = DAO__factory.createInterface();
    const args = permissionParamsToContract({
      who: params.who,
      where: params.where,
      permission: params.permission,
    });
    // get hex bytes
    const hexBytes = daoInterface.encodeFunctionData("grant", args);
    const data = arrayify(hexBytes);
    return {
      to: daoAddress,
      value: BigInt(0),
      data,
    };
  }
  /**
   * Computes the payload to be given when creating a proposal that revokes a permission within a DAO
   *
   * @param {string} daoAddress
   * @param {IRevokePermissionParams} params
   * @return {*}  {IEncodingResult}
   * @memberof ClientEncoding
   */
  public revokeAction(
    daoAddress: string,
    params: IRevokePermissionParams
  ): EncodingResultType {
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
   * @param {string} daoAddress
   * @param {IFreezePermissionParams} params
   * @return {*}  {IEncodingResult}
   * @memberof ClientEncoding
   */
  public freezeAction(
    daoAddress: string,
    params: IFreezePermissionParams
  ): EncodingResultType {
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
   * @param {string} daoAddress
   * @param {IWithdrawParams} params
   * @return {*}  {IEncodingResult}
   * @memberof ClientEncoding
   */
  public withdrawAction(
    daoAddress: string,
    params: IWithdrawParams
  ): EncodingResultType {
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
   * @param {string} daoAddress
   * @param {IPFSModule} ipfs
   * @param {IMetadata} params
   * @return {*}  {IEncodingResult}
   * @memberof ClientEncoding
   */
  public async updateMetadataAction(
    daoAddressOrEns: string,
    params: IMetadata
  ): Promise<EncodingResultType> {
    let address = daoAddressOrEns;
    if (!isAddress(daoAddressOrEns)) {
      const resolvedAddress = await this.web3
        .getSigner()
        ?.resolveName(daoAddressOrEns);
      if (!resolvedAddress) {
        throw new Error("invalid ens");
      }
      address = resolvedAddress;
    }
    // upload metadata to IPFS
    let cid: string;
    try {
      cid = await this.ipfs.add(JSON.stringify(params));
    } catch {
      throw new Error("Could not pin the metadata on IPFS");
    }
    const daoInterface = DAO__factory.createInterface();
    const args = new TextEncoder().encode(cid);
    const hexBytes = daoInterface.encodeFunctionData("setMetadata", [args]);
    const data = arrayify(hexBytes);
    return {
      to: address,
      value: BigInt(0),
      data,
    };
  }
}
