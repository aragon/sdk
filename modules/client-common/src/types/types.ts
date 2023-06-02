export enum SupportedNetwork {
  MAINNET = "homestead",
  GOERLI = "goerli",
  POLYGON = "matic",
  MUMBAI = "maticmum",
}

export const SupportedNetworksArray = Object.values(SupportedNetwork);

export type NetworkDeployment = {
  daoFactory: string;
  pluginSetupProcessor: string;
  multisigRepo: string;
  adminRepo: string;
  addresslistVotingRepo: string;
  tokenVotingRepo: string;
  multisigSetup: string;
  adminSetup: string;
  addresslistVotingSetup: string;
  tokenVotingSetup: string;
  ensRegistry?: string;
};

export type GasFeeEstimation = {
  average: bigint;
  max: bigint;
};
