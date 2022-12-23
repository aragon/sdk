// @ts-ignore
declare const describe, it, expect;

import {
  AddAddressesParams,
  Context,
  ContextPlugin,
  MultisigClient,
  MultisigPluginSettings,
  RemoveAddressesParams,
  UpdateMinApprovalsParams,
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
      const addAddressesParams: AddAddressesParams = {
        pluginAddress,
        minApprovals: 3,
        members,
      };

      const action = client.encoding.addAddressesAction(addAddressesParams);

      const decodedParams: MultisigPluginSettings = client.decoding
        .addAddressesAction(
          action.data,
        );

      expect(typeof decodedParams.minApprovals).toBe("bigint");
      for (let i = 0; i < members.length; i++) {
        expect(typeof decodedParams.members[i]).toBe("string");
        expect(members[i]).toBe(decodedParams.members[i]);
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
      const removeAddressesParams: RemoveAddressesParams = {
        pluginAddress,
        minApprovals: 3,
        members,
      };

      const action = client.encoding.removeAddressesAction(
        removeAddressesParams,
      );

      const decodedParams: MultisigPluginSettings = client.decoding
        .removeAddressesAction(
          action.data,
        );

        expect(typeof decodedParams.minApprovals).toBe("bigint");
      for (let i = 0; i < members.length; i++) {
        expect(typeof decodedParams.members[i]).toBe("string");
        expect(members[i]).toBe(decodedParams.members[i]);
      }
    });
    it("Should decode the min approvals from an update min approvals action", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new MultisigClient(ctxPlugin);

      const pluginAddress = "0x1234567890123456789012345678901234567890";
      const updateMinApprovalsParams: UpdateMinApprovalsParams = {
        pluginAddress,
        minApprovals: 3,
      };

      const action = client.encoding.updateMinApprovalsAction(
        updateMinApprovalsParams,
      );

      const decodedMinApprovals: bigint = client.decoding
        .updateMinApprovalsAction(
          action.data,
        );
      expect(typeof decodedMinApprovals).toBe("bigint");
    });

    it("Should try to decode a invalid action and with the update plugin settings decoder return an error", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new MultisigClient(ctxPlugin);
      const data = new Uint8Array([11, 22, 22, 33, 33, 33]);

      expect(() => client.decoding.addAddressesAction(data)).toThrow(
        // TODO update error
        `no matching function (argument="sighash", value="0x0b161621", code=INVALID_ARGUMENT, version=abi/5.7.0)`,
      );
    });

    it("Should get the function for a given action data", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new MultisigClient(ctxPlugin);

      const pluginAddress = "0x1234567890123456789012345678901234567890";

      const members: string[] = [
        "0x1357924680135792468013579246801357924680",
        "0x2468013579246801357924680135792468013579",
        "0x0987654321098765432109876543210987654321",
      ];
      const addAddressesParams: AddAddressesParams = {
        pluginAddress,
        minApprovals: 3,
        members,
      };
      const action = client.encoding.addAddressesAction(addAddressesParams);
      const iface = client.decoding.findInterface(
        action.data,
      );
      expect(iface?.id).toBe("function addAddresses(address[])");
      expect(iface?.functionName).toBe("addAddresses");
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
