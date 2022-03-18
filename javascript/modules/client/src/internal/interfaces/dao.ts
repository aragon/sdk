import { IClientCore } from "./client-core";

export interface IClientDao extends IClientCore {
  dao: {
    createDao(
      daoConfig: DaoConfig,
      tokenConfig: TokenConfig,
      mintConfig: MintConfig,
      votingConfig: VotingConfig,
      gsnForwarder?: string,
    ): Promise<string>;
    grant(where: string, who: string, role: DaoRole): Promise<void>;
    grantWithOracle(
      where: string,
      who: string,
      oracle: string,
      role: DaoRole,
    ): Promise<void>;
    revoke(where: string, who: string, role: DaoRole): Promise<void>;
    freeze(where: string, role: DaoRole): Promise<void>;
    isFrozen(where: string, role: DaoRole): Promise<boolean>;
    /** Applies a set of permission mutations at once */
    bulkPermissions: (where: string, permissionItems: any[]) => Promise<void>;
    /** Determines whether an action is allowed by the curren DAO's ACL settings */
    hasPermission: (
      where: string,
      who: string,
      role: DaoRole,
      data: Uint8Array,
    ) => Promise<void>;
    setMetadata(metadata: string): Promise<void>;
    execute(callId: string, actions: DaoAction[]): Promise<void>;
    deposit(
      tokenAddress: string,
      amount: bigint,
      reference: string,
    ): Promise<void>;
    withdraw(
      tokenAddress: string,
      to: string,
      amount: bigint,
      reference: string,
    ): Promise<void>;
  };
}

// DAO DATA TYPES
export interface DaoAction {
  to: string;
  value: bigint;
  bytes: string;
}

export enum DaoRole {
  UPGRADE_ROLE = "UPGRADE_ROLE",
  DAO_CONFIG_ROLE = "DAO_CONFIG_ROLE",
  EXEC_ROLE = "EXEC_ROLE",
  WITHDRAW_ROLE = "WITHDRAW_ROLE",
  SET_SIGNATURE_VALIDATOR_ROLE = "SET_SIGNATURE_VALIDATOR_ROLE",
}

export interface DaoConfig {
  name: string;
  metadata: string;
}

export interface TokenConfig {
  addr: string;
  name: string;
  symbol: string;
}

export interface MintConfig {
  receivers: string[];
  amounts: bigint[];
}

/** Global settings applied to the organization */
export interface VotingConfig {
  /** 0-100 as a percentage */
  minSupport: number;
  /** 0-100 as a percentage */
  minParticipation: number;
  /** In seconds */
  minDuration: number;
}
