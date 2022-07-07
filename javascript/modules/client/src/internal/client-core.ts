import { Signer } from "@ethersproject/abstract-signer";
import { Wallet } from "@ethersproject/wallet";
import { JsonRpcProvider } from "@ethersproject/providers";
import { Contract, ContractInterface, ContractReceipt, ContractTransaction } from "@ethersproject/contracts";
import { IClientCore } from "./interfaces/client-core";
import { Context } from "../context";
import {
  DaoDepositSteps,
  DaoDepositStepValue,
  ICreateProposal,
  IDeposit,
  IGasFeeEstimation,
  IProposalAction,
  IWithdraw,
  VoteOption,
} from "./interfaces/dao";
import {
  DAO__factory,
  IDAO,
} from "@aragon/core-contracts-ethers";
// NOTE: Backing off ipfs-http-client until the UI framework supports it
// import { Random } from "@aragon/sdk-common";
import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { AddressZero } from "@ethersproject/constants";
import { erc20ContractAbi } from "./abi/dao";

// NOTE: Backing off ipfs-http-client until the UI framework supports it
// import { IPFSHTTPClient } from "ipfs-http-client";

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
      this.useSigner(context.signer);
    }

    if (context.daoFactoryAddress) {
      this._daoFactoryAddress = context.daoFactoryAddress;
    }

    if (context.gasFeeEstimationFactor) {
      this._gasFeeEstimationFactor = context.gasFeeEstimationFactor;
    }
  }

  /**
   * Replaces the current signer by the given one
   *
   * @param signer
   */
  useSigner(signer: Signer) {
    if (!signer) {
      throw new Error("Empty wallet or signer");
    }
    this._signer = signer;
    return this;
  }

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

  /**
   * Starts using the next available Web3 endpoint
   */
  public shiftWeb3Node() {
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
    else if (!this.signer.provider && !this.web3) {
      throw new Error("No provider");
    }

    return this.signer.provider ? this.signer : this.signer.connect(this.web3);
  }

  get maxFeePerGas(): Promise<BigNumber> {
    return this.connectedSigner
      .getFeeData()
      .then(
        (feeData) =>
          feeData.maxFeePerGas ??
            Promise.reject(new Error("Cannot estimate gas"))
      );
  }

  get web3() {
    return this._web3Providers[this._web3Idx] || null;
  }

  get daoFactoryAddress() {
    return this._daoFactoryAddress;
  }

  // NOTE: Backing off ipfs-http-client until the UI framework supports it

  // get ipfs() {
  //   if (!this._ipfs[this._ipfsIdx]) {
  //     throw new Error("No IPFS endpoints available");
  //   }
  //   return this._ipfs[this._ipfsIdx];
  // }

  public isWeb3NodeUp(): Promise<boolean> {
    return this.web3
      .getNetwork()
      .then(() => true)
      .catch(() => false);
  }

  // NOTE: Backing off ipfs-http-client until the UI framework supports it

  // /** Returns `true` if the current client is on line */
  // public isIpfsNodeUp(): Promise<boolean> {
  //   // Note: the TS typing is incorrect (returns a Promise)
  //   return Promise.resolve(this.ipfs.isOnline())
  //     .catch(() => false);
  // }

  /**
   * Use the contract instance at the given address
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

    const contract = new Contract(address, abi, this.web3);

    if (!this.signer) return contract as Contract & T;
    else if (this.signer instanceof Wallet) {
      return contract.connect(this.signer.connect(this.web3)) as Contract & T;
    }

    return contract.connect(this.signer) as Contract & T;
  }

  // PARAMETER TEMPLATES

  protected static createProposalParameters(
    params: ICreateProposal,
  ): [
    string,
    IDAO.ActionStruct[],
    BigNumberish,
    BigNumberish,
    boolean,
    BigNumberish,
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

  protected static createDepositParameters(
    params: IDeposit,
  ): [string, BigNumber, string, string] {
    return [
      params.daoAddress,
      BigNumber.from(params.amount),
      params.token ?? AddressZero,
      params.reference ?? "",
    ];
  }

  protected static createWithdrawParameters(
    params: IWithdraw,
  ): [string, string, BigNumber, string] {
    return [
      params.token ?? AddressZero,
      params.to,
      BigNumber.from(params.amount),
      params.reference ?? "",
    ];
  }

  protected static createWithdrawAction(
    to: string,
    value: bigint,
    params: IWithdraw,
  ): IProposalAction {
    const data = ClientCore.createWithdrawActionData(params);
    return { to, value, data };
  }

  protected static createWithdrawActionData(params: IWithdraw): string {
    const daoInterface = DAO__factory.createInterface();
    return daoInterface.encodeFunctionData(
      "withdraw",
      ClientCore.createWithdrawParameters(params),
    );
  }

  // ESTIMATION

  protected estimateGasFee(
    gasLimitEstimationFromCall: Promise<BigNumber>,
  ): Promise<IGasFeeEstimation> {
    return Promise.all([this.maxFeePerGas, gasLimitEstimationFromCall]).then(
      (data) => {
        const max = data[0].mul(data[1]);

        const factor = this._gasFeeEstimationFactor *
          ClientCore.PRECISION_FACTOR_BASE;

        const average = max
          .mul(BigNumber.from(Math.trunc(factor)))
          .div(BigNumber.from(ClientCore.PRECISION_FACTOR_BASE));

        return { average: average.toBigInt(), max: max.toBigInt() };
      },
    );
  }

  // DAO METHODS

  protected async *deposit(
    params: IDeposit
  ): AsyncGenerator<DaoDepositStepValue> {
    if (!this.connectedSigner) {
      throw new Error("A signer is needed for creating a DAO");
    }

    const [
      daoAddress,
      amount,
      tokenAddress,
      reference,
    ] = ClientCore.createDepositParameters(params);

    // Depositing an ERC20 token?
    if (tokenAddress !== AddressZero) {
      const governanceERC20Instance = new Contract(
        tokenAddress,
        erc20ContractAbi,
        this.connectedSigner
      );

      const currentAllowance = await this.connectedSigner
        .getAddress()
        .then(address =>
          governanceERC20Instance.allowance(address, daoAddress)
        );
      yield {
        key: DaoDepositSteps.CHECKED_ALLOWANCE,
        allowance: currentAllowance.toBigInt(),
      };

      if (currentAllowance.lt(amount)) {
        const increaseAllowanceTx = await governanceERC20Instance.approve(
          daoAddress,
          BigNumber.from(amount)
        );
        yield {
          key: DaoDepositSteps.INCREASING_ALLOWANCE,
          txHash: increaseAllowanceTx.hash,
        };

        await increaseAllowanceTx.wait().then((cr: ContractReceipt) => {
          if (
            BigNumber.from(amount).gt(
              cr.events?.find(e => e?.event === "Approval")?.args?.value
            )
          ) {
            throw new Error("Could not increase allowance");
          }
        });

        yield {
          key: DaoDepositSteps.INCREASED_ALLOWANCE,
          allowance: amount.toBigInt(),
        };
      }
    }

    // Doing the transfer

    const daoInstance = DAO__factory.connect(daoAddress, this.connectedSigner);

    const override = tokenAddress !== AddressZero ? {} : {
            value: amount,
          };

    if (tokenAddress !== AddressZero) {
      const governanceERC20Instance = new Contract(
        tokenAddress,
        erc20ContractAbi,
        this.connectedSigner
      );

      const currentAllowance = await governanceERC20Instance.allowance(
        await this.connectedSigner.getAddress(),
        daoAddress,
      );

      if (currentAllowance.lt(amount)) {
        await governanceERC20Instance
          .approve(daoAddress, BigNumber.from(amount))
          .then((tx: ContractTransaction) => tx.wait())
          .then((cr: ContractReceipt) => {
            if (
              amount.gt(
                cr.events?.find(e => e?.event === "Approval")?.args?.value,
              )
            ) {
              throw new Error("Could not increase allowance");
            }
          });
      }
    }

    const depositTx = await daoInstance.deposit(
      tokenAddress,
      amount,
      reference,
      override
    );
    yield { key: DaoDepositSteps.DEPOSITING, txHash: depositTx.hash };

    await depositTx.wait().then(cr => {
      const eventAmount = cr.events?.find(e => e?.event === "Deposited")?.args
        ?.amount;
      if (!amount.eq(eventAmount)) {
        throw new Error(
          `Deposited amount mismatch. Expected: ${amount.toBigInt()}, received: ${eventAmount.toBigInt()}`
        );
      }
    });
    yield { key: DaoDepositSteps.DEPOSITED, amount: amount.toBigInt() };
  }

  protected estimateDeposit(params: IDeposit): Promise<IGasFeeEstimation> {
    if (!this.connectedSigner)
      throw new Error("A signer is needed for creating a DAO");

    const [
      daoAddress,
      amount,
      tokenAddress,
      reference,
    ] = ClientCore.createDepositParameters(params);

    const daoInstance = DAO__factory.connect(daoAddress, this.connectedSigner);

    const override =
      tokenAddress !== AddressZero
        ? {}
        : {
            value: amount,
          };

    const gasLimit = daoInstance.estimateGas.deposit(
      tokenAddress,
      amount,
      reference,
      override
    );
    return this.estimateGasFee(gasLimit);
  }

  protected estimateIncreaseAllowance(
    tokenAddress: string,
    daoAddress: string,
    amount: bigint
  ): Promise<IGasFeeEstimation> {
    if (!this.connectedSigner)
      throw new Error("A signer is needed for creating a DAO");

    const governanceERC20Instance = new Contract(
      tokenAddress,
      erc20ContractAbi,
      this.connectedSigner
    );

    const gasLimit = governanceERC20Instance.estimateGas.approve(
      daoAddress,
      BigNumber.from(amount)
    );
    return this.estimateGasFee(gasLimit);
  }

  protected currentAllowance(
    tokenAddress: string,
    daoAddress: string
  ): Promise<bigint> {
    if (!this.connectedSigner)
      throw new Error("A signer is needed for creating a DAO");

    const governanceERC20Instance = new Contract(
      tokenAddress,
      erc20ContractAbi,
      this.connectedSigner
    );

    return this.connectedSigner
      .getAddress()
      .then(address => governanceERC20Instance.allowance(address, daoAddress))
      .then(allowance => allowance.toBigInt());
  }

  // NOTE: Backing off ipfs-http-client until the UI framework supports it

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
}
