import { Signer } from "@ethersproject/abstract-signer";
import { Wallet } from "@ethersproject/wallet";
import { JsonRpcProvider } from "@ethersproject/providers";
import { Contract, ContractInterface } from "@ethersproject/contracts";
import { IClientCore } from "./interfaces/core";
import { Context } from "../context";
import { GasFeeEstimation } from "./interfaces/common";
// NOTE: Backing off ipfs-http-client until the UI framework supports it
// import { Random } from "@aragon/sdk-common";

// NOTE: Backing off ipfs-http-client until the UI framework supports it
// import { IPFSHTTPClient } from "ipfs-http-client";

/**
 * Provides the low level foundation so that subclasses have ready-made access to Web3, IPFS and GraphQL primitives
 */
export abstract class ClientCore implements IClientCore {
  private static readonly PRECISION_FACTOR_BASE = 1000;

  private _web3Providers: JsonRpcProvider[] = [];
  private _web3Idx = -1;
  private _signer: Signer | undefined;
  private _daoFactoryAddress = "";
  private _gasFeeEstimationFactor = 1;
  // NOTE: Backing off ipfs-http-client until the UI framework supports it
  // private _ipfs: IPFSHTTPClient[] = [];
  // private _ipfsIdx: number = -1;

  constructor(context: Context) {
    // NOTE: Backing off ipfs-http-client until the UI framework supports it
    // if (context.ipfs?.length) {
    //   this._ipfs = context.ipfs;
    //   this._ipfsIdx = Math.floor(Random.getFloat() * context.ipfs.length);
    // }
    if (context.web3Providers) {
      this._web3Providers = context.web3Providers;
      this._web3Idx = 0;
    }

    if (context.signer) {
      this.web3.useSigner(context.signer);
    }

    if (context.daoFactoryAddress) {
      this._daoFactoryAddress = context.daoFactoryAddress;
    }

    if (context.gasFeeEstimationFactor) {
      this._gasFeeEstimationFactor = context.gasFeeEstimationFactor;
    }
  }

  web3 = {
    /** Replaces the current signer by the given one */
    useSigner: (signer: Signer) => {
      if (!signer) {
        throw new Error("Empty wallet or signer");
      }
      this._signer = signer;
    },

    /** Starts using the next available Web3 endpoint */
    shiftEndpoint: () => {
      if (!this._web3Providers.length) throw new Error("No endpoints");
      else if (this._web3Providers.length <= 1) {
        throw new Error("No other endpoints");
      }

      this._web3Idx = (this._web3Idx + 1) % this._web3Providers.length;
    },

    /** Retrieves the current signer */
    getSigner: () => {
      return this._signer || null;
    },

    /** Returns a signer connected to the current network provider */
    getConnectedSigner: () => {
      let signer = this.web3.getSigner();
      if (!signer) throw new Error("No signer");
      else if (!signer.provider && !this.web3.getProvider()) {
        throw new Error("No provider");
      } else if (signer.provider) return signer;

      signer = signer.connect(this.web3.getProvider());
      return signer;
    },

    /** Returns the currently active network provider */
    getProvider: () => {
      return this._web3Providers[this._web3Idx] || null;
    },

    /** Returns whether the current provider is functional or not */
    isUp: () => {
      return this.web3.getProvider()
        .getNetwork()
        .then(() => true)
        .catch(() => false);
    },

    /**
     * Returns a contract instance at the given address
     *
     * @param address Contract instance address
     * @param abi The Application Binary Inteface of the contract
     * @return A contract instance attached to the given address
     */
    attachContract: <T>(
      address: string,
      abi: ContractInterface,
    ) => {
      if (!address) throw new Error("Invalid contract address");
      else if (!abi) throw new Error("Invalid contract ABI");

      const signer = this.web3.getSigner();
      if (!signer) throw new Error("No signer");
      else if (!this.web3.getProvider()) throw new Error("No signer");

      const provider = this.web3.getProvider();
      const contract = new Contract(address, abi, provider);

      if (!signer) return contract as Contract & T;
      else if (signer instanceof Wallet) {
        return contract.connect(signer.connect(provider)) as Contract & T;
      }

      return contract.connect(signer) as Contract & T;
    },

    /** Calculates the expected maximum gas fee */
    getMaxFeePerGas: () => {
      return this.web3.getConnectedSigner()
        .getFeeData()
        .then((feeData) => {
          if (!feeData.maxFeePerGas) {
            return Promise.reject(new Error("Cannot estimate gas"));
          }
          return feeData.maxFeePerGas.toBigInt();
        });
    },

    getApproximateGasFee: (estimatedFee: bigint) => {
      return this.web3.getMaxFeePerGas()
        .then((maxFeePerGas) => {
          const max = estimatedFee * maxFeePerGas;

          const factor = this._gasFeeEstimationFactor *
            ClientCore.PRECISION_FACTOR_BASE;

          const average = (max * BigInt(Math.trunc(factor))) /
            BigInt(ClientCore.PRECISION_FACTOR_BASE);

          return { average, max } as GasFeeEstimation;
        });
    },

    /** Returns the current DAO factory address */
    getDaoFactoryAddress: () => {
      return this._daoFactoryAddress;
    },
  };

