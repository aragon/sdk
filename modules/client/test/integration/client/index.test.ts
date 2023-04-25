// @ts-ignore
declare const describe, it, expect;

import { JsonRpcProvider } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";
import { Client, Context } from "../../../src";
import { contextParamsMainnet, web3endpoints } from "../constants";

describe("Client", () => {
  describe("Client instances", () => {
    it("Should create a working client", async () => {
      const ctx = new Context(contextParamsMainnet);
      const client = new Client(ctx);

      expect(client).toBeInstanceOf(Client);
      expect(client.web3.getProvider()).toBeInstanceOf(JsonRpcProvider);
      expect(client.web3.getConnectedSigner()).toBeInstanceOf(Wallet);

      const web3Status = await client.web3.isUp();
      expect(web3Status).toEqual(true);
    });
    it("Should create a failing client", async () => {
      contextParamsMainnet.web3Providers = web3endpoints.failing;
      const context = new Context(contextParamsMainnet);
      const client = new Client(context);

      expect(client).toBeInstanceOf(Client);
      expect(client.web3.getProvider()).toBeInstanceOf(JsonRpcProvider);
      expect(client.web3.getConnectedSigner()).toBeInstanceOf(Wallet);

      const web3Status = await client.web3.isUp();
      expect(web3Status).toEqual(false);
    });
    it("Should create a client, fail and shift to a working endpoint", async () => {
      contextParamsMainnet.web3Providers = web3endpoints.failing.concat(
        web3endpoints.working,
      );
      jest.spyOn(Math, "random").mockReturnValueOnce(0);
      const context = new Context(contextParamsMainnet);
      const client = new Client(context);
      await client
        .web3.isUp()
        .then((isUp) => {
          expect(isUp).toEqual(false);
          client.web3.shiftProvider();

          return client.web3.isUp();
        })
        .then((isUp) => {
          expect(isUp).toEqual(true);
        });
    });
  });
});
