import { AddressZero } from "@ethersproject/constants";
import {
  AddresslistVotingClient,
  Client,
  Context,
  CreateDaoParams,
  DaoCreationSteps,
  TokenVotingClient,
  VotingMode,
} from "../../src";
import {
  contextParamsLocalChain,
  TEST_WALLET_ADDRESS,
} from "../integration/constants";

export async function buildAddressListVotingDAO(
  pluginRepoAddress: string,
  votingMode: VotingMode = VotingMode.STANDARD,
) {
  const client = new Client(new Context(contextParamsLocalChain));

  const pluginInstallItem = AddresslistVotingClient.encoding
    .getPluginInstallItem({
      addresses: [TEST_WALLET_ADDRESS],
      votingSettings: {
        minDuration: 60 * 60,
        minParticipation: 0.5,
        supportThreshold: 0.5,
        minProposerVotingPower: BigInt(0),
        votingMode,
      },
    });

  const createDaoParams: CreateDaoParams = {
    ensSubdomain: "teting-" + Math.random().toString().slice(2),
    metadataUri: "ipfs://",
    plugins: [
      {
        id: pluginRepoAddress, // TODO: Rename
        data: pluginInstallItem.data,
      },
    ],
    daoUri: "https://",
    trustedForwarder: AddressZero,
  };
  for await (
    const step of client.methods.createDao(createDaoParams)
  ) {
    switch (step.key) {
      case DaoCreationSteps.CREATING:
        break;
      case DaoCreationSteps.DONE:
        return {
          dao: step.address,
          plugin: step.pluginAddresses[0],
        };
    }
  }
  throw new Error("DAO not created");
}

export async function buildTokenVotingDAO(
  pluginRepoAddress: string,
  votingMode: VotingMode = VotingMode.STANDARD,
) {
  const client = new Client(new Context(contextParamsLocalChain));

  const pluginInstallItem = TokenVotingClient.encoding
    .getPluginInstallItem({
      newToken: {
        balances: [{ address: TEST_WALLET_ADDRESS, balance: BigInt(100) }],
        name: "Test Token",
        symbol: "TTK",
        decimals: 18,
      },
      votingSettings: {
        minDuration: 60 * 60,
        minParticipation: 0.5,
        supportThreshold: 0.5,
        minProposerVotingPower: BigInt(0),
        votingMode,
      },
    });

  const createDaoParams: CreateDaoParams = {
    ensSubdomain: "teting-" + Math.random().toString().slice(2),
    metadataUri: "ipfs://",
    plugins: [
      {
        id: pluginRepoAddress, // TODO: Rename
        data: pluginInstallItem.data,
      },
    ],
    daoUri: "https://",
    trustedForwarder: AddressZero,
  };
  for await (
    const step of client.methods.createDao(createDaoParams)
  ) {
    switch (step.key) {
      case DaoCreationSteps.CREATING:
        break;
      case DaoCreationSteps.DONE:
        return {
          dao: step.address,
          plugin: step.pluginAddresses[0],
        };
    }
  }
  throw new Error("DAO not created");
}
