import {
  DaoCreationSteps,
  DaoCreationStepValue,
  DaoDepositSteps,
  DaoDepositStepValue,
  DaoTransfer,
  TokenBalance,
  IClient,
  ICreateParams,
  IDepositParams,
} from "./internal/interfaces/client";
import {
  DAO__factory,
  DAOFactory,
  DAOFactory__factory,
  GovernanceERC20__factory,
} from "@aragon/core-contracts-ethers";
import { BigNumber } from "@ethersproject/bignumber";
import { AddressZero } from "@ethersproject/constants";
import { ClientCore } from "./internal/core";
import { DaoRole } from "./internal/interfaces/common";
import { solidityPack } from "ethers/lib/utils";
import { strip0x } from "@aragon/sdk-common";

export { DaoCreationSteps, DaoDepositSteps };
export { ICreateParams, IDepositParams };

/**
 * Provider a generic client with high level methods to manage and interact with DAO's
 */
export class Client extends ClientCore implements IClient {
  //// HIGH LEVEL HANDLERS

  /** Contains all the generic high level methods to interact with a DAO */
  methods = {
    /** Created a DAO with the given parameters and plugins */
    create: (params: ICreateParams) => this._createDao(params),
    /** Deposits ether or an ERC20 token */
    deposit: (params: IDepositParams) => this._deposit(params),
    /** Checks whether a role is granted by the curren DAO's ACL settings */
    getDaoBalances: (daoIdentifier: string) =>
      this._getDaoBalances(daoIdentifier),
    hasPermission: (
      where: string,
      who: string,
      role: DaoRole,
      data: Uint8Array
    ) => this._hasPermission(where, who, role, data),
  };

  //// ESTIMATION HANDLERS

  /** Contains the gas estimation of the Ethereum transactions */
  estimation = {
    create: (params: ICreateParams) => this._estimateCreation(params),
    deposit: (params: IDepositParams) => this._estimateDeposit(params),
  };

  //// PRIVATE METHOD IMPLEMENTATIONS

