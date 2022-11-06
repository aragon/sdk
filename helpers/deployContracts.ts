import * as aragonContracts from "@aragon/core-contracts-ethers";
// import { JsonRpcProvider } from "@ethersproject/providers";
// import { Wallet } from "@ethersproject/wallet";
// import { parseEther } from "@ethersproject/units";
// import { BigNumberish } from "@ethersproject/bignumber";
// import { ContractFactory } from "@ethersproject/contracts";
import { ethers, Signer } from "ethers";
import { Server } from "ganache";
// const ensContracts = require("@ensdomains/ens");
// const ensResolverContracts = require("@ensdomains/resolver");
const crypto = require("crypto");
import { ENSContracts } from "./abi/ens";
const namehash = require("eth-ens-namehash");

const WALLET_ADDRESS = "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199";

export async function deploy(server: Server): Promise<{
  dao: aragonContracts.DAOFactory;
  erc20: aragonContracts.ERC20VotingSetup;
  erc20Repo: string;
  allowList: aragonContracts.AllowlistVotingSetup;
  allowListRepo: string;
}> {
  const accounts = await server.provider.getInitialAccounts();
  const provider = new ethers.providers.JsonRpcProvider(
    "http://127.0.0.1:8545",
  );
  const owner = new ethers.Wallet(
    accounts[Object.keys(accounts)[0]].secretKey,
    provider,
  );
  const { ensRegistry, ensResolver } = await deployEnsContracts(
    owner,
  );

  const ownerAddress = await owner.getAddress();
  const daoNode = namehash.hash("dao");
  const daoLabel = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("dao"));

  try {
    await ensRegistry.setSubnodeOwner(
      daoNode,
      daoLabel,
      ownerAddress,
    );
    // await registerEnsName(
    //   { domainName: "dao.eth", walletAddress: WALLET_ADDRESS },
    //   ensRegistry,
    //   ensResolver,
    // );
    const net = await provider.getNetwork();
    net.ensAddress = ensResolver.address;
    // token
    const tokenFactory = new aragonContracts.TokenFactory__factory();
    const token = await tokenFactory.connect(owner).deploy();
    // dao registry
    const registryFactory = new aragonContracts.DAORegistry__factory();
    const registry = await registryFactory.connect(owner).deploy();
    // dao
    const daoFactory = new aragonContracts.DAOFactory__factory();
    const dao = await daoFactory
      .connect(owner)
      .deploy(registry.address, token.address);

    // deploy allowlist plugin
    const allowListSetupFactory = new aragonContracts
      .AllowlistVotingSetup__factory();
    const allowList = await allowListSetupFactory.connect(owner).deploy();

    // deploy erc20 plugin
    const erc20VotingSetupFactory = new aragonContracts
      .ERC20VotingSetup__factory();
    const erc20 = await erc20VotingSetupFactory.connect(owner).deploy();

    // deploy plugin repo for erc20
    const erc20Repo = await deployPluginRepo(
      owner,
      "ERC20Voting",
      "ERC20VotingSetup",
      [1, 0, 0],
      "0x",
      dao.address,
    );

    // deploy pugin repo for allowlist
    const allowListRepo = await deployPluginRepo(
      owner,
      "AllowlistVoting",
      "AllowlistVotingSetup",
      [1, 0, 0],
      "0x",
      dao.address,
    );

    // send ETH to hardcoded wallet in tests
    await owner.sendTransaction({
      to: WALLET_ADDRESS,
      value: ethers.utils.parseEther("50.0"),
    });

    return {
      dao,
      erc20,
      erc20Repo: erc20Repo,
      allowList,
      allowListRepo: allowListRepo,
    };
  } catch (e) {
    throw e;
  }
}

