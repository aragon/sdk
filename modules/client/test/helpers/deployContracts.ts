import * as aragonContracts from "@aragon/core-contracts-ethers";

import ENSRegistry from "@ensdomains/ens-contracts/artifacts/contracts/registry/ENSRegistry.sol/ENSRegistry.json";
import PublicResolver from "@ensdomains/ens-contracts/artifacts/contracts/resolvers/PublicResolver.sol/PublicResolver.json";
import { AddressZero, HashZero } from "@ethersproject/constants";
import { JsonRpcProvider } from "@ethersproject/providers";
import { id, namehash } from "@ethersproject/hash";
import { parseEther } from "@ethersproject/units";
import { BigNumberish } from "@ethersproject/bignumber";
import { Signer } from "@ethersproject/abstract-signer";
import { Contract, ContractFactory } from "@ethersproject/contracts";
import { defaultAbiCoder } from "@ethersproject/abi";

const WALLET_ADDRESS = "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199";

export interface Deployment {
  managingDaoAddress: string;
  daoFactory: aragonContracts.DAOFactory;
  daoRegistry: aragonContracts.DAORegistry;
  tokenVotingRepo: aragonContracts.PluginRepo;
  tokenVotingPluginSetup: aragonContracts.TokenVotingSetup;
  addresslistVotingRepo: aragonContracts.PluginRepo;
  addresslistVotingPluginSetup: aragonContracts.AddresslistVotingSetup;
  multisigRepo: aragonContracts.PluginRepo;
  multisigPluginSetup: aragonContracts.AddresslistVotingSetup;
  adminRepo: aragonContracts.PluginRepo;
  adminPluginSetup: aragonContracts.AdminSetup;
}

