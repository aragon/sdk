import {
  DAO__factory,
  DAOFactory,
  DAOFactory__factory,
  PluginRepo__factory,
} from "@aragon/core-contracts-ethers";
import {
  InvalidAddressOrEnsError,
  NoProviderError,
  NoSignerError,
  NoTokenAddress,
} from "@aragon/sdk-common";
import { BigNumber } from "@ethersproject/bignumber";
import { AddressZero } from "@ethersproject/constants";
import { Contract } from "@ethersproject/contracts";
import { erc20ContractAbi } from "../abi/erc20";
import { ClientCore, Context, GasFeeEstimation } from "../../client-common";
import {
  IClientEstimation,
  CreateDaoParams,
  IDepositParams,
} from "../../interfaces";
import { unwrapDepositParams } from "../utils";
import { isAddress } from "@ethersproject/address";
import { toUtf8Bytes, toUtf8String } from "@ethersproject/strings";
import { createParamsSchema, depositParamsSchema } from "../../schemas";

/**
 * Estimation module the SDK Generic Client
 */
export class ClientEstimation extends ClientCore implements IClientEstimation {
  constructor(context: Context) {
    super(context);
    Object.freeze(ClientEstimation.prototype);
    Object.freeze(this);
  }
  /**
   * Estimates the gas fee of creating a DAO
   *
   * @param {CreateDaoParams} _params
   * @return {*}  {Promise<GasFeeEstimation>}
   * @memberof ClientEstimation
   */
  public async createDao(params: CreateDaoParams): Promise<GasFeeEstimation> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new NoSignerError();
    } else if (!signer.provider) {
      throw new NoProviderError();
    }

    const daoInstance = DAOFactory__factory.connect(
      this.web3.getDaoFactoryAddress(),
      signer,
    );
    const pluginInstallationData: DAOFactory.PluginSettingsStruct[] = [];
    for (const plugin of params.plugins) {
      const latestVersion = await PluginRepo__factory.connect(
        plugin.id,
        signer,
      ).getLatestVersion();
      pluginInstallationData.push({
        pluginSetup: latestVersion[1],
        pluginSetupRepo: plugin.id,
        data: toUtf8String(plugin.data),
      });
    }
    createParamsSchema.strict().validateSync(params);

    const gasEstimation = await daoInstance.estimateGas.createDao(
      {
        name: params.ensSubdomain,
        metadata: toUtf8Bytes(params.metadataUri),
        trustedForwarder: params.trustedForwarder || AddressZero,
      },
      pluginInstallationData,
    );

    return this.web3.getApproximateGasFee(gasEstimation.toBigInt());
  }
  /**
   * Estimates the gas fee of depositing ether or an ERC20 token into the DAO
   * This does not estimate the gas cost of updating the allowance of an ERC20 token
   *
   * @param {IDepositParams} params
   * @return {*}  {Promise<GasFeeEstimation>}
   * @memberof ClientEstimation
   */
  public deposit(params: IDepositParams): Promise<GasFeeEstimation> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new NoSignerError();
    } else if (!signer.provider) {
      throw new NoProviderError();
    }
    depositParamsSchema.strict().validateSync(params);

    const [daoAddress, amount, tokenAddress, reference] = unwrapDepositParams(
      params,
    );

    const daoInstance = DAO__factory.connect(daoAddress, signer);

    const override: { value?: BigNumber } = {};
    if (tokenAddress === AddressZero) {
      override.value = amount;
    }

    return daoInstance.estimateGas
      .deposit(tokenAddress, amount, reference, override)
      .then((gasLimit) => {
        return this.web3.getApproximateGasFee(gasLimit.toBigInt());
      });
  }
  /**
   * Estimates the gas fee of updating the allowance of an ERC20 token
   *
   * @param {IDepositParams} _params
   * @return {*}  {Promise<GasFeeEstimation>}
   * @memberof ClientEstimation
   */
  public async updateAllowance(
    params: IDepositParams,
  ): Promise<GasFeeEstimation> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new NoSignerError();
    } else if (!signer.provider) {
      throw new NoProviderError();
    } else if (!params.tokenAddress) {
      throw new NoTokenAddress();
    }

    depositParamsSchema.strict().validateSync(params);

    // resolve ens
    let daoAddress = params.daoAddressOrEns;
    if (!isAddress(daoAddress)) {
      await this.web3.ensureOnline();
      const provider = this.web3.getProvider();
      if (!provider) {
        throw new NoProviderError();
      }
      const resolvedAddress = await provider.resolveName(daoAddress);
      if (!resolvedAddress) {
        throw new InvalidAddressOrEnsError();
      }
      daoAddress = resolvedAddress;
    }

    const contract = new Contract(
      params.tokenAddress,
      erc20ContractAbi,
      signer,
    );
    return contract.estimateGas.approve(
      daoAddress,
      params.amount,
    ).then((gasLimit) => {
      return this.web3.getApproximateGasFee(gasLimit.toBigInt());
    });
  }
}
