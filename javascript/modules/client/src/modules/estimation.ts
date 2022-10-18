import { DAO__factory } from "@aragon/core-contracts-ethers";
import { Random } from "@aragon/sdk-common";
import { BigNumber } from "@ethersproject/bignumber";
import { AddressZero } from "@ethersproject/constants";
import { Context } from "../context";
import { ClientCore } from "../internal/core";
import {
  IClientEstimation,
  ICreateParams,
  IDepositParams,
} from "../internal/interfaces/client";
import { GasFeeEstimation } from "../internal/interfaces/common";
import { unwrapDepositParams } from "../internal/utils/client";

export class IClientEstimationModule extends ClientCore
  implements IClientEstimation {
  constructor(context: Context) {
    super(context);
  }
  /**
   * Estimates the gas fee of creating a DAO
   *
   * @param {ICreateParams} _params
   * @return {*}  {Promise<GasFeeEstimation>}
   * @memberof IClientEstimationModule
   */
  public create(_params: ICreateParams): Promise<GasFeeEstimation> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new Error("A signer is needed for estimating the gas cost");
    }

    // TODO: Unimplemented
    // TODO: The new contract code is needed
    return Promise.resolve(
      this.web3.getApproximateGasFee(Random.getBigInt(BigInt(1500))),
    );
  }
  /**
   * Estimates the gas fee of depositing ether or an ERC20 token into the DAO
   *
   * @param {IDepositParams} params
   * @return {*}  {Promise<GasFeeEstimation>}
   * @memberof IClientEstimationModule
   */
  public deposit(params: IDepositParams): Promise<GasFeeEstimation> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new Error("A signer is needed for estimating the gas cost");
    }

    const [daoAddress, amount, tokenAddress, reference] = unwrapDepositParams(
      params,
    );

    const daoInstance = DAO__factory.connect(daoAddress, signer);

    const override: { value?: BigNumber } = {};
    if (tokenAddress === AddressZero) {
      override.value = amount;
    }

    // TODO: If the approved ERC20 amount is not enough,
    // estimate the cose of increasing the allowance

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
   * @memberof IClientEstimationModule
   */
  public updateAllowance(_params: IDepositParams): Promise<GasFeeEstimation> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new Error("A signer is needed");
    } else if (!signer.provider) {
      throw new Error("A web3 provider is needed");
    }
    // TODO: remove this
    return Promise.resolve(
      this.web3.getApproximateGasFee(Random.getBigInt(BigInt(1500))),
    );
  }
}
