// @ts-ignore Needed to get the global typing for hardhat
import * as jestenv from "jest-environment-hardhat"
import {
  AddresslistVotingSetup__factory,
  GovernanceERC20__factory,
  GovernanceWrappedERC20__factory,
  MultisigSetup__factory,
  PluginRepo__factory,
  TokenVotingSetup__factory,
} from "@aragon/osx-ethers";
import { Signer } from "@ethersproject/abstract-signer";
import { hexlify } from "@ethersproject/bytes";
import { AddressZero } from "@ethersproject/constants";
import { toUtf8Bytes } from "@ethersproject/strings";

export async function createPluginBuild(
  release: number,
  pluginRepoAddress: string,
  signer: Signer,
  pluginSetup: string,
  releaseMetadata: string =
    "ipfs://QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR",
  buildMetadata: string =
    "ipfs://QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR",
) {
  const pluginRepo = PluginRepo__factory.connect(
    pluginRepoAddress,
    signer,
  );
  const tx = await pluginRepo.createVersion(
    release,
    pluginSetup,
    hexlify(toUtf8Bytes(buildMetadata)),
    hexlify(toUtf8Bytes(releaseMetadata)),
  );
  await tx.wait();
  return tx.hash;
}

export async function createTokenVotingPluginBuild(
  release: number,
  pluginRepoAddress: string,
) {
  const deployer = hardhat.provider.getSigner();
  const governanceErc20Factory = new GovernanceERC20__factory();
  const governanceWrappedErc20Factory = new GovernanceWrappedERC20__factory();
  const governanceErc20Instance = await governanceErc20Factory.connect(
    deployer,
  ).deploy(AddressZero, "Test Token", "TTK", { amounts: [], receivers: [] });
  const governanceErc20WrappedInstance = await governanceWrappedErc20Factory
    .connect(
      deployer,
    ).deploy(AddressZero, "Wrapped Test Token", "wTTK");

  // Token Voting Plugin
  const tokenVotingSetupFactory = new TokenVotingSetup__factory();
  const tokenVotingPluginSetup = await tokenVotingSetupFactory
    .connect(deployer)
    .deploy(
      governanceErc20Instance.address,
      governanceErc20WrappedInstance.address,
    );

  await createPluginBuild(
    release,
    pluginRepoAddress,
    deployer,
    tokenVotingPluginSetup.address,
  );
}

export async function createMultisigPluginBuild(
  release: number,
  pluginRepoAddress: string,
) {
  const deployer = hardhat.provider.getSigner();

  // Token Voting Plugin
  const tokenVotingSetupFactory = new MultisigSetup__factory();
  const tokenVotingPluginSetup = await tokenVotingSetupFactory
    .connect(deployer)
    .deploy();

  await createPluginBuild(
    release,
    pluginRepoAddress,
    deployer,
    tokenVotingPluginSetup.address,
  );
}

export async function createAddresslistVotingPluginBuild(
  release: number,
  pluginRepoAddress: string,
) {
  const deployer = hardhat.provider.getSigner();

  // Token Voting Plugin
  const tokenVotingSetupFactory = new AddresslistVotingSetup__factory();
  const tokenVotingPluginSetup = await tokenVotingSetupFactory
    .connect(deployer)
    .deploy();

  await createPluginBuild(
    release,
    pluginRepoAddress,
    deployer,
    tokenVotingPluginSetup.address,
  );
}
