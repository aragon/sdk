import { activeContractsList } from "@aragon/core-contracts-ethers";
import { SupportedNetworks, NetworkDeployment } from "./interfaces/common";
import { ProposalMetadata } from "./interfaces/plugin";

export const UNSUPPORTED_PROPOSAL_METADATA_LINK: ProposalMetadata = {
  title: "(unsupported metadata link)",
  summary: "(the link to the metadata is not supported)",
  description: "(the link to the metadata is not supported)",
  resources: [],
};
export const UNAVAILABLE_PROPOSAL_METADATA: ProposalMetadata = {
  title: "(unavailable metadata)",
  summary: "(the proposal metadata is not available)",
  description: "(the proposal metadata is not available)",
  resources: [],
};

export const LIVE_CONTRACTS: { [K in SupportedNetworks]: NetworkDeployment } = {
  mainnet: {
    // TODO change to mainnet
    daoFactory: activeContractsList.goerli.DAOFactory,
    multisigRepo: "multisig.plugin.dao.eth",
    adminRepo: "admin.plugin.dao.eth",
    addresslistVotingRepo: "address-list-voting.plugin.dao.eth",
    tokenVotingRepo: "token-voting.plugin.dao.eth",
  },
  goerli: {
    daoFactory: activeContractsList.goerli.DAOFactory,
    multisigRepo: activeContractsList.goerli["multisig-repo"],
    adminRepo: activeContractsList.goerli["admin-repo"],
    addresslistVotingRepo: activeContractsList.goerli["address-list-voting-repo"],
    tokenVotingRepo: activeContractsList.goerli["token-voting-repo"],
  },
};
