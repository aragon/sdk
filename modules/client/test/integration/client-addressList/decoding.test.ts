// @ts-ignore
declare const describe, it, expect;

import {
  ClientAddressList,
  Context,
  ContextPlugin,
  IPluginSettings,
} from "../../../src";
import { contextParamsLocalChain } from "../constants";

describe("Client Address List", () => {
  describe("Action decoders", () => {
    it("Should decode the plugin settings from an update plugin settings action", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new ClientAddressList(ctxPlugin);
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

    it("Should try to decode a invalid action and with the update plugin settings decoder return an error", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new ClientAddressList(ctxPlugin);
      const data = new Uint8Array([11, 22, 22, 33, 33, 33]);

      expect(() => client.decoding.updatePluginSettingsAction(data)).toThrow(
        `no matching function (argument="sighash", value="0x0b161621", code=INVALID_ARGUMENT, version=abi/5.7.0)`,
      );
    });
    it("Should decode a add members action", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new ClientAddressList(ctxPlugin);

      const members: string[] = [
        "0x1357924680135792468013579246801357924680",
        "0x2468013579246801357924680135792468013579",
        "0x0987654321098765432109876543210987654321",
      ];

      const pluginAddress = "0x1234567890123456789012345678901234567890";
      const action = client.encoding.addMembersAction(pluginAddress, members);
      const decodedMembers = client.decoding.addMembersAction(action.data);
      expect(Array.isArray(decodedMembers)).toBe(true);
      for (let i = 0; i < decodedMembers.length; i++) {
        expect(typeof decodedMembers[i]).toBe("string");
        expect(decodedMembers[i]).toBe(members[i]);
      }
    });
    it("Should decode a remove members action", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new ClientAddressList(ctxPlugin);

      const members: string[] = [
        "0x1357924680135792468013579246801357924680",
        "0x2468013579246801357924680135792468013579",
        "0x0987654321098765432109876543210987654321",
      ];

      const pluginAddress = "0x1234567890123456789012345678901234567890";
      const action = client.encoding.removeMembersAction(
        pluginAddress,
        members,
      );
      const decodedMembers = client.decoding.removeMembersAction(action.data);
      expect(Array.isArray(decodedMembers)).toBe(true);
      for (let i = 0; i < decodedMembers.length; i++) {
        expect(typeof decodedMembers[i]).toBe("string");
        expect(decodedMembers[i]).toBe(members[i]);
      }
    });

    it("Should get the function for a given action data", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new ClientAddressList(ctxPlugin);
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
      expect(iface?.id).toBe("function setConfiguration(uint64,uint64,uint64)");
      expect(iface?.functionName).toBe("setConfiguration");
      expect(iface?.hash).toBe("0x9b979e2f");
    });

    it("Should try to get the function of an invalid data and return null", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new ClientAddressList(ctxPlugin);
      const data = new Uint8Array([11, 22, 22, 33, 33, 33]);
      const iface = client.decoding.findInterface(data);
      expect(iface).toBe(null);
    });
  });
});
