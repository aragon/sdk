// @ts-ignore
declare const describe, it, expect;

import { ClientErc20, Context, ContextPlugin, IPluginSettings } from "../../../src";

import { bytesToHex } from "@aragon/sdk-common";
import { contextParamsLocalChain } from "../constants";
import { IMintTokenParams } from "../../../src/client-erc20/internal/interfaces/client";

describe("Client ERC20", () => {
  describe("Action decoders", () => {
    it("Should decode the plugin settings from an update plugin settings action", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new ClientErc20(ctxPlugin);
      const params: IPluginSettings = {
        minDuration: 7200,
        minTurnout: 0.5,
        minSupport: 0.5,
      };

      const pluginAddress = "0x1234567890123456789012345678901234567890";

      const updatePluginSettingsAction = client.encoding
        .updatePluginSettingsAction(
          pluginAddress,
          params,
        );
      const decodedParams: IPluginSettings = client.decoding
        .updatePluginSettingsAction(
          updatePluginSettingsAction.data,
        );

      expect(decodedParams.minDuration).toBe(params.minDuration);
      expect(decodedParams.minSupport).toBe(params.minSupport);
      expect(decodedParams.minTurnout).toBe(params.minTurnout);
    });
    it("Should decode a mint action", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new ClientErc20(ctxPlugin);
      const params: IMintTokenParams = {
        address: "0x1234567890123456789012345678901234567890",
        amount: BigInt(10),
      };

      const minterAddress = "0x0987654321098765432109876543210987654321";
      const action = client.encoding.mintTokenAction(minterAddress, params);
      const decodedParams = client.decoding.mintTokenAction(action.data);

      expect(decodedParams.address).toBe(params.address);
      expect(bytesToHex(action.data, true)).toBe(
        "0x40c10f190000000000000000000000001234567890123456789012345678901234567890000000000000000000000000000000000000000000000000000000000000000a",
      );
      expect(decodedParams.amount).toBe(params.amount);
    });

    it("Should try to decode a invalid action and with the update plugin settings decoder return an error", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new ClientErc20(ctxPlugin);
      const data = new Uint8Array([11, 22, 22, 33, 33, 33]);

      expect(() => client.decoding.updatePluginSettingsAction(data)).toThrow(
        `no matching function (argument="sighash", value="0x0b161621", code=INVALID_ARGUMENT, version=abi/5.6.0)`,
      );
    });

    it("Should get the function for a given action data", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new ClientErc20(ctxPlugin);
      const params: IPluginSettings = {
        minDuration: 7200,
        minTurnout: 0.5,
        minSupport: 0.5,
      };

      const pluginAddress = "0x1234567890123456789012345678901234567890";

      const updatePluginSettingsAction = client.encoding
        .updatePluginSettingsAction(
          pluginAddress,
          params,
        );
      const iface = client.decoding.findInterface(
        updatePluginSettingsAction.data,
      );
      expect(iface?.id).toBe("function changeVoteConfig(uint64,uint64,uint64)");
      expect(iface?.functionName).toBe("changeVoteConfig");
      expect(iface?.hash).toBe("0x634fe2fb");
    });

    it("Should try to get the function of an invalid data and return null", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new ClientErc20(ctxPlugin);
      const data = new Uint8Array([11, 22, 22, 33, 33, 33]);
      const iface = client.decoding.findInterface(data);
      expect(iface).toBe(null);
    });
  });
});
