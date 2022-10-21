// @ts-ignore
declare const describe, it, expect;

import { ClientErc20, Context, ContextPlugin } from "../../../src";

import {
  IErc20PluginInstall,
  IMintTokenParams,
  IPluginSettings,
} from "../../../src/internal/interfaces/plugins";
import { AddressZero } from "@ethersproject/constants";
import { InvalidAddressError } from "@aragon/sdk-common";
import { contextParamsLocalChain } from "../constants";
describe("Client ERC20 decoders", () => {
  describe("Encoding module", () => {
    it("Should create a Erc20 client and generate a install entry", async () => {
      const initParams: IErc20PluginInstall = {
        settings: {
          minDuration: 7200,
          minTurnout: 0.5,
          minSupport: 0.5,
        },
        useToken: {
          address: AddressZero,
        },
      };
      const erc20InstallPluginItem = ClientErc20.encoding.getPluginInstallItem(
        initParams,
      );

      expect(typeof erc20InstallPluginItem).toBe("object");
      expect(erc20InstallPluginItem.data).toBeInstanceOf(Uint8Array);
    });
    it("Should encode an update plugin settings action and fail with an invalid address", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new ClientErc20(ctxPlugin);
      const params: IPluginSettings = {
        minDuration: 7200,
        minTurnout: 0.5,
        minSupport: 0.5,
      };

      const pluginAddress = "0xinvalid_address";
      expect(() =>
        client.encoding.updatePluginSettingsAction(pluginAddress, params)
      ).toThrow("Invalid plugin address");
    });
    it("Should encode an update plugin settings action", async () => {
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

      expect(typeof updatePluginSettingsAction).toBe("object");
      expect(updatePluginSettingsAction.data).toBeInstanceOf(Uint8Array);
      expect(updatePluginSettingsAction.to).toBe(pluginAddress);
    });
    it("Should encode a mint action with an invalid recipient address and fail", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new ClientErc20(ctxPlugin);
      const params: IMintTokenParams = {
        address: "0xinvalid_address",
        amount: BigInt(10),
      };

      const minterAddress = "0x1234567890123456789012345678901234567890";
      expect(() => client.encoding.mintTokenAction(minterAddress, params))
        .toThrow(new InvalidAddressError());
    });
    it("Should encode a mint action with an invalid token address and fail", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new ClientErc20(ctxPlugin);
      const params: IMintTokenParams = {
        address: "0x1234567890123456789012345678901234567890",
        amount: BigInt(10),
      };

      const minterAddress = "0xinvalid_address";
      expect(() => client.encoding.mintTokenAction(minterAddress, params))
        .toThrow(new InvalidAddressError());
    });
    it("Should encode an ERC20 token mint action", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new ClientErc20(ctxPlugin);
      const params: IMintTokenParams = {
        address: "0x1234567890123456789012345678901234567890",
        amount: BigInt(10),
      };

      const minterAddress = "0x0987654321098765432109876543210987654321";
      const action = client.encoding.mintTokenAction(minterAddress, params);
      expect(typeof action).toBe("object");
      expect(action.data).toBeInstanceOf(Uint8Array);
      expect(action.to).toBe(minterAddress);
    });
  });
});
