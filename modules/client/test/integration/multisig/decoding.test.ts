// @ts-ignore
declare const describe, it, expect;

import {
  Context,
  ContextPlugin,
  IPluginSettings,
  MultisigClient,
} from "../../../src";
import { contextParamsLocalChain } from "../constants";

describe("Client Address List", () => {
  describe("Action decoders", () => {
    it("Should decode the members from an add members action", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new MultisigClient(ctxPlugin);

      const pluginAddress = "0x1234567890123456789012345678901234567890";
      const members: string[] = [
        "0x1357924680135792468013579246801357924680",
        "0x2468013579246801357924680135792468013579",
        "0x0987654321098765432109876543210987654321",
      ];

      const action = client.encoding
        .addMembersAction(
          pluginAddress,
          members,
        );

      const decodedMembers: string[] = client.decoding
        .addMembersAction(
          action.data,
        );

      for (let i = 0; i < members.length; i++) {
        expect(typeof decodedMembers[i]).toBe("string");
        expect(members[i]).toBe(decodedMembers[i]);
      }
    });
    it("Should decode the members from an remove members action", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new MultisigClient(ctxPlugin);

      const pluginAddress = "0x1234567890123456789012345678901234567890";
      const members: string[] = [
        "0x1357924680135792468013579246801357924680",
        "0x2468013579246801357924680135792468013579",
        "0x0987654321098765432109876543210987654321",
      ];

      const action = client.encoding
        .removeMembersAction(
          pluginAddress,
          members,
        );

      const decodedMembers: string[] = client.decoding
        .removeMembersAction(
          action.data,
        );

      for (let i = 0; i < members.length; i++) {
        expect(typeof decodedMembers[i]).toBe("string");
        expect(members[i]).toBe(decodedMembers[i]);
      }
    });

    it("Should try to decode a invalid action and with the update plugin settings decoder return an error", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new MultisigClient(ctxPlugin);
      const data = new Uint8Array([11, 22, 22, 33, 33, 33]);

      expect(() => client.decoding.addMembersAction(data)).toThrow(
        // TODO update error
        `no matching function (argument="sighash", value="0x0b161621", code=INVALID_ARGUMENT, version=abi/5.7.0)`,
      );
    });

    it("Should get the function for a given action data", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new MultisigClient(ctxPlugin);
      const params: IPluginSettings = {
        minDuration: 7200,
        minTurnout: 0.5,
        minSupport: 0.5,
      };

      const pluginAddress = "0x1234567890123456789012345678901234567890";

      const members: string[] = [
        "0x1357924680135792468013579246801357924680",
        "0x2468013579246801357924680135792468013579",
        "0x0987654321098765432109876543210987654321",
      ];
      const action = client.encoding
        .addMembersAction(
          pluginAddress,
          members,
        );
      const iface = client.decoding.findInterface(
        action.data,
      );
      expect(iface?.id).toBe("function addMembers(address[])");
      expect(iface?.functionName).toBe("addMembers");
      expect(iface?.hash).toBe("0x9b979e2f");
    });

    it("Should try to get the function of an invalid data and return null", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new MultisigClient(ctxPlugin);
      const data = new Uint8Array([11, 22, 22, 33, 33, 33]);
      const iface = client.decoding.findInterface(data);
      expect(iface).toBe(null);
    });
  });
});
