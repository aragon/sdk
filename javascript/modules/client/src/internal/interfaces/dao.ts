import { IClientCore } from "./client-core";

export interface IClientDao extends IClientCore {
  dao: {
    createDao(metadata: string): Promise<string>;
    grant(where: string, who: string, role: DaoRole): Promise<void>;
    revoke(where: string, who: string, role: DaoRole): Promise<void>;
    freeze(where: string, role: DaoRole): Promise<void>;
    isFrozen(where: string, role: DaoRole): Promise<boolean>;
    // bulk()
    setMetadata(metadata: string): Promise<void>;
    execute(callId: string, actions: DaoAction[]): Promise<void>;
    deposit(
      tokenAddress: string,
      amount: bigint,
      reference: string
    ): Promise<void>;
    withdraw(
      tokenAddress: string,
      to: string,
      amount: bigint,
      reference: string
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