export async function deploy(): Promise<Deployment> {
  const provider = new JsonRpcProvider("http://127.0.0.1:8545");
  const deployOwnerWallet = provider.getSigner();
  const { ensRegistry, ensResolver } = await deployEnsContracts(
    deployOwnerWallet,
  );

  try {
    const managingDaoFactory = new aragonContracts.DAO__factory();
    const managingDao = await managingDaoFactory
      .connect(deployOwnerWallet)
      .deploy();
    await managingDao.initialize(
      "0x",
      await deployOwnerWallet.getAddress(),
      AddressZero,
    );

    const ensSubdomainRegistrarFactory = new aragonContracts
      .ENSSubdomainRegistrar__factory();
    const daoRegistrar = await ensSubdomainRegistrarFactory
      .connect(deployOwnerWallet)
      .deploy();
    const pluginRegistrar = await ensSubdomainRegistrarFactory
      .connect(deployOwnerWallet)
      .deploy();

    await registerEnsName(
      "eth",
      "dao",
      ensRegistry,
      daoRegistrar.address,
      ensResolver.address,
    );
    await registerEnsName(
      "eth",
      "plugin",
      ensRegistry,
      pluginRegistrar.address,
      ensResolver.address,
    );

    await daoRegistrar.initialize(
      managingDao.address,
      ensRegistry.address,
      namehash("dao.eth"),
    );
    await pluginRegistrar.initialize(
      managingDao.address,
      ensRegistry.address,
      namehash("plugin.eth"),
    );

    const pluginRepoRegistryFactory = new aragonContracts
      .PluginRepoRegistry__factory();
    const pluginRepoRegistry = await pluginRepoRegistryFactory
      .connect(deployOwnerWallet)
      .deploy();

    await pluginRepoRegistry.initialize(
      managingDao.address,
      pluginRegistrar.address,
    );
    await managingDao.grant(
      pluginRegistrar.address,
      pluginRepoRegistry.address,
      await pluginRegistrar.REGISTER_ENS_SUBDOMAIN_PERMISSION_ID(),
    );

    const pluginRepoFactoryFactory = new aragonContracts
      .PluginRepoFactory__factory();
    const pluginRepoFactory = await pluginRepoFactoryFactory
      .connect(deployOwnerWallet)
      .deploy(pluginRepoRegistry.address);

    await managingDao.grant(
      pluginRepoRegistry.address,
      pluginRepoFactory.address,
      await pluginRepoRegistry.REGISTER_PLUGIN_REPO_PERMISSION_ID(),
    );

    const pluginSetupProcessorFacotry = new aragonContracts
      .PluginSetupProcessor__factory();
    const pluginSetupProcessor = await pluginSetupProcessorFacotry
      .connect(deployOwnerWallet)
      .deploy(managingDao.address, pluginRepoRegistry.address);

    // dao registry
    const daoRegistryFactory = new aragonContracts.DAORegistry__factory();
    const daoRegistry = await daoRegistryFactory
      .connect(deployOwnerWallet)
      .deploy();
    await daoRegistry.initialize(managingDao.address, daoRegistrar.address);
    await managingDao.grant(
      daoRegistrar.address,
      daoRegistry.address,
      await daoRegistrar.REGISTER_ENS_SUBDOMAIN_PERMISSION_ID(),
    );

    // dao
    const daoFactoryFactory = new aragonContracts.DAOFactory__factory();
    const daoFactory = await daoFactoryFactory
      .connect(deployOwnerWallet)
      .deploy(daoRegistry.address, pluginSetupProcessor.address);
    await managingDao.grant(
      daoRegistry.address,
      daoFactory.address,
      await daoRegistry.REGISTER_DAO_PERMISSION_ID(),
    );

    const pluginRepo_Factory = new aragonContracts.PluginRepo__factory();

    const tokenVotingSetupFactory = new aragonContracts
      .TokenVotingSetup__factory();
    const tokenVotingPluginSetup = await tokenVotingSetupFactory
      .connect(deployOwnerWallet)
      .deploy();
    const tokenRepoAddr = await deployPlugin(
      pluginRepoFactory,
      tokenVotingPluginSetup.address,
      "TokenVoting",
      [1, 0, 0],
      deployOwnerWallet,
    );
    const tokenVotingRepo = pluginRepo_Factory
      .connect(deployOwnerWallet)
      .attach(tokenRepoAddr);

    const addresslistVotingFactory = new aragonContracts
      .AddresslistVotingSetup__factory();
    const addresslistVotingPluginSetup = await addresslistVotingFactory
      .connect(deployOwnerWallet)
      .deploy();
    const addresslistVotingRepoAddr = await deployPlugin(
      pluginRepoFactory,
      addresslistVotingPluginSetup.address,
      "Addresslist",
      [1, 0, 0],
      deployOwnerWallet,
    );
    const addresslistVotingRepo = pluginRepo_Factory
      .connect(deployOwnerWallet)
      .attach(addresslistVotingRepoAddr);

    const multisigFactory = new aragonContracts
      // @ts-ignore
      // TODO update contracts-ethers
      .MultisigSetup__factory();
    const multisigPluginSetup = await multisigFactory
      .connect(deployOwnerWallet)
      .deploy();
    const multisigRepoAddr = await deployPlugin(
      pluginRepoFactory,
      multisigPluginSetup.address,
      "Multisig",
      [1, 0, 0],
      deployOwnerWallet,
    );
    const multisigRepo = pluginRepo_Factory
      .connect(deployOwnerWallet)
      .attach(multisigRepoAddr);
    // TODO
    // use new ethers-contracts
    // @ts-ignore
    const adminSetupFactory = new aragonContracts.AdminVotingSetup__factory();
    const adminSetupFactory = new aragonContracts.AdminSetup__factory();
    const adminPluginSetup = await adminSetupFactory
      .connect(deployOwnerWallet)
      .deploy();
    const adminRepoAddr = await deployPlugin(
      pluginRepoFactory,
      adminPluginSetup.address,
      "Admin",
      [1, 0, 0],
      deployOwnerWallet,
    );
    const adminRepo = pluginRepo_Factory
      .connect(deployOwnerWallet)
      .attach(adminRepoAddr);

    // send ETH to hardcoded wallet in tests
    await deployOwnerWallet.sendTransaction({
      to: WALLET_ADDRESS,
      value: parseEther("50.0"),
    });

    return {
      managingDaoAddress: managingDao.address,
      daoFactory,
      daoRegistry,
      tokenVotingRepo,
      tokenVotingPluginSetup,
      addresslistVotingRepo,
      addresslistVotingPluginSetup,
      multisigRepo,
      multisigPluginSetup,
      adminRepo,
      adminPluginSetup,
    };
  } catch (e) {
    throw e;
  }
}

async function deployPlugin(
  pluginRepoFactory: aragonContracts.PluginRepoFactory,
  setupAddr: string,
  name: string,
  version: [BigNumberish, BigNumberish, BigNumberish],
  deployOwnerWallet: Signer,
) {
  const repoaddr = await pluginRepoFactory.callStatic
    .createPluginRepoWithVersion(
      name,
      version,
      setupAddr,
      "0x",
      await deployOwnerWallet.getAddress(),
    );
  const tx = await pluginRepoFactory.createPluginRepoWithVersion(
    name,
    version,
    setupAddr,
    "0x",
    await deployOwnerWallet.getAddress(),
  );
  await tx.wait();
  return repoaddr;
}

