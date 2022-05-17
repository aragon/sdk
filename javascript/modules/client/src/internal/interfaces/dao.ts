import { IClientCore } from "./core";
import { DaoConfig, DaoRole } from "../common";
import { BigNumber } from "@ethersproject/bignumber";
import { MintConfig, TokenConfig } from "./packages";

export interface IClientDao extends IClientCore {
  methods: {
    /**
     * Create a DAO with the given settings and install the given component list
     * 
     * @returns The address of the new DAO
     * */
    create: (params: ICreateDaoParams) => Promise<string>;
    /** Transfer ether or an ERC20 token to a DAO */
    deposit: (params: IDepositParams) => Promise<void>;
    /** Checks whether a role is granted by the curren DAO's ACL settings */
    hasPermission: (
      where: string,
      who: string,
      role: DaoRole,
      data: Uint8Array
    ) => Promise<void>;
  };
  estimation: {
    create: (params: ICreateDaoParams) => Promise<IGasFeeEstimation>;
    deposit: (params: IDepositParams) => Promise<IGasFeeEstimation>;
  };
}

/** Global settings applied to the organization */
export interface ICreateDaoParams {
  daoConfig: DaoConfig;
  tokenConfig: TokenConfig;
  mintConfig: MintConfig[];
  gsnForwarder?: string;

  // TODO: Support an array of package + parameters to install
}

export interface IGasFeeEstimation {
  average: BigNumber;
  max: BigNumber;
}

export interface IDepositParams {
  daoAddress: string;
  amount: bigint;
  token?: string;
  reference?: string;

  // TODO: make it ERC20 agnostic
}
