declare const describe, it, beforeAll, afterAll, expect;
import * as ganacheSetup from "../../../../helpers/ganache-setup";
import * as deployContracts from "../../../../helpers/deployContracts";
import { ContextParams } from "../../src";
import { Wallet } from "@ethersproject/wallet";
import { JsonRpcProvider, Networkish } from "@ethersproject/providers";
import { AddressZero } from "@ethersproject/constants";
import { DAOFactory__factory, Registry__factory } from "@aragon/core-contracts-ethers";
import { Random } from "@aragon/sdk-common";

const TEST_WALLET =
  "0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e";

const contextParamsLocalChain: ContextParams = {
  network: 31337,
  signer: new Wallet(TEST_WALLET),
  daoFactoryAddress: "0xf8065dD2dAE72D4A8e74D8BB0c8252F3A9acE7f9",
  web3Providers: ["http://localhost:8545"],
  ipfsNodes: [
    {
      url: "http://localhost:5001",
    },
    {
      url: "http://localhost:5002",
    },
    {
      url: "http://localhost:5003",
    },
  ],
  graphqlNodes: ["https://api.thegraph.com/subgraphs/name/aragon/aragon-zaragoza-rinkeby"]
};

let daoAddress = "0x123456789012345678901234567890123456789012345678"

describe("Client", () => {
  beforeAll(async () => {
    const server = await ganacheSetup.start();
    const daoFactory = await deployContracts.deploy(server);
    contextParamsLocalChain.daoFactoryAddress = daoFactory.address;
    const addr = await createLegacyDao(contextParamsLocalChain)
    daoAddress = addr;
  });

  afterAll(async () => {
    await ganacheSetup.stop();
  });
  it("Should Pass", async () => {
    const a = 1
    expect(a === 1).toBe(true)
  });
});


/* TODO: 
This code creates a dao with the legacy method
to be able to test the deposit, please remove
everything from here once the new dao creation works
*/
async function createLegacyDao(params: ContextParams) {
  if (!params.web3Providers) {
    throw new Error("A provider is needed");
  }
  if (!params.daoFactoryAddress) {
    throw new Error("A dao factory is needed");
  }
  const provider = useWeb3Providers(params.web3Providers, params.network)
  const signer = new Wallet(TEST_WALLET, provider[0])
  const daoFactoryInstance = DAOFactory__factory.connect(
    params.daoFactoryAddress,
    signer
  );

  const daoCreationParams: ICreateDaoERC20Voting = {
    daoConfig: {
      name: "ERC20VotingDAO_" + Math.floor(Random.getFloat() * 9999) + 1,
      metadata: "0x1234",
    },
    tokenConfig: {
      addr: "0x0000000000000000000000000000000000000000",
      name:
        "TestToken" +
        (Random.getFloat() + 1)
          .toString(36)
          .substring(4)
          .toUpperCase(),
      symbol:
        "TEST" +
        (Random.getFloat() + 1)
          .toString(36)
          .substring(4)
          .toUpperCase(),
    },
    mintConfig: {
      receivers: [Wallet.createRandom().address, Wallet.createRandom().address],
      amounts: [BigInt(Math.floor(Random.getFloat() * 9999) + 1), BigInt(Math.floor(Random.getFloat() * 9999) + 1)]
    },
    votingConfig: {
      supportRequiredPct: Math.floor(Random.getFloat() * 100) + 1,
      participationRequiredPct: Math.floor(Random.getFloat() * 100) + 1,
      minDuration: Math.floor(Random.getFloat() * 9999) + 1,
    },
    // gsnForwarder: Wallet.createRandom().address,
  };
  const registryInstance = await daoFactoryInstance
    .registry()
    .then(registryAddress => {
      return Registry__factory.connect(registryAddress, provider[0]);
    });
  return daoFactoryInstance.newERC20VotingDAO(
    daoCreationParams.daoConfig,
    daoCreationParams.votingConfig,
    daoCreationParams.tokenConfig,
    daoCreationParams.mintConfig,
    daoCreationParams.gsnForwarder ?? AddressZero
  )
    .then(tx => tx.wait())
    .then((cr) => {
      const newDaoAddress = cr.events?.find(
        e => e.address === registryInstance.address
      )?.topics[1];
      if (!newDaoAddress)
        return Promise.reject(new Error("Could not create DAO"));

      return "0x" + newDaoAddress.slice(newDaoAddress.length - 40);
    })
}

interface ICreateDaoERC20Voting {
  daoConfig: DaoConfig;
  tokenConfig: TokenConfig;
  mintConfig: MintConfig;
  votingConfig: VotingConfig;
  gsnForwarder?: string;
}

interface DaoConfig {
  name: string;
  metadata: string;
}

interface TokenConfig {
  addr: string;
  name: string;
  symbol: string;
}

interface MintConfig {
  receivers: string[];
  amounts: bigint[];
}

interface VotingConfig {
  /** 0-100 as a percentage */
  supportRequiredPct: number;
  /** 0-100 as a percentage */
  participationRequiredPct: number;
  /** In seconds */
  minDuration: number;
}


function useWeb3Providers(
  endpoints: string | JsonRpcProvider | (string | JsonRpcProvider)[],
  network: Networkish,
): JsonRpcProvider[] {
  if (Array.isArray(endpoints)) {
    return endpoints.map((item) => {
      if (typeof item === "string") {
        const url = new URL(item);
        return new JsonRpcProvider(url.href, network);
      }
      return item;
    });
  } else if (typeof endpoints === "string") {
    const url = new URL(endpoints);
    return [new JsonRpcProvider(url.href, network)];
  } else {
    return [endpoints];
  }
}