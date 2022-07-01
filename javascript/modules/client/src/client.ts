import {
  DaoCreationSteps,
  DaoCreationStepValue,
  DaoDepositSteps,
  DaoDepositStepValue,
  DaoMetadata,
  IClient,
  ICreateParams,
  IDepositParams,
} from "./internal/interfaces/client";
import {
  DAO__factory,
  DAOFactory,
  DAOFactory__factory,
} from "@aragon/core-contracts-ethers";
import { BigNumber } from "@ethersproject/bignumber";
import { AddressZero } from "@ethersproject/constants";
import {
  Contract,
  ContractReceipt,
  ContractTransaction,
} from "@ethersproject/contracts";
import { ClientCore } from "./internal/core";
import { DaoRole } from "./internal/interfaces/common";
import { solidityPack, isAddress } from "ethers/lib/utils";
import { strip0x } from "@aragon/sdk-common";
import { erc20ContractAbi } from "./internal/abi/dao";
import { Signer } from "@ethersproject/abstract-signer";

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

    /** Retrieves metadata for DAO with given identifier*/
    getMetadata: (daoIdentifier: string) =>
      this._getMetadata(daoIdentifier),

    /** Checks whether a role is granted by the current DAO's ACL settings */
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
    // @ts-ignore  TODO: Remove this comment when used
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

    // @ts-ignore  TODO: Remove this comment when used
    const registryAddress = await daoFactoryInstance.registry();

    // TODO: Remove mock result
    yield {
      key: DaoCreationSteps.CREATING,
      txHash:
        "0x1298376517236498176239851762938512359817623985761239486128937461",
    };
    yield {
      key: DaoCreationSteps.DONE,
      address: "0x6592568247592378465987126349817263958713",
    };

    // TODO: Uncomment when the new DAO factory is available

    /**
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
     */
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

    if (tokenAddress && tokenAddress !== AddressZero) {
      // If the target is an ERC20 token, ensure that the amount can be transferred
      // Relay the yield steps to the caller as they are received
      yield* this._ensureAllowance(
        daoAddress,
        amount.toBigInt(),
        tokenAddress,
        signer,
      );
    }

    // Doing the transfer
    const daoInstance = DAO__factory.connect(daoAddress, signer);
    const override: { value?: BigNumber } = {};

    if (tokenAddress === AddressZero) {
      // Ether
      override.value = amount;
    }

    const depositTx = await daoInstance.deposit(
      tokenAddress,
      amount,
      reference,
      override
    );
    yield { key: DaoDepositSteps.DEPOSITING, txHash: depositTx.hash };

    await depositTx.wait().then((cr) => {
      if (!cr.events?.length) {
        throw new Error("The deposit was not properly registered");
      }

      const eventAmount = cr.events?.find((e) => e?.event === "Deposited")
        ?.args?.amount;
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
    tokenAddress: string,
    signer: Signer,
  ): AsyncGenerator<DaoDepositStepValue> {
    const tokenInstance = new Contract(
      tokenAddress,
      erc20ContractAbi,
      signer,
    );

    const currentAllowance = await tokenInstance.allowance(
      await signer.getAddress(),
      daoAddress,
    );

    yield {
      key: DaoDepositSteps.CHECKED_ALLOWANCE,
      allowance: currentAllowance.toBigInt(),
    };

    if (currentAllowance.gte(amount)) return;

    const tx: ContractTransaction = await tokenInstance
      .approve(daoAddress, BigNumber.from(amount));

    yield {
      key: DaoDepositSteps.UPDATING_ALLOWANCE,
      txHash: tx.hash,
    };

    await tx.wait()
      .then((cr: ContractReceipt) => {
        const value = cr.events?.find((e) => e?.event === "Approval")?.args
          ?.value;
        if (!value || BigNumber.from(amount).gt(value)) {
          throw new Error("Could not increase allowance");
        }
      });

    yield {
      key: DaoDepositSteps.UPDATED_ALLOWANCE,
      allowance: amount,
    };
  }

  private _hasPermission(
    _where: string,
    _who: string,
    _role: DaoRole,
    _data: Uint8Array,
  ) {
    // TODO: Unimplemented
    return Promise.reject();
  }

  //// PRIVATE METHOD GAS ESTIMATIONS

  // @ts-ignore  TODO: Remove this comment
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

  //// PRIVATE METHODS METADATA

  private async _getMetadata(daoIdentifier: string): Promise<DaoMetadata> {
    // TODO: Implement actual fetch logic using subgraph.
    // Note: it would be nice if the client could be instantiated with dao identifier
    // thereby removing the need to pass in the identifier for all the data retrieval methods

    if (!daoIdentifier) {
      throw new Error("A DAO identifier is needed");
    }

    // Generate DAO creation within the past year
    const fromDate = new Date(
      new Date().setFullYear(new Date().getFullYear() - 1)
    ).getTime();

    const dummyDaoNames = [
      "Patito Dao",
      "One World Dao",
      "Sparta Dao",
      "Yggdrasil Unite",
    ];

    return Promise.resolve({
      ...(isAddress(daoIdentifier)
        ? {
            address: daoIdentifier,
            name:
              dummyDaoNames[
                Math.floor(Math.random() * dummyDaoNames.length - 1)
              ],
          }
        : {
            address: "0x663ac3c648548eb8ccd292b41a8ff829631c846d",
            name: daoIdentifier,
          }),

      createdAt: new Date(
        fromDate + Math.random() * (Date.now() - fromDate)
      ).getTime(),
      description: `We are a community that loves trees and the planet. We track where forestation
       is increasing (or shrinking), fund people who are growing and protecting trees...`,
      links: [
        {
          label: "Website",
          url: "https://google.com",
        },
        {
          label: "Discord",
          url: "https://google.com",
        },
      ],
      packages: ["WhitelistPackage", "ERC20VotingPackage"],
      token: {
        address: "0x0000000000000000000000000000000000000000",
        name: "Ethereum (Canonical)",
        symbol: "ETH",
        decimals: 18,
      },
    });
  }
}

// PRIVATE HELPERS

// @ts-ignore  TODO: Remove this comment
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
      participationRequiredPct: BigInt(10), // BigInt(params.votingConfig.minParticipation),
      supportRequiredPct: BigInt(50), // BigInt(params.votingConfig.minSupport),
      minDuration: BigInt(50), // BigInt(params.votingConfig.minDuration),
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
