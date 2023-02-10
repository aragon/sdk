// @ts-ignore
declare const describe, it, expect;

import {
  AddresslistVotingClient,
  Context,
  ContextPlugin,
  VotingMode,
  VotingSettings,
} from "../../../src";
import { contextParamsLocalChain } from "../constants";

describe("Client Address List", () => {
  describe("Action decoders", () => {
    it("Should decode the plugin settings from an update plugin settings action", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new AddresslistVotingClient(ctxPlugin);
      const params: VotingSettings = {
        minDuration: 100000,
        minParticipation: 0.25,
        supportThreshold: 0.51,
        minProposerVotingPower: BigInt(0),
        votingMode: VotingMode.EARLY_EXECUTION
      };

      const pluginAddress = "0x1234567890123456789012345678901234567890";

      const updatePluginSettingsAction = client.encoding
        .updatePluginSettingsAction(
          pluginAddress,
          params,
        );
      const decodedParams: VotingSettings = client.decoding
        .updatePluginSettingsAction(
          updatePluginSettingsAction.data,
        );

      expect(decodedParams.minDuration).toBe(params.minDuration);
      expect(decodedParams.minParticipation).toBe(params.minParticipation);
      expect(decodedParams.minProposerVotingPower).toBe(params.minProposerVotingPower);
      expect(decodedParams.supportThreshold).toBe(params.supportThreshold);
      expect(decodedParams.votingMode).toBe(params.votingMode);
    });

    it("Should try to decode a invalid action and with the update plugin settings decoder return an error", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new AddresslistVotingClient(ctxPlugin);
      const data = new Uint8Array([11, 22, 22, 33, 33, 33]);

      expect(() => client.decoding.updatePluginSettingsAction(data)).toThrow(
        `no matching function (argument=\"name\", value=\"\\u0016\\u0016!!!\", code=INVALID_ARGUMENT, version=abi/5.7.0)`,
      );
    });
    it("Should decode a add members action", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new AddresslistVotingClient(ctxPlugin);

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
      const client = new AddresslistVotingClient(ctxPlugin);

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
      const client = new AddresslistVotingClient(ctxPlugin);

      const params: VotingSettings = {
        minDuration: 100000,
        minParticipation: 0.25,
        supportThreshold: 0.51,
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
      expect(iface?.id).toBe("function updateVotingSettings(tuple(uint8,uint32,uint32,uint64,uint256))");
      expect(iface?.functionName).toBe("updateVotingSettings");
      expect(iface?.hash).toBe("0x0dfb278e");
    });

    it("Should try to get the function of an invalid data and return null", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new AddresslistVotingClient(ctxPlugin);
      const data = new Uint8Array([11, 22, 22, 33, 33, 33]);
      const iface = client.decoding.findInterface(data);
      expect(iface).toBe(null);
    });
  });
});
