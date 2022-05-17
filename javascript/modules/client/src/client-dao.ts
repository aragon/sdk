import { ClientCore } from "./internal/core";
import {
  DaoRole,
} from "./internal/common";
import {
  IGasFeeEstimation,
  IClientDao,
  ICreateDaoParams,
  IDepositParams,
} from "./internal/interfaces/dao";
import {
  IClientERC20Governance,
  IClientWhitelistGovernance,
} from "./internal/interfaces/packages";
export { IClientERC20Governance, IClientWhitelistGovernance };
import {
  DAOFactory,
  DAOFactory__factory,
  Registry__factory,
  TokenFactory,
} from "@aragon/core-contracts-ethers";
import { BigNumberish } from "@ethersproject/bignumber";


/**
 * The ClientDao class implements all the common calls and methods shared by all Aragon DAO's.
 * To make use of component specific features, check out the corresponding client for it.
 */
export class ClientDao extends ClientCore implements IClientDao {
  methods = {
    create: async (params: ICreateDaoParams): Promise<string> => {
      if (!this.signer)
        return Promise.reject(
          new Error("A signer is needed for creating a DAO")
        );

      const daoFactoryInstance = DAOFactory__factory.connect(
        this.daoFactoryAddress,
        this.connectedSigner
      );

      const registryInstance = await daoFactoryInstance
        .registry()
        .then(registryAddress => {
          return Registry__factory.connect(registryAddress, this.web3);
        });

      return daoFactoryInstance
        .newERC20VotingDAO(...ClientDao.createDaoParameters(params))
        .then(tx => tx.wait())
        .then(cr => {
          const newDaoAddress = cr.events?.find(
            e => e.address === registryInstance.address
          )?.topics[1];
          if (!newDaoAddress)
            return Promise.reject(new Error("Could not create DAO"));

          return "0x" + newDaoAddress.slice(newDaoAddress.length - 40);
        });
    },
    /** Determines whether an action is allowed by the curren DAO's ACL settings */
    hasPermission: (
      _where: string,
      _who: string,
      _role: DaoRole,
      _data: Uint8Array
    ) => {
      // TODO: Not implemented
      return Promise.resolve();
    },

    deposit: (params: IDepositParams): Promise<void> => this.deposit(params),
  }

  /** Estimation related methods */
  estimation = {
    create: async (
      params: ICreateDaoParams
    ): Promise<IGasFeeEstimation> => {
      if (!this.signer)
        return Promise.reject(
          new Error("A signer is needed for creating a DAO")
        );
      const daoFactoryInstance = DAOFactory__factory.connect(
        this.daoFactoryAddress,
        this.connectedSigner
      );

      const gasLimit = daoFactoryInstance.estimateGas.newERC20VotingDAO(
        ...ClientDao.createDaoParameters(params)
      );

      return this.estimateGasFee(gasLimit);
    },
    deposit: (params: IDepositParams): Promise<IGasFeeEstimation> => {
      // TODO: Implement
    },
  };

  // HELPERS

  private static createDaoParameters(
    params: ICreateDaoParams
  ): [
    DAOFactory.DAOConfigStruct,
    [BigNumberish, BigNumberish, BigNumberish],
    TokenFactory.TokenConfigStruct,
    TokenFactory.MintConfigStruct,
    string
  ] {
    return [
      params.daoConfig,
      [
        BigInt(params.votingConfig.minParticipation),
        BigInt(params.votingConfig.minSupport),
        BigInt(params.votingConfig.minDuration),
      ],
      {
        addr: params.tokenConfig.address,
        name: params.tokenConfig.name,
        symbol: params.tokenConfig.symbol,
      },
      {
        receivers: params.mintConfig.map(receiver => receiver.address),
        amounts: params.mintConfig.map(receiver => receiver.balance),
      },
      params.gsnForwarder ?? "",
    ];
  }
}

package