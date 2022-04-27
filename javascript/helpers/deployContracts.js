const aragonContracts = require("@aragon/core-contracts-ethers");
const ethers = require("ethers");
const fs = require("fs/promises");

async function deploy() {
  const keys = JSON.parse(
    (await fs.readFile("./ganache-keys.json")).toString()
  );
  const key = keys.private_keys[Object.keys(keys.private_keys)[0]];
  const provider = new ethers.providers.JsonRpcProvider(
    "http://127.0.0.1:8545"
  );
  const owner = new ethers.Wallet(key, provider);

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

  console.log("Token:", token.address);
  console.log("Registry:", registry.address);
  console.log("DAO:", dao.address);
  if (process.env.CI) {
    console.log(`::set-output name=dao::${dao.address}`);
  }
}

deploy()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
