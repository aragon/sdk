import ganache from "ganache";

export async function start() {
  const server = ganache.server({
    chain: {
      chainId: 31337,
    },
    miner: {
      blockGasLimit: 80000000,
      defaultGasPrice: 800,
    },
    logging: {
      quiet: true,
    },
  });
  await server.listen(8545);
  return server;
}
