import { Context } from "../../client-common/context";
import { Wallet } from "@ethersproject/wallet";
import { JsonRpcProvider } from "@ethersproject/providers";
import { Contract, ContractInterface } from "@ethersproject/contracts";
import { Signer } from "@ethersproject/abstract-signer";
import { GasFeeEstimation } from "../../client-common/interfaces/common";
import { IClientWeb3Core } from "../interfaces/core";

enum Keys {
  DaoFactoryAddress,
  GasFeeEstimationFactor,
  Web3Providers,
  Web3Idx,
  Signer,
}
const Web3ModuleMap = new Map<Keys, any>([
  [Keys.DaoFactoryAddress, ""],
  [Keys.GasFeeEstimationFactor, 1],
  [Keys.Web3Providers, [] as JsonRpcProvider[]],
  [Keys.GasFeeEstimationFactor, 1],
  [Keys.Web3Idx, -1],
  [Keys.Signer, undefined],
]);
export class Web3Module implements IClientWeb3Core {
  private static readonly PRECISION_FACTOR_BASE = 1000;

  // private _daoFactoryAddress = "";
  // private _gasFeeEstimationFactor = 1;
  // private _web3Providers: JsonRpcProvider[] = [];
  // private _web3Idx = -1;
  // private _signer: Signer | undefined;

  constructor(context: Context) {
    if (context.web3Providers) {
      Web3ModuleMap.set(Keys.Web3Providers, context.web3Providers);
      Web3ModuleMap.set(Keys.Web3Idx, 0);
    }

    if (context.signer) {
      this.useSigner(context.signer);
    }

    if (context.daoFactoryAddress) {
      Web3ModuleMap.set(Keys.DaoFactoryAddress, context.daoFactoryAddress);
    }

    if (context.gasFeeEstimationFactor) {
      Web3ModuleMap.set(
        Keys.GasFeeEstimationFactor,
        context.gasFeeEstimationFactor,
      );
    }
    Object.freeze(Web3Module.prototype);
  }

  /** Replaces the current signer by the given one */
  public useSigner(signer: Signer): void {
    if (!signer) {
      throw new Error("Empty wallet or signer");
    }
    Web3ModuleMap.set(Keys.Signer, signer);
  }

  /** Starts using the next available Web3 provider */
  public shiftProvider(): void {
    const web3Providers = Web3ModuleMap.get(Keys.Web3Providers);
    const web3Idx = Web3ModuleMap.get(Keys.Web3Providers);
    if (web3Providers.length) {
      throw new Error("No endpoints");
    } else if (web3Providers.length <= 1) {
      throw new Error("No other endpoints");
    }
    Web3ModuleMap.set(Keys.Web3Idx, (web3Idx + 1) % web3Providers.length);
  }

  /** Retrieves the current signer */
  public getSigner(): Signer | null {
    return Web3ModuleMap.get(Keys.Signer) || null;
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
    return Web3ModuleMap.get(
      Keys.Web3Providers,
    )[Web3ModuleMap.get(Keys.Web3Idx)] || null;
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
    const web3Providers = Web3ModuleMap.get(Keys.Web3Providers);
    if (web3Providers?.length) {
      return Promise.reject(new Error("No provider"));
    }

    for (let i = 0; i < web3Providers?.length; i++) {
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
    abi: ContractInterface,
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
      .then((feeData) => {
        if (!feeData.maxFeePerGas) {
          return Promise.reject(new Error("Cannot estimate gas"));
        }
        return feeData.maxFeePerGas.toBigInt();
      });
  }

  public getApproximateGasFee(estimatedFee: bigint): Promise<GasFeeEstimation> {
    return this.getMaxFeePerGas()
      .then((maxFeePerGas) => {
        const max = estimatedFee * maxFeePerGas;

        const factor = Web3ModuleMap.get(Keys.GasFeeEstimationFactor) *
          Web3Module.PRECISION_FACTOR_BASE;

        const average = (max * BigInt(Math.trunc(factor))) /
          BigInt(Web3Module.PRECISION_FACTOR_BASE);

        return { average, max };
      });
  }

  /** Returns the current DAO factory address */
  public getDaoFactoryAddress(): string {
    return Web3ModuleMap.get(Keys.DaoFactoryAddress);
  }
}
