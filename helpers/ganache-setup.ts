import ganache, {Server} from "ganache";

export let server: Server;

export async function start() {
  server = ganache.server({
    chain: {
      chainId: 31337,
    },
    miner: {
      blockGasLimit: 80000000,
    },
    logging: {
      quiet: true,
    },
  });
  await server.listen(8545);
  return server;
}

export async function stop() {
  if (server) {
    server.close();
  }
}
