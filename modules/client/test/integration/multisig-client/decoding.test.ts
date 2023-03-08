// @ts-ignore
declare const describe, it, expect;

import {
  AddAddressesParams,
  Context,
  ContextPlugin,
  MultisigClient,
  MultisigPluginSettings,
  MultisigVotingSettings,
  RemoveAddressesParams,
  UpdateMultisigVotingSettingsParams,
} from "../../../src";
import { contextParamsLocalChain } from "../constants";

describe("Client Multisig", () => {
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
        members,
        votingSettings: {
          minApprovals: 1,
          onlyListed: true,
        },
      };

      const actions = client.encoding.addAddressesAction(addAddressesParams);

      const decodedSettings: MultisigPluginSettings = client.decoding
        .addAddressesAction(
          actions.map((action) => action.data),
        );
      decodedSettings.members.forEach((member, index) => {
        expect(member).toBe(addAddressesParams.members[index]);
      });
      expect(decodedSettings.votingSettings.minApprovals).toBe(
        addAddressesParams.votingSettings.minApprovals,
      );
      expect(decodedSettings.votingSettings.onlyListed).toBe(
        addAddressesParams.votingSettings.onlyListed,
      );
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
        members,
        votingSettings: {
          minApprovals: 1,
          onlyListed: true,
        },
      };

      const actions = client.encoding.removeAddressesAction(
        removeAddressesParams,
      );

      const decodedSettings: MultisigPluginSettings = client.decoding
        .removeAddressesAction(
          actions.map((action) => action.data),
        );
      decodedSettings.members.forEach((member, index) => {
        expect(member).toBe(removeAddressesParams.members[index]);
      });
      expect(decodedSettings.votingSettings.minApprovals).toBe(
        removeAddressesParams.votingSettings.minApprovals,
      );
      expect(decodedSettings.votingSettings.onlyListed).toBe(
        removeAddressesParams.votingSettings.onlyListed,
      );
    });
    it("Should decode the min approvals from an update min approvals action", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new MultisigClient(ctxPlugin);

      const pluginAddress = "0x1234567890123456789012345678901234567890";
      const updateMinApprovalsParams: UpdateMultisigVotingSettingsParams = {
        pluginAddress,
        votingSettings: {
          minApprovals: 3,
          onlyListed: true,
        },
      };

      const action = client.encoding.updateMultisigVotingSettings(
        updateMinApprovalsParams,
      );

      const decodedSettings: MultisigVotingSettings = client.decoding
        .updateMultisigVotingSettings(
          action.data,
        );
      expect(typeof decodedSettings.minApprovals).toBe("number");
      expect(decodedSettings.minApprovals).toBe(3);
      expect(typeof decodedSettings.onlyListed).toBe("boolean");
      expect(decodedSettings.onlyListed).toBe(true);
    });

    it("Should try to decode a invalid action and with the update plugin settings decoder return an error", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new MultisigClient(ctxPlugin);
      const data = new Uint8Array([11, 22, 22, 33, 33, 33]);

      expect(() => client.decoding.addAddressesAction([data])).toThrow(
        `data signature does not match function addAddresses. (argument=\"data\", value=\"0x0b1616212121\", code=INVALID_ARGUMENT, version=abi/5.7.0)`,
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
        members,
        votingSettings: {
          minApprovals: 1,
          onlyListed: false,
        },
      };
      const actions = client.encoding.addAddressesAction(addAddressesParams);
      expect(actions.length).toBe(2);
      actions.forEach((action, index) => {
        const iface = client.decoding.findInterface(
          action.data,
        );
        if (index === 0) {
          expect(iface?.id).toBe("function addAddresses(address[])");
          expect(iface?.functionName).toBe("addAddresses");
          expect(iface?.hash).toBe("0x3628731c");
        } else {
          expect(iface?.id).toBe(
            "function updateMultisigSettings(tuple(bool,uint16))",
          );
          expect(iface?.functionName).toBe("updateMultisigSettings");
          expect(iface?.hash).toBe("0x303f4336");
        }
      });
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
