import { Signer } from "@ethersproject/abstract-signer";
import { Wallet } from "@ethersproject/wallet";
import { JsonRpcProvider } from "@ethersproject/providers";
import { Contract, ContractInterface } from "@ethersproject/contracts";
import { IClientCore } from "./interfaces/client-core";
import { Context } from "../context";
import { ICreateProposal, VoteOption } from "./interfaces/dao";
import { IDAO } from "@aragon/core-contracts-ethers";
import { BigNumberish } from "@ethersproject/bignumber";

export abstract class ClientCore implements IClientCore {
  private _web3Providers: JsonRpcProvider[] = [];
  private _web3Idx = -1;
  private _signer: Signer | undefined;
  private _daoFactoryAddress = "";

  constructor(context: Context) {
    if (context.web3Providers) {
      this._web3Providers = context.web3Providers;
      this._web3Idx = 0;
    }

    if (context.signer) {
      this.useSigner(context.signer);
    }

    if (context.daoFactoryAddress) {
      this._daoFactoryAddress = context.daoFactoryAddress;
    }
  }

  /**
   * Replaces the current signer by the given one
   *
   * @param signer
   */
  protected useSigner(signer: Signer) {
    if (!signer) {
      throw new Error("Empty wallet or signer");
    }

    this._signer = signer;
    return this;
  }

  /**
   * Starts using the next available Web3 endpoints
   */
  shiftWeb3Node() {
    if (!this._web3Providers.length) throw new Error("No endpoints");
    else if (this._web3Providers.length <= 1) {
      throw new Error("No other endpoints");
    }

    this._web3Idx = (this._web3Idx + 1) % this._web3Providers.length;
    return this;
  }

  get signer() {
    return this._signer || null;
  }

  get connectedSigner() {
    if (!this.signer) throw new Error("No signer");
    else if (!this.signer.provider && !this.web3)
      throw new Error("No provider");

    return this.signer.provider ? this.signer : this.signer.connect(this.web3);
  }

  get web3() {
    return this._web3Providers[this._web3Idx] || null;
  }

  get daoFactoryAddress() {
    return this._daoFactoryAddress;
  }

  public async checkWeb3Status(): Promise<boolean> {
    return this.web3
      .getNetwork()
      .then(() => true)
      .catch(() => false);
  }

  /**
   * Use the contract instance at the given address
   *
   * @param address Contract instance address
   * @param abi The Application Binary Inteface of the contract
   * @return A contract instance attached to the given address
   */
  attachContract<T>(address: string, abi: ContractInterface): Contract & T {
    if (!address) throw new Error("Invalid contract address");
    else if (!abi) throw new Error("Invalid contract ABI");

    const contract = new Contract(address, abi, this.web3);

    if (!this.signer) return contract as Contract & T;
    else if (this.signer instanceof Wallet) {
      return contract.connect(this.signer.connect(this.web3)) as Contract & T;
    }

    return contract.connect(this.signer) as Contract & T;
  }

  protected static createProposalParameters(
    params: ICreateProposal
  ): [
    string,
    IDAO.ActionStruct[],
    BigNumberish,
    BigNumberish,
    boolean,
    BigNumberish
  ] {
    return [
      params.metadata,
      params.actions ?? [],
      params.startDate ?? 0,
      params.endDate ?? 0,
      params.executeIfDecided ?? false,
      params.creatorChoice ?? VoteOption.NONE,
    ];
  }
}
