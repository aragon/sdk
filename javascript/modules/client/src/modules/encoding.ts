import { Context } from "../context";
import { ClientCore } from "../internal/core";
import {
  IClientEncoding,
  IFreezePermissionParams,
  IGrantPermissionParams,
  IMetadata,
  IRevokePermissionParams,
  IWithdrawParams,
} from "../internal/interfaces/client";
import { DaoAction } from "../internal/interfaces/common";
import { isAddress } from "@ethersproject/address";
import {
  encodeFreezeAction,
  encodeGrantActionData,
  encodeRevokeActionData,
  encodeUpdateMetadataAction,
  encodeWithdrawActionData,
} from "../internal/encoding/client";

export class IClientEncodingModule extends ClientCore
  implements IClientEncoding {
  constructor(context: Context) {
    super(context);
  }
  /**
   * Computes the payload to be given when creating a proposal that grants a permission within a DAO
   *
   * @param {string} daoAddress
   * @param {IGrantPermissionParams} params
   * @return {*}  {DaoAction}
   * @memberof IClientEncodingModule
   */
  public grantAction(
    daoAddress: string,
    params: IGrantPermissionParams,
  ): DaoAction {
    const signer = this.web3.getSigner();
    const { where, who } = params;
    if (!signer) {
      throw new Error("A signer is needed");
    } else if (
      !isAddress(where) || !isAddress(who) || !isAddress(daoAddress)
    ) {
      throw new Error("Invalid address");
    }
    return {
      to: daoAddress,
      value: BigInt(0),
      data: encodeGrantActionData(
        {
          who,
          where,
          permission: params.permission,
        },
      ),
    };
  }
  /**
   * Computes the payload to be given when creating a proposal that revokes a permission within a DAO
   *
   * @param {string} daoAddress
   * @param {IRevokePermissionParams} params
   * @return {*}  {DaoAction}
   * @memberof IClientEncodingModule
   */
  public revokeAction(
    daoAddress: string,
    params: IRevokePermissionParams,
  ): DaoAction {
    const signer = this.web3.getSigner();
    const { where, who } = params;
    if (!signer) {
      throw new Error("A signer is needed");
    } else if (
      !isAddress(where) || !isAddress(who) || !isAddress(daoAddress)
    ) {
      throw new Error("Invalid address");
    }
    return {
      to: daoAddress,
      value: BigInt(0),
      data: encodeRevokeActionData(
        {
          who,
          where,
          permission: params.permission,
        },
      ),
    };
  }
  /**
   * Computes the payload to be given when creating a proposal that freezes a permission within a DAO
   *
   * @param {string} daoAddress
   * @param {IFreezePermissionParams} params
   * @return {*}  {DaoAction}
   * @memberof IClientEncodingModule
   */
  public freezeAction(
    daoAddress: string,
    params: IFreezePermissionParams,
  ): DaoAction {
    const signer = this.web3.getSigner();
    const { where } = params;
    if (!signer) {
      throw new Error("A signer is needed");
    } else if (!isAddress(where) || !isAddress(daoAddress)) {
      throw new Error("Invalid address");
    }
    return {
      to: daoAddress,
      value: BigInt(0),
      data: encodeFreezeAction(
        {
          where,
          permission: params.permission,
        },
      ),
    };
  }
  /**
   * Computes the payload to be given when creating a proposal that withdraws ether or an ERC20 token from the DAO
   *
   * @param {string} daoAddressOrEns
   * @param {IWithdrawParams} params
   * @return {*}  {Promise<DaoAction>}
   * @memberof IClientEncodingModule
   */
  public async withdrawAction(
    daoAddressOrEns: string,
    params: IWithdrawParams,
  ): Promise<DaoAction> {
    let address = daoAddressOrEns;
    if (!isAddress(daoAddressOrEns)) {
      const resolvedAddress = await this.web3.getSigner()?.resolveName(
        daoAddressOrEns,
      );
      if (!resolvedAddress) {
        throw new Error("invalid ens");
      }
      address = resolvedAddress;
    }

    return {
      to: address,
      value: BigInt(0),
      data: encodeWithdrawActionData(params),
    };
  }
  /**
   * Computes the payload to be given when creating a proposal that updates the metadata the DAO
   *
   * @param {string} daoAddressOrEns
   * @param {IMetadata} params
   * @return {*}  {Promise<DaoAction>}
   * @memberof IClientEncodingModule
   */
  public async updateMetadataAction(
    daoAddressOrEns: string,
    params: IMetadata,
  ): Promise<DaoAction> {
    let address = daoAddressOrEns;
    if (!isAddress(daoAddressOrEns)) {
      const resolvedAddress = await this.web3.getSigner()?.resolveName(
        daoAddressOrEns,
      );
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
    return {
      to: address,
      value: BigInt(0),
      data: encodeUpdateMetadataAction(cid),
    };
  }
}
