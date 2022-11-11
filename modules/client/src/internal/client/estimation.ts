import { DAO__factory } from "@aragon/core-contracts-ethers";
import {
  InvalidAddressOrEnsError,
  NoProviderError,
  NoSignerError,
  NoTokenAddress,
  Random,
} from "@aragon/sdk-common";
import { BigNumber } from "@ethersproject/bignumber";
import { AddressZero } from "@ethersproject/constants";
import { Contract } from "@ethersproject/contracts";
import { erc20ContractAbi } from "../abi/erc20";
import { ClientCore, Context, GasFeeEstimation } from "../../client-common";
import {
  ICreateParams,
  IDepositParams,
} from "../../interfaces";
import { unwrapDepositParams } from "../utils";
import { isAddress } from "@ethersproject/address";

/**
 * Estimation module the SDK Generic Client
 */
export class ClientEstimation extends ClientCore {
  constructor(context: Context) {
    super(context);
    Object.freeze(ClientEstimation.prototype);
    Object.freeze(this);
  }
  /**
   * Estimates the gas fee of creating a DAO
   *
   * @param {ICreateParams} _params
   * @return {*}  {Promise<GasFeeEstimation>}
   * @memberof ClientEstimation
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
