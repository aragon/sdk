import {
  IClientEncoding,
  IFreezePermissionParams,
  IGrantPermissionParams,
  IMetadata,
  IRevokePermissionParams,
  IWithdrawParams,
} from "../../interfaces";
import { ClientCore, Context, DaoAction } from "../../client-common";
import { isAddress } from "@ethersproject/address";
import { DAO__factory } from "@aragon/core-contracts-ethers";
import { hexToBytes, strip0x } from "@aragon/sdk-common";
import {
  freezeParamsToContract,
  permissionParamsToContract,
  withdrawParamsToContract,
} from "../utils";

export class ClientEncoding extends ClientCore implements IClientEncoding {
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
   * @return {*}  {DaoAction}
   * @memberof ClientEncoding
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
    const daoInterface = DAO__factory.createInterface();
    const args = permissionParamsToContract(
      {
        who,
        where,
        permission: params.permission,
      },
    );
    // get hex bytes
    const hexBytes = daoInterface.encodeFunctionData("grant", args);
    const data = hexToBytes(strip0x(hexBytes));
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
   * @return {*}  {DaoAction}
   * @memberof ClientEncoding
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
    const daoInterface = DAO__factory.createInterface();
    const args = permissionParamsToContract(
      {
        who,
        where,
        permission: params.permission,
      },
    );
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
   * @return {*}  {DaoAction}
   * @memberof ClientEncoding
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
    const daoInterface = DAO__factory.createInterface();
    const args = freezeParamsToContract(
      {
        where,
        permission: params.permission,
      },
    );
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
   * @param {string} daoAddressOrEns
   * @param {IWithdrawParams} params
   * @return {*}  {Promise<DaoAction>}
   * @memberof ClientEncoding
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
    const daoInterface = DAO__factory.createInterface();
    const args = withdrawParamsToContract(params);
    // get hex bytes
    const hexBytes = daoInterface.encodeFunctionData("withdraw", args);
    const data = hexToBytes(strip0x(hexBytes));
    return {
      to: address,
      value: BigInt(0),
      data,
    };
  }
  /**
   * Computes the payload to be given when creating a proposal that updates the metadata the DAO
   *
   * @param {string} daoAddressOrEns
   * @param {IMetadata} params
   * @return {*}  {Promise<DaoAction>}
   * @memberof ClientEncoding
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
    const daoInterface = DAO__factory.createInterface();
    const args = new TextEncoder().encode(cid);
    const hexBytes = daoInterface.encodeFunctionData("setMetadata", [args]);
    const data = hexToBytes(strip0x(hexBytes));
    return {
      to: address,
      value: BigInt(0),
      data,
    };
  }
}