async function deployEnsContracts(deployOwnerWallet: Signer) {
  try {
    const registryFactory = new ContractFactory(
      ENSRegistry.abi,
      ENSRegistry.bytecode,
    );
    const publicResolverFactory = new ContractFactory(
      PublicResolver.abi,
      PublicResolver.bytecode,
    );

    const registry = await registryFactory.connect(deployOwnerWallet).deploy();
    await registry.deployed();

    const publicResolver = await publicResolverFactory
      .connect(deployOwnerWallet)
      .deploy(registry.address, AddressZero, AddressZero, AddressZero);
    await publicResolver.deployed();

    await registerEnsName(
      "",
      "eth",
      registry,
      await deployOwnerWallet.getAddress(),
      publicResolver.address,
    );
    return { ensRegistry: registry, ensResolver: publicResolver };
  } catch (e) {
    throw e;
  }
}

export async function registerEnsName(
  tld: string,
  name: string,
  registry: Contract,
  owner: string,
  resolver: string,
) {
  try {
    await registry.setSubnodeRecord(
      tld !== "" ? namehash(tld) : HashZero,
      id(name),
      owner,
      resolver,
      0,
    );
  } catch (e) {
    throw e;
  }
}

export async function createDAO(
  daoFactory: aragonContracts.DAOFactory,
  daoSettings: aragonContracts.DAOFactory.DAOSettingsStruct,
  pluginSettings: aragonContracts.DAOFactory.PluginSettingsStruct[],
): Promise<{ daoAddr: string; pluginAddrs: string[] }> {
  const tx = await daoFactory.createDao(daoSettings, pluginSettings);
  const receipt = await tx.wait();
  const registryInterface = aragonContracts.DAORegistry__factory
    .createInterface();
  const registeredLog = receipt.logs.find(
    (log) =>
      log.topics[0] ===
        id(registryInterface.getEvent("DAORegistered").format("sighash")),
  );

  const pluginSetupProcessorInterface = aragonContracts
    .PluginSetupProcessor__factory.createInterface();
  const installedLogs = receipt.logs.filter(
    (log) =>
      log.topics[0] ===
        id(
          pluginSetupProcessorInterface
            .getEvent("InstallationApplied")
            .format("sighash"),
        ),
  );
  if (!registeredLog) {
    throw new Error("Failed to find log");
  }

  const registeredParsed = registryInterface.parseLog(registeredLog);
  return {
    daoAddr: registeredParsed.args[0],
    pluginAddrs: installedLogs.map(
      (log) => pluginSetupProcessorInterface.parseLog(log).args[1],
    ),
  };
}

export async function createAddresslistDAO(
  deployment: Deployment,
  name: string,
  addresses: string[] = [],
) {
  return createDAO(
    deployment.daoFactory,
    {
      metadata: "0x0000",
      name: name,
      trustedForwarder: AddressZero,
    },
    [
      {
        pluginSetup: deployment.addresslistVotingPluginSetup.address,
        pluginSetupRepo: deployment.addresslistVotingRepo.address,
        data: defaultAbiCoder.encode(
          ["tuple(uint8, uint64, uint64, uint64, uint256)", "address[]"],
          [[0, 1, 1, 3600, 1], addresses],
        ),
      },
    ],
  );
}

export async function createTokenVotingDAO(
  deployment: Deployment,
  name: string,
  addresses: string[] = [],
) {
  return createDAO(
    deployment.daoFactory,
    {
      metadata: "0x0000",
      name,
      trustedForwarder: AddressZero,
    },
    [
      {
        pluginSetup: deployment.tokenVotingPluginSetup.address,
        pluginSetupRepo: deployment.tokenVotingRepo.address,
        data: defaultAbiCoder.encode(
          [
            "tuple(uint8, uint64, uint64, uint64, uint256)",
            "tuple(address, string, string)",
            "tuple(address[], uint256[])",
          ],
          [
            [0, 1, 1, 3600, 1],
            [AddressZero, "erc20", "e20"],
            [addresses, addresses.map(() => parseEther("1"))],
          ],
        ),
      },
    ],
  );
}
export async function createMultisigDAO(
  deployment: Deployment,
  name: string,
  addresses: string[] = [],
) {
  return createDAO(
    deployment.daoFactory,
    {
      metadata: "0x0000",
      name: name,
      trustedForwarder: AddressZero,
    },
    [
      {
        pluginSetup: deployment.multisigPluginSetup.address,
        pluginSetupRepo: deployment.multisigRepo.address,
        data: defaultAbiCoder.encode(
          [
            "address[]",
            "tuple(bool, uint16)",
          ],
          [
           addresses,
           [
            true,
            1
           ]
          ],
        ),
      },
    ],
  );
}

export async function createAdminDAO(
  deployment: Deployment,
  name: string,
  admin: string,
) {
  return createDAO(
    deployment.daoFactory,
    {
      metadata: "0x0000",
      name,
      trustedForwarder: AddressZero,
    },
    [
      {
        pluginSetup: deployment.adminPluginSetup.address,
        pluginSetupRepo: deployment.adminRepo.address,
        data: defaultAbiCoder.encode(
          [
            "address",
          ],
          [
            admin,
          ],
        ),
      },
    ],
  );
}


