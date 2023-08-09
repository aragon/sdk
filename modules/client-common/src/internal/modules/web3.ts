import { JsonRpcProvider } from "@ethersproject/providers";
import { isAddress } from "@ethersproject/address";
import { Contract, ContractInterface } from "@ethersproject/contracts";
import { Signer } from "@ethersproject/abstract-signer";
import {
  CannotEstimateGasError,
  InvalidAddressError,
  InvalidContractAbiError,
  NoNodesAvailableError,
  NoProviderError,
  NoSignerError,
  UnsupportedNetworkError,
} from "@aragon/sdk-common";
import { IClientWeb3Core } from "../interfaces";
import { Context } from "../../context";
import {
  GasFeeEstimation,
  SupportedNetwork,
  SupportedNetworksArray,
} from "../../types";
export class Web3Module implements IClientWeb3Core {
  private static readonly PRECISION_FACTOR_BASE = 1000;
  private providerIdx: number = -1;
  private context: Context;

  constructor(context: Context) {
    this.context = context;
    this.providerIdx = Math.floor(Math.random() * context.web3Providers.length);
  }

  /** Starts using the next available Web3 provider */
  public shiftProvider(): void {
    if (!this.context.web3Providers.length) {
      throw new NoProviderError();
    } else if (this.context.web3Providers.length <= 1) {
      throw new NoNodesAvailableError("web3");
    }
    this.providerIdx = (this.providerIdx + 1) %
      this.context.web3Providers.length;
  }

  /** Retrieves the current signer */
  public getSigner(): Signer {
    if (!this.context.signer) {
      throw new NoSignerError();
    }
    return this.context.signer;
  }
  /** Returns the currently active network provider */
  public getProvider(): JsonRpcProvider {
    if (!this.context.web3Providers[this.providerIdx]) {
      throw new NoProviderError();
    }
    return this.context.web3Providers[this.providerIdx];
  }

  /** Returns the currently active network */
  public getNetworkName(): SupportedNetwork {
    const networkName = this.context.network.name as SupportedNetwork;
    if (!SupportedNetworksArray.includes(networkName)) {
      throw new UnsupportedNetworkError(networkName);
    }
    return networkName;
  }

  /** Returns a signer connected to the current network provider */
  public getConnectedSigner(): Signer {
    let signer = this.getSigner();
    if (!signer.provider) {
      const provider = this.getProvider();
      signer = signer.connect(provider);
    }
    return signer;
  }

  /** Returns whether the current provider is functional or not */
  public isUp(): Promise<boolean> {
    const provider = this.getProvider();
    return provider
      .getNetwork()
      .then(() => true)
      .catch(() => false);
  }

  public async ensureOnline(): Promise<void> {
    if (!this.context.web3Providers.length) {
      throw new NoProviderError();
    }

    for (let i = 0; i < this.context.web3Providers.length; i++) {
      if (await this.isUp()) return;
      this.shiftProvider();
    }
    throw new NoNodesAvailableError("web3");
  }

  /**
   * Returns a contract instance at the given address
   *
   * @param address Contract instance address
   * @param abi The Application Binary Inteface of the contract
   * @return A contract instance attached to the given address
   */
  public attachContract<T>(
    address: string,
    abi: ContractInterface,
  ): Contract & T {
    if (!address || !isAddress(address)) throw new InvalidAddressError();
    else if (!abi) throw new InvalidContractAbiError();
    const signer = this.getConnectedSigner();
    return new Contract(address, abi, signer) as Contract & T;
  }

  /** Calculates the expected maximum gas fee */
  public getMaxFeePerGas(): Promise<bigint> {
    return this.getConnectedSigner()
      .getFeeData()
      .then((feeData) => {
        if (!feeData.maxFeePerGas) {
          throw new CannotEstimateGasError();
        }
        return feeData.maxFeePerGas.toBigInt();
      });
  }

  public getApproximateGasFee(estimatedFee: bigint): Promise<GasFeeEstimation> {
    return this.getMaxFeePerGas().then((maxFeePerGas) => {
      const max = estimatedFee * maxFeePerGas;

      const factor = this.context.gasFeeEstimationFactor *
        Web3Module.PRECISION_FACTOR_BASE;

      const average = (max * BigInt(Math.trunc(factor))) /
        BigInt(Web3Module.PRECISION_FACTOR_BASE);

      return { average, max };
    });
  }

