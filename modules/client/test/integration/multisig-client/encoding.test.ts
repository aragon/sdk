// @ts-ignore
declare const describe, it, expect;

import {
  AddAddressesParams,
  Context,
  ContextPlugin,
  MultisigClient,
  MultisigPluginInstallParams,
  RemoveAddressesParams,
} from "../../../src";
import { bytesToHex, InvalidAddressError } from "@aragon/sdk-common";
import { contextParamsLocalChain, TEST_INVALID_ADDRESS } from "../constants";

describe("Client Address List", () => {
  describe("Action generators", () => {
    it("Should create an a Multisig install entry", async () => {
      const members: string[] = [
        "0x1234567890123456789012345678901234567890",
        "0x2345678901234567890123456789012345678901",
        "0x3456789012345678901234567890123456789012",
        "0x4567890123456789012345678901234567890123",
      ];

      const multisigIntallParams: MultisigPluginInstallParams = {
        votingSettings: {
          minApprovals: 3,
          onlyListed: true
        },
        members,
      };
      const installPluginItemItem = MultisigClient.encoding
        .getPluginInstallItem(
          multisigIntallParams,
        );

      expect(typeof installPluginItemItem).toBe("object");
      expect(installPluginItemItem.data).toBeInstanceOf(Uint8Array);
    });

    it("Should create an Multisig client and fail to generate a addn members action with an invalid plugin address", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new MultisigClient(ctxPlugin);

      const members: string[] = [
        "0x1234567890123456789012345678901234567890",
        "0x2345678901234567890123456789012345678901",
        "0x3456789012345678901234567890123456789012",
        "0x4567890123456789012345678901234567890123",
      ];

      const addAddressesParams: AddAddressesParams = {
        members,
        pluginAddress: TEST_INVALID_ADDRESS,
      };

      expect(() => client.encoding.addAddressesAction(addAddressesParams))
        .toThrow(new InvalidAddressError());
    });

    it("Should create an Multisig client and fail to generate an add members action with an invalid member address", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new MultisigClient(ctxPlugin);

      const members: string[] = [
        "0x1234567890123456789012345678901234567890",
        "0x2345678901234567890123456789012345678901",
        "0x3456789012345678901234567890123456789012",
        TEST_INVALID_ADDRESS,
      ];

      const pluginAddress = "0x1234567890123456789012345678901234567890";

      const addAddressesParams: AddAddressesParams = {
        members,
        pluginAddress,
      };
      expect(() =>
        client.encoding.addAddressesAction(
          addAddressesParams,
        )
      ).toThrow(new InvalidAddressError());
    });
    it("Should create an Multisig client and an add members action", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new MultisigClient(ctxPlugin);

      const members: string[] = [
        "0x1357924680135792468013579246801357924680",
        "0x2468013579246801357924680135792468013579",
        "0x0987654321098765432109876543210987654321",
      ];

      const pluginAddress = "0x1234567890123456789012345678901234567890";
      const addAddressesParams: AddAddressesParams = {
        members,
        pluginAddress,
      };
      const action = client.encoding.addAddressesAction(
        addAddressesParams,
      );
      expect(typeof action).toBe("object");
      expect(action.data instanceof Uint8Array).toBe(true);
      expect(action.to).toBe(pluginAddress);
      expect(action.value.toString()).toBe("0");
      const decodedMembers = client.decoding.addAddressesAction(action.data);
      for (let i = 0; i < members.length; i++) {
        expect(members[i]).toBe(decodedMembers[i]);
      }
      expect(bytesToHex(action.data, true)).toBe(
        "0x3628731c00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000003000000000000000000000000135792468013579246801357924680135792468000000000000000000000000024680135792468013579246801357924680135790000000000000000000000000987654321098765432109876543210987654321",
      );
    });
    it("Should create an Multisig client and fail to generate a remove members action with an invalid plugin address", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new MultisigClient(ctxPlugin);

      const members: string[] = [
        "0x1234567890123456789012345678901234567890",
        "0x2345678901234567890123456789012345678901",
        "0x3456789012345678901234567890123456789012",
        "0x4567890123456789012345678901234567890134",
      ];

      const pluginAddress = TEST_INVALID_ADDRESS;
      const removeAddressesParams: RemoveAddressesParams = {
        members,
        pluginAddress,
      };
      expect(() => client.encoding.removeAddressesAction(removeAddressesParams))
        .toThrow(new InvalidAddressError());
    });

    it("Should create an Multisig client and fail to generate a remove members action with an invalid member address", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new MultisigClient(ctxPlugin);

      const members: string[] = [
        "0x1234567890123456789012345678901234567890",
        "0x2345678901234567890123456789012345678901",
        "0x3456789012345678901234567890123456789012",
        TEST_INVALID_ADDRESS,
      ];

      const pluginAddress = "0x1234567890123456789012345678901234567890";
      const removeAddressesParams: RemoveAddressesParams = {
        members,
        pluginAddress,
      };
      expect(() => client.encoding.removeAddressesAction(removeAddressesParams))
        .toThrow(new InvalidAddressError());
    });
    it("Should create an Multisig client and a remove members action", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new MultisigClient(ctxPlugin);

      const members: string[] = [
        "0x1357924680135792468013579246801357924680",
        "0x2468013579246801357924680135792468013579",
        "0x0987654321098765432109876543210987654321",
      ];

      const pluginAddress = "0x1234567890123456789012345678901234567890";

      const removeAddressesParams: RemoveAddressesParams = {
        members,
        pluginAddress,
      };
      const action = client.encoding.removeAddressesAction(
        removeAddressesParams,
      );
      expect(typeof action).toBe("object");
      expect(action.data instanceof Uint8Array).toBe(true);
      expect(action.to).toBe(pluginAddress);
      expect(action.value.toString()).toBe("0");
      const decodedMembers = client.decoding.removeAddressesAction(action.data);
      for (let i = 0; i < members.length; i++) {
        expect(members[i]).toBe(decodedMembers[i]);
      }
      expect(bytesToHex(action.data, true)).toBe(
        "0xa84eb99900000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000003000000000000000000000000135792468013579246801357924680135792468000000000000000000000000024680135792468013579246801357924680135790000000000000000000000000987654321098765432109876543210987654321",
      );
    });
  });
});
