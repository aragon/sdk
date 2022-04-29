import * as aragonContracts from "@aragon/core-contracts-ethers";
import {ethers} from "ethers";
import {Server} from 'ganache'

export async function deploy(server: Server) {
  const accounts = await server.provider.getInitialAccounts()
  const provider = new ethers.providers.JsonRpcProvider(
    "http://127.0.0.1:8545"
  );
  const owner = new ethers.Wallet(accounts[Object.keys(accounts)[0]].secretKey, provider);

  const tokenFactory = new aragonContracts.TokenFactory__factory();
  const token = await tokenFactory.connect(owner).deploy();

  const registryFactory = new aragonContracts.Registry__factory();
  const registry = await registryFactory.connect(owner).deploy();

  const daoFactory = new aragonContracts.DAOFactory__factory();
  const dao = await daoFactory
    .connect(owner)
    .deploy(registry.address, token.address);

  // send ETH to hardcoded wallet in tests
  await owner.sendTransaction({
    to: "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199",
    value: ethers.utils.parseEther("50.0"),
  });

  return dao;
}
