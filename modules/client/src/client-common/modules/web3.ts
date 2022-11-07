import { Context } from "../../client-common/context";
import { Wallet } from "@ethersproject/wallet";
import { JsonRpcProvider } from "@ethersproject/providers";
import { Contract, ContractInterface } from "@ethersproject/contracts";
import { Signer } from "@ethersproject/abstract-signer";
import { GasFeeEstimation } from "../../client-common/interfaces/common";
import { IClientWeb3Core } from "../interfaces/core";
import { NoDaoFactory, NoPluginRepoRegistry, NoDaoRegistry } from "@aragon/sdk-common";

export class Web3Module implements IClientWeb3Core {
  private static readonly PRECISION_FACTOR_BASE = 1000;
  private providerIdx = -1;
  private providers: JsonRpcProvider[] = [];
  private signer?: Signer;
  private daoFactoryAddress?: string;
  private daoRegistryAddress?: string;
  private pluginRepoRegistryAddress?: string;
  private gasFeeEstimationFactor = 1;

  constructor(context: Context) {
    // Storing client data in the private module's scope to prevent external mutation
    if (context.web3Providers) {
      this.providerIdx = 0;
      this.providers = context.web3Providers;
    }

    if (context.signer) {
      this.useSigner(context.signer);
    }

    if (context.daoFactoryAddress) {
      this.daoFactoryAddress = context.daoFactoryAddress;
    }

    if (context.daoRegistryAddress) {
      this.daoRegistryAddress = context.daoRegistryAddress;
    }

    if (context.pluginRepoRegistryAddress) {
      this.pluginRepoRegistryAddress = context.pluginRepoRegistryAddress;
    }

    if (context.gasFeeEstimationFactor) {
      this.gasFeeEstimationFactor = context.gasFeeEstimationFactor;
    }
  }

  /** Replaces the current signer by the given one */
  public useSigner(signer: Signer): void {
    if (!signer) {
      throw new Error("Empty wallet or signer");
    }
    this.signer = signer;
  }

  /** Starts using the next available Web3 provider */
  public shiftProvider(): void {
    if (!this.providers.length) {
      throw new Error("No endpoints");
    } else if (this.providers.length <= 1) {
      throw new Error("No other endpoints");
    }
    this.providerIdx = (this.providerIdx + 1) % this.providers.length;
  }

  /** Retrieves the current signer */
  public getSigner(): Signer | null {
    return this.signer || null;
  }

  /** Returns a signer connected to the current network provider */
  public getConnectedSigner(): Signer {
    let signer = this.getSigner();
    if (!signer) {
      throw new Error("No signer");
    } else if (!signer.provider && !this.getProvider()) {
      throw new Error("No provider");
    } else if (signer.provider) {
      return signer;
    }

    const provider = this.getProvider();
    if (!provider) throw new Error("No provider");

    signer = signer.connect(provider);
    return signer;
  }

  /** Returns the currently active network provider */
  public getProvider(): JsonRpcProvider | null {
    return this.providers[this.providerIdx] || null;
  }

  /** Returns whether the current provider is functional or not */
  public isUp(): Promise<boolean> {
    const provider = this.getProvider();
    if (!provider) return Promise.reject(new Error("No provider"));

    return provider
      .getNetwork()
      .then(() => true)
      .catch(() => false);
  }

  public async ensureOnline(): Promise<void> {
    if (!this.providers.length) {
      return Promise.reject(new Error("No provider"));
    }

    for (let i = 0; i < this.providers.length; i++) {
      if (await this.isUp()) return;

      this.shiftProvider();
    }
    throw new Error("No providers available");
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
    abi: ContractInterface
  ): Contract & T {
    if (!address) throw new Error("Invalid contract address");
    else if (!abi) throw new Error("Invalid contract ABI");

    const signer = this.getSigner();
    if (!signer && !this.getProvider()) {
      throw new Error("No signer");
    }

    const provider = this.getProvider();
    if (!provider) throw new Error("No provider");

    const contract = new Contract(address, abi, provider);

    if (!signer) {
      return contract as Contract & T;
    } else if (signer instanceof Wallet) {
      return contract.connect(signer.connect(provider)) as Contract & T;
    }

    return contract.connect(signer) as Contract & T;
  }

  /** Calculates the expected maximum gas fee */
  public getMaxFeePerGas(): Promise<bigint> {
    return this.getConnectedSigner()
      .getFeeData()
      .then(feeData => {
        if (!feeData.maxFeePerGas) {
          return Promise.reject(new Error("Cannot estimate gas"));
        }
        return feeData.maxFeePerGas.toBigInt();
      });
  }

  public getApproximateGasFee(estimatedFee: bigint): Promise<GasFeeEstimation> {
    return this.getMaxFeePerGas().then(maxFeePerGas => {
      const max = estimatedFee * maxFeePerGas;

      const factor =
        this.gasFeeEstimationFactor * Web3Module.PRECISION_FACTOR_BASE;

      const average =
        (max * BigInt(Math.trunc(factor))) /
        BigInt(Web3Module.PRECISION_FACTOR_BASE);

      return { average, max };
    });
  }

  /** Returns the current DAO factory address */
  public getDaoFactoryAddress(): string {
    if (!this.daoFactoryAddress) {
      throw new NoDaoFactory();
    }
    return this.daoFactoryAddress;
  }

  public getPluginRepoRegistryAddress(): string {
    if (!this.pluginRepoRegistryAddress) {
      throw new NoPluginRepoRegistry();
    }
    return this.pluginRepoRegistryAddress;
  }

  public getDaoRegistry(): string {
    if (!this.daoRegistryAddress) {
      throw new NoDaoRegistry();
    }
    return this.daoRegistryAddress;
  }
}
