import {
  IClientEncoding,
  IGrantPermissionParams,
  IRevokePermissionParams,
  TokenStandards,
  WithdrawParams,
} from "../../interfaces";
import { ClientCore, Context, DaoAction } from "../../client-common";
import { isAddress } from "@ethersproject/address";
import { DAO__factory } from "@aragon/core-contracts-ethers";
import { hexToBytes, strip0x } from "@aragon/sdk-common";
import { permissionParamsToContract } from "../utils";
import { Contract } from "@ethersproject/contracts";
import { erc20ContractAbi } from "../abi/erc20";
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
   * Computes the payload to be given when creating a proposal that withdraws ether or an ERC20 token from the DAO
   *
   * @param {string} daoAddressOrEns
   * @param {WithdrawParams} params
   * @return {*}  {Promise<DaoAction>}
   * @memberof ClientEncoding
   */
  public async withdrawAction(
    daoAddressOrEns: string,
    params: WithdrawParams,
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

    if (params.type === TokenStandards.ERC20) {
      if (params.tokenAddress) {
        const contract = new Contract(
          params.tokenAddress,
          erc20ContractAbi,
        );
        const tx = await contract.populateTransaction.transfer(
          address,
          params.amount,
        );
        return {
          to: tx.to!,
          value: BigInt(0),
          data: toUtf8Bytes(tx.data!),
        };
      }
      return {
        to: address,
        value: params.amount,
        data: toUtf8Bytes("0x"),
      };
    } else {
      // TODO ERC721 and ERC1155"
      throw new Error("not implemented");
    }
  }
  /**
   * Computes the payload to be given when creating a proposal that updates the metadata the DAO
   *
   * @param {string} daoAddressOrEns
   * @param {DaoMetadata} params
   * @return {*}  {Promise<DaoAction>}
   * @memberof ClientEncoding
   */
  public async updateDaoMetadataAction(
    daoAddressOrEns: string,
    metadataUri: string,
  ): Promise<DaoAction> {
    let address = daoAddressOrEns;
    if (!isAddress(daoAddressOrEns)) {
      const resolvedAddress = await this.web3.getSigner()?.resolveName(
        daoAddressOrEns,
      );
      if (!resolvedAddress) {
        throw new Error("Invalid ENS");
      }
      address = resolvedAddress;
    }
    // upload metadata to IPFS
    const daoInterface = DAO__factory.createInterface();
    const args = new TextEncoder().encode(metadataUri);
    const hexBytes = daoInterface.encodeFunctionData("setMetadata", [args]);
    const data = hexToBytes(strip0x(hexBytes));
    return {
      to: address,
      value: BigInt(0),
      data,
    };
  }
}
