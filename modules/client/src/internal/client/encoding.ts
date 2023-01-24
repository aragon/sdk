import {
  IClientEncoding,
  IFreezePermissionParams,
  IGrantPermissionParams,
  IRevokePermissionParams,
  IWithdrawParams,
} from "../../interfaces";
import { ClientCore, Context, DaoAction, ipfsUriSchema } from "../../client-common";
import { DAO__factory } from "@aragon/core-contracts-ethers";
import { hexToBytes, strip0x } from "@aragon/sdk-common";
import {
  freezeParamsToContract,
  permissionParamsToContract,
  withdrawParamsToContract,
} from "../utils";
import {
  freezePermissionParamsSchema,
  permissionParamsSchema,
  withdrawParamsSchema,
} from "../../schemas";
import { addressOrEnsSchema } from "../../client-common";
import { toUtf8Bytes } from "@ethersproject/strings";

/**
 * Encoding module the SDK Generic Client
 */
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
    if (!signer) {
      throw new Error("A signer is needed");
    }
    addressOrEnsSchema.validateSync(daoAddress);
    const validParams = permissionParamsSchema.validateSync(params);

    const daoInterface = DAO__factory.createInterface();
    const args = permissionParamsToContract(validParams);
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
    if (!signer) {
      throw new Error("A signer is needed");
    }
    // validate dao address and params
    addressOrEnsSchema.strict().validateSync(daoAddress);
    permissionParamsSchema.strict().validateSync(params);

    const daoInterface = DAO__factory.createInterface();

    const args = permissionParamsToContract(params);
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
    }

    addressOrEnsSchema.strict().validateSync(daoAddress);
    freezePermissionParamsSchema.strict().validateSync(params);

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
  public withdrawAction(
    daoAddressOrEns: string,
    params: IWithdrawParams,
  ): DaoAction {
    addressOrEnsSchema.strict().validateSync(daoAddressOrEns);
    withdrawParamsSchema.strict().validateSync(params);

    const daoInterface = DAO__factory.createInterface();
    const args = withdrawParamsToContract(params);
    // get hex bytes
    const hexBytes = daoInterface.encodeFunctionData("withdraw", args);
    const data = hexToBytes(strip0x(hexBytes));
    return {
      to: daoAddressOrEns,
      value: BigInt(0),
      data,
    };
  }
  /**
   * Computes the payload to be given when creating a proposal that updates the metadata the DAO
   *
   * @param {string} daoAddressOrEns
   * @param {DaoMetadata} params
   * @return {*}  {Promise<DaoAction>}
   * @memberof ClientEncoding
   */
  public updateDaoMetadataAction(
    daoAddressOrEns: string,
    metadataUri: string,
  ): DaoAction {
    addressOrEnsSchema.strict().validateSync(daoAddressOrEns);
    ipfsUriSchema.strict().validateSync(metadataUri)
    // upload metadata to IPFS
    const daoInterface = DAO__factory.createInterface();
    const args = toUtf8Bytes(metadataUri)
    const hexBytes = daoInterface.encodeFunctionData("setMetadata", [args]);
    const data = hexToBytes(strip0x(hexBytes));
    return {
      to: daoAddressOrEns,
      value: BigInt(0),
      data,
    };
  }
}