export async function deployPluginRepo(
  owner: ethers.Wallet,
  name: string,
  pluginSetupName: string,
  version: [ethers.BigNumberish, ethers.BigNumberish, ethers.BigNumberish],
  content: string,
  mantainer: string,
): Promise<string> {
  try {
    // deploy plugin repo registry
    const pluginRepoRegistryFactory = new aragonContracts
      .PluginRepoRegistry__factory();
    const pluginRepoRegistry = await pluginRepoRegistryFactory.connect(owner)
      .deploy();

    // deploy plugin repo factory
    const pluginRepoFactoryFactory = new aragonContracts
      .PluginRepoFactory__factory();
    const pluginRepoFactory = await pluginRepoFactoryFactory.connect(owner)
      .deploy(pluginRepoRegistry.address);

    // create plugin repo
    const tx = await pluginRepoFactory.createPluginRepoWithVersion(
      name,
      version,
      pluginSetupName,
      content,
      mantainer,
    );

    const receipt = await tx.wait();

    return receipt.events?.find((e) => e.event === "PluginRepoRegistered")?.args
      ?.pluginRepo;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

async function deployEnsContracts(signer: Signer) {
  try {
    // const signerAddress = signer.getAddress();
    const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
    // deploy registry
    const ENSRegistry = new ethers.ContractFactory(
      ENSContracts.ENSRegistry.abi,
      ENSContracts.ENSRegistry.bytecode,
    );
    const registry = await ENSRegistry.connect(signer).deploy();
    await registry.deployed();
    // deploy resolver
    const PublicResolver = new ethers.ContractFactory(
      ENSContracts.PublicResolver.abi,
      ENSContracts.PublicResolver.bytecode,
    );
    const resolver = await PublicResolver.connect(signer).deploy(
      registry.address,
      // TODO
      // is this ok?
      ZERO_ADDRESS,
      ZERO_ADDRESS,
      ZERO_ADDRESS,
    );
    await resolver.deployed();
    // set resolver
    // const daoNode = namehash.hash("dao");
    // await registry.setOwner(daoNode, signerAddress);
    // const address = await registry.owner(daoNode);
    // console.log(address);
    // deploy registrar
    // const FIFSRegistrar = new ethers.ContractFactory(
    //   ENSContracts.FIFSRegistrar.abi,
    //   ENSContracts.FIFSRegistrar.bytecode,
    // );
    // const registrar = await FIFSRegistrar.deploy(
    //   registry.address,
    //   namehash.hash("test"),
    // );
    // await registrar.deployed();
    return {
      ensRegistry: registry,
      ensResolver: resolver,
      // ensRegistrar: registrar,
    };
  } catch (e) {
    throw e;
  }
}

export async function registerEnsName(
  { domainName, walletAddress }: {
    domainName: string;
    walletAddress: string;
  },
  registry: ethers.Contract,
  resolver: ethers.Contract,
) {
  try {
    const duration = 31536000;
    const secret = `0x${crypto.randomBytes(32).toString("hex")}`;
    console.log("Generating commitment");
    const commitment = await registry.callStatic.makeCommitmentWithConfig(
      domainName,
      walletAddress,
      secret,
      resolver,
      walletAddress,
    );
    console.log(`Commitment: ${commitment}`);
    console.log(`Commiting....`);
    const commitTX = await registry.commit(commitment);
    console.log(
      `Transaction ${commitTX.hash} sent. Waiting for confirmation....`,
    );
    await commitTX.wait();
    const minCommitmentAge = await registry.minCommitmentAge();
    console.log(`Commited! Wait ${minCommitmentAge}secs`);

    delay(minCommitmentAge * 1000);

    console.log(`Getting price`);
    const price = await registry.callStatic.rentPrice(domainName, duration);
    console.log(`Price: ${ethers.utils.formatEther(price)}`);

    console.log(`Registering....`);
    const registeringTXGasEstimation = await registry.estimateGas
      .registerWithConfig(
        domainName,
        walletAddress,
        duration,
        secret,
        resolver,
        walletAddress,
        { value: price },
      );
    const registeringTX = await registry.registerWithConfig(
      domainName,
      walletAddress,
      duration,
      secret,
      resolver,
      walletAddress,
      {
        value: price,
        gasLimit: registeringTXGasEstimation.add(100000),
      },
    );
    console.log(
      `Transaction ${registeringTX.hash} sent. Waiting for confirmation....`,
    );
    await registeringTX.wait();
    console.log(`Registered!`);
  } catch (e) {
    throw e;
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