  private async *_createDao(
    params: ICreateParams
  ): AsyncGenerator<DaoCreationStepValue> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new Error("A signer is needed");
    } else if (!signer.provider) {
      throw new Error("A web3 provider is needed");
    }

    const daoFactoryInstance = DAOFactory__factory.connect(
      this.web3.getDaoFactoryAddress(),
      signer
    );

    const registryAddress = await daoFactoryInstance.registry();

    // TODO: Use the new factory method
    const tx = await daoFactoryInstance.createDao(
      ...unwrapCreateDaoParams(params)
    );

    yield {
      key: DaoCreationSteps.CREATING,
      txHash: tx.hash,
    };
    const receipt = await tx.wait();
    const newDaoAddress = receipt.events?.find(
      e => e.address === registryAddress
    )?.topics[1];
    if (!newDaoAddress) {
      return Promise.reject(new Error("Could not create DAO"));
    }

    yield {
      key: DaoCreationSteps.DONE,
      address: "0x" + newDaoAddress.slice(newDaoAddress.length - 40),
    };
  }

  private async *_deposit(
    params: IDepositParams
  ): AsyncGenerator<DaoDepositStepValue> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new Error("A signer is needed");
    } else if (!signer.provider) {
      throw new Error("A web3 provider is needed");
    }

    const [daoAddress, amount, tokenAddress, reference] = unwrapDepositParams(
      params
    );

    // Ensure that if the target is an ERC20 token, it can be transferred
    for await (const step of this._ensureAllowance(
      daoAddress,
      amount.toBigInt(),
      tokenAddress
    )) {
      yield step;
    }

    // Doing the transfer

    const daoInstance = DAO__factory.connect(daoAddress, signer);
    const override: { value?: BigNumber } = {};

    if (tokenAddress === AddressZero) {
      // Ether
      override.value = amount;
    } else {
      // ERC20
      const governanceERC20Instance = GovernanceERC20__factory.connect(
        tokenAddress,
        signer
      );

      const currentAllowance = await governanceERC20Instance.allowance(
        await signer.getAddress(),
        daoAddress
      );

      if (currentAllowance.lt(amount)) {
        await governanceERC20Instance
          .increaseAllowance(daoAddress, amount.sub(currentAllowance))
          .then(tx => tx.wait())
          .then(cr => {
            if (
              amount.gt(
                cr.events?.find(e => e?.event === "Approval")?.args?.value
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
    yield { key: DaoDepositSteps.DONE, amount: amount.toBigInt() };
  }

  private async *_ensureAllowance(
    daoAddress: string,
    amount: bigint,
    tokenAddress: string
  ): AsyncGenerator<DaoDepositStepValue> {
    // Don't need to do anything if the target is ether
    if (tokenAddress === AddressZero) return;

    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new Error("A signer is needed");
    } else if (!signer.provider) {
      throw new Error("A web3 provider is needed");
    }

    // FIXME: The factory should be the SafeERC20, not the plugin?
    const governanceERC20Instance = GovernanceERC20__factory.connect(
      tokenAddress,
      signer
    );

    const currentAllowance = await signer
      .getAddress()
      .then(address => governanceERC20Instance.allowance(address, daoAddress));

    yield {
      key: DaoDepositSteps.CHECKED_ALLOWANCE,
      allowance: currentAllowance.toBigInt(),
    };

    if (currentAllowance.gte(amount)) return;

    // TODO: Shouldn't we increase the REMAINING amount only?
    const increaseAllowanceTx = await governanceERC20Instance.increaseAllowance(
      daoAddress,
      BigNumber.from(amount)
    );

    yield {
      key: DaoDepositSteps.INCREASING_ALLOWANCE,
      txHash: increaseAllowanceTx.hash,
    };

    await increaseAllowanceTx.wait().then(cr => {
      const value = cr.events?.find(e => e?.event === "Approval")?.args?.value;
      if (!value || BigNumber.from(amount).gt(value)) {
        throw new Error("Could not increase allowance");
      }
    });

    yield {
      key: DaoDepositSteps.INCREASED_ALLOWANCE,
      allowance: amount,
    };
  }

  private _hasPermission(
    where: string,
    who: string,
    role: DaoRole,
    data: Uint8Array
  ) {
    // TODO: Unimplemented
    return Promise.reject();
  }

  //// PRIVATE METHOD GAS ESTIMATIONS

  _estimateCreation(params: ICreateParams) {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new Error("A signer is needed for estimating the gas cost");
    }

    // TODO: Unimplemented
    // TODO: The new contract code is needed
    return this.web3.getApproximateGasFee(BigInt("0"));
  }

  _estimateDeposit(params: IDepositParams) {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new Error("A signer is needed for estimating the gas cost");
    }

    // TODO: ESTIMATE INCREASED ALLOWANCE AS WELL

    const [daoAddress, amount, tokenAddress, reference] = unwrapDepositParams(
      params
    );

    const daoInstance = DAO__factory.connect(daoAddress, signer);

    const override: { value?: BigNumber } = {};
    if (tokenAddress === AddressZero) {
      override.value = amount;
    }

    return daoInstance.estimateGas
      .deposit(tokenAddress, amount, reference, override)
      .then(gasLimit => {
        return this.web3.getApproximateGasFee(gasLimit.toBigInt());
      });
  }

  private async _getDaoBalances(
    daoIdentifier: string
  ): Promise<TokenBalance[]> {
    if (!daoIdentifier) {
      throw new Error("A DAO identifier is needed");
    }

    const TokenList = [
      {
        id: "0x9370ef1a59ad9cbaea30b92a6ae9dd82006c7ac0",
        name: "myjooje",
        symbol: "JOJ",
        decimals: "18",
      },
      {
        id: "0x0000000000000000000000000000000000000000",
        name: "Ethereum (Canonical)",
        symbol: "ETH",
        decimals: "18",
      },
      {
        id: "0x35f7a3379b8d0613c3f753863edc85997d8d0968",
        name: "Dummy Test Token",
        symbol: "DTT",
        decimals: "18",
      },
      {
        id: "0xd783d0f9d8f5c956b808d641dea2038b050389d1",
        name: "Test Token",
        symbol: "TTK",
        decimals: "18",
      },
    ];

    const TokenBalances: TokenBalance[] = TokenList.map(
      (token: TokenBalance["token"]) => ({
        id: `${daoIdentifier}_${token.id}`,
        token,
        balance: BigInt(
          (Math.floor(Math.random() * (1000 - 1 + 1) + 1) * 10) ** 18
        ),
        lastUpdated: Math.floor(
          new Date(
            +new Date() - Math.floor(Math.random() * 10000000000)
          ).getTime() / 1000
        ).toString(),
      })
    );

    return Promise.resolve(TokenBalances);
  }
}

//// PRIVATE HELPERS

function unwrapCreateDaoParams(
  params: ICreateParams
): [DAOFactory.DAOConfigStruct, DAOFactory.VoteConfigStruct, string, string] {
  // TODO: Serialize plugin params into a buffer
  const pluginDataBytes =
    "0x" +
    params.plugins
      .map(entry => {
        const item = solidityPack(
          ["uint256", "bytes[]"],
          [entry.id, entry.data]
        );
        return strip0x(item);
      })
      .join("");

  return [
    params.daoConfig,
    {
      // TODO: Adapt the DAO creation parameters
      participationRequiredPct: BigInt(params.votingConfig.minParticipation),
      supportRequiredPct: BigInt(params.votingConfig.minSupport),
      minDuration: BigInt(params.votingConfig.minDuration),
    },
    // {
    //   addr: params.tokenConfig.address,
    //   name: params.tokenConfig.name,
    //   symbol: params.tokenConfig.symbol,
    // },
    // {
    //   receivers: params.mintConfig.map((receiver) => receiver.address),
    //   amounts: params.mintConfig.map((receiver) => receiver.balance),
    // },
    pluginDataBytes,
    params.gsnForwarder ?? "",
  ];
}

function unwrapDepositParams(
  params: IDepositParams
): [string, BigNumber, string, string] {
  return [
    params.daoAddress,
    BigNumber.from(params.amount),
    params.tokenAddress ?? AddressZero,
    params.reference ?? "",
  ];
}