  ipfs = {
    // NOTE: Backing off ipfs-http-client until the UI framework supports it

    // /**
    //  * Starts using the next available IPFS endpoint
    //  */
    // public shiftIpfsNode() {
    //   if (!this._ipfs.length) throw new Error("No IPFS endpoints available");
    //   else if (this._ipfs.length < 2) {
    //     throw new Error("No other endpoints");
    //   }
    //   this._ipfsIdx = (this._ipfsIdx + 1) % this._ipfs.length;
    //   return this;
    // }

    // get ipfs() {
    //   if (!this._ipfs[this._ipfsIdx]) {
    //     throw new Error("No IPFS endpoints available");
    //   }
    //   return this._ipfs[this._ipfsIdx];
    // }

    // /** Returns `true` if the current client is on line */
    // public isIpfsNodeUp(): Promise<boolean> {
    //   // Note: the TS typing is incorrect (returns a Promise)
    //   return Promise.resolve(this.ipfs.isOnline())
    //     .catch(() => false);
    // }

    // // IPFS METHODS

    // public async pin(input: string | Uint8Array): Promise<string> {
    //   if (!this.ipfs) {
    //     throw new Error("IPFS client is not initialized");
    //   }
    //   // find online node
    //   let isOnline = false;
    //   for (var i = 0; i < this._ipfs.length; i++) {
    //     isOnline = await this.isIpfsNodeUp();
    //     if (isOnline) break;

    //     this.shiftIpfsNode();
    //   }
    //   if (!isOnline) throw new Error("No IPFS nodes available");

    //   return this._ipfs[this._ipfsIdx]
    //     .add(input)
    //     .then((res) => res.path)
    //     .catch((e) => {
    //       throw new Error("Could not pin data: " + (e?.message || ""));
    //     });
    // }

    // public async fetchBytes(cid: string) {
    //   if (!this.ipfs) throw new Error("IPFS client is not initialized");
    //   // find online node
    //   let isOnline = false;
    //   for (let i = 0; i < this._ipfs.length; i++) {
    //     isOnline = await this.isIpfsNodeUp();
    //     if (isOnline) break;

    //     this.shiftIpfsNode();
    //   }
    //   if (!isOnline) throw new Error("No IPFS nodes available");

    //   try {
    //     const chunks: Uint8Array[] = [];
    //     let totalArrayLength = 0;
    //     for await (const chunk of this._ipfs[this._ipfsIdx].cat(cid)) {
    //       chunks.push(chunk);
    //       totalArrayLength += chunk.length;
    //     }

    //     const mergedArray = new Uint8Array(totalArrayLength);
    //     let lastIndex = 0;
    //     for (const chunk of chunks) {
    //       mergedArray.set(chunk, lastIndex);
    //       lastIndex += chunk.length;
    //     }
    //     return mergedArray;
    //   } catch (e) {
    //     throw new Error("Could not fetch data");
    //   }
    // }

    // public fetchString(cid: string): Promise<string> {
    //   return this.fetchBytes(cid)
    //     .then((bytes) => new TextDecoder().decode(bytes))
    //     .catch((e) => {
    //       throw new Error(
    //         "Error while fetching and decoding bytes: " + (e?.message || ""),
    //       );
    //     });
    // }
  };
}