  /** FRAMEWORK ADDRESSES */
  /** Returns the current DAO factory address */
  get daoFactoryAddress(): string {
    const daoFactoryAddress = this.context.daoFactoryAddress;
    if (!daoFactoryAddress || !isAddress(daoFactoryAddress)) {
      throw new InvalidAddressError();
    }
    return daoFactoryAddress;
  }

  /** Returns the current plugin setup processor address */
  get pluginSetupProcessorAddress(): string {
    const pluginSetupProcessorAddress =
      this.context.pluginSetupProcessorAddress;
    if (
      !pluginSetupProcessorAddress || !isAddress(pluginSetupProcessorAddress)
    ) {
      throw new InvalidAddressError();
    }
    return pluginSetupProcessorAddress;
  }

  /** Returns the current ens registry address */
  get ensRegistryAddress(): string {
    const ensRegistryAddress = this.context.ensRegistryAddress;
    if (!ensRegistryAddress || !isAddress(ensRegistryAddress)) {
      throw new InvalidAddressError();
    }
    return ensRegistryAddress;
  }

  // TODO:
  // Remove this on code split
  /** MULTISIG PLUGIN ADDRESSES */
  get multisigRepoAddress(): string {
    const multisigRepoAddress = this.context.multisigRepoAddress;
    if (!multisigRepoAddress || !isAddress(multisigRepoAddress)) {
      throw new InvalidAddressError();
    }
    return multisigRepoAddress;
  }

  get multisigSetupAddress(): string {
    const multisigSetupAddress = this.context.multisigSetupAddress;
    if (!multisigSetupAddress || !isAddress(multisigSetupAddress)) {
      throw new InvalidAddressError();
    }
    return multisigSetupAddress;
  }
  // TODO:
  // Remove this on code split
  /** TOKENVOTING PLUGIN ADDRESSES */

  /** Returns the current token voting repo address */
  get tokenVotingRepoAddress(): string {
    const tokenVotingRepoAddress = this.context.tokenVotingRepoAddress;
    if (!tokenVotingRepoAddress || !isAddress(tokenVotingRepoAddress)) {
      throw new InvalidAddressError();
    }
    return tokenVotingRepoAddress;
  }

  /** Returns the current token voting setup address */
  get tokenVotingSetupAddress(): string {
    const tokenVotingSetupAddress = this.context.tokenVotingSetupAddress;
    if (!tokenVotingSetupAddress || !isAddress(tokenVotingSetupAddress)) {
      throw new InvalidAddressError();
    }
    return tokenVotingSetupAddress;
  }

  // TODO:
  // Remove this on code split
  /** ADDRESSLISTVOTING PLUGIN ADDRESSES */

  /** Returns the current addresslist voting repo address */
  get addresslistVotingRepoAddress(): string {
    const addresslistVotingRepoAddress =
      this.context.addresslistVotingRepoAddress;
    if (
      !addresslistVotingRepoAddress || !isAddress(addresslistVotingRepoAddress)
    ) {
      throw new InvalidAddressError();
    }
    return addresslistVotingRepoAddress;
  }
  /** Returns the current addresslist voting setup address */
  get addresslistVotingSetupAddress(): string {
    const addresslistVotingSetupAddress =
      this.context.addresslistVotingSetupAddress;
    if (
      !addresslistVotingSetupAddress ||
      !isAddress(addresslistVotingSetupAddress)
    ) {
      throw new InvalidAddressError();
    }
    return addresslistVotingSetupAddress;
  }

  // TODO:
  // Remove this on code split
  /* ADMIN PLUGIN ADDRESSES */

  /** Returns the current admin repo address */
  get adminRepoAddress(): string {
    const adminRepoAddress = this.context.adminRepoAddress;
    if (!adminRepoAddress || !isAddress(adminRepoAddress)) {
      throw new InvalidAddressError();
    }
    return adminRepoAddress;
  }

  /** Returns the current admin setup address */
  get adminSetupAddress(): string {
    const adminSetupAddress = this.context.adminSetupAddress;
    if (!adminSetupAddress || !isAddress(adminSetupAddress)) {
      throw new InvalidAddressError();
    }
    return adminSetupAddress;
  }
}
