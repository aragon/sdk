// @ts-ignore
declare const describe, it, expect;

import {
  AddresslistVotingClient,
  Context,
  ContextPlugin,
  IAddresslistVotingPluginInstall,
  VotingSettings,
} from "../../../src";
import { bytesToHex, InvalidAddressOrEnsError } from "@aragon/sdk-common";
import { contextParamsLocalChain } from "../constants";
describe("Client Address List", () => {
  describe("Action generators", () => {
    it("Should create an AddressList client and generate a install entry", async () => {
      const withdrawParams: IAddresslistVotingPluginInstall = {
        votingSettings: {
          minDuration: 7200, // seconds
          supportThreshold: 0.5,
          minParticipation: 0.5,
        },
        addresses: [
          "0x1234567890123456789012345678901234567890",
          "0x2345678901234567890123456789012345678901",
          "0x3456789012345678901234567890123456789012",
          "0x4567890123456789012345678901234567890134",
        ],
      };

      const installPluginItemItem = AddresslistVotingClient.encoding
        .getPluginInstallItem(
          withdrawParams,
        );

      expect(typeof installPluginItemItem).toBe("object");
      // what does this should be
      expect(installPluginItemItem.data).toBeInstanceOf(Uint8Array);
    });

    it("Should create an AddressList client and fail to generate a plugin config action with an invalid address", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new AddresslistVotingClient(ctxPlugin);

      const pluginConfigParams: VotingSettings = {
        minDuration: 100000,
        minParticipation: 0.25,
        supportThreshold: 0.51,
      };

      const pluginAddress = "0xinvalid_address";
      expect(() =>
        client.encoding.updatePluginSettingsAction(
          pluginAddress,
          pluginConfigParams,
        )
      ).toThrow(new InvalidAddressOrEnsError());
    });

    it("Should create an AddressList client and generate a plugin config action action", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new AddresslistVotingClient(ctxPlugin);

      const pluginConfigParams: VotingSettings = {
        minDuration: 100000,
        minParticipation: 0.25,
        supportThreshold: 0.51,
      };

      const pluginAddress = "0x1234567890123456789012345678901234567890";

      const installPluginItemItem = client.encoding.updatePluginSettingsAction(
        pluginAddress,
        pluginConfigParams,
      );

      expect(typeof installPluginItemItem).toBe("object");
      // what does this should be
      expect(installPluginItemItem.data).toBeInstanceOf(Uint8Array);
      expect(installPluginItemItem.to).toBe(pluginAddress);
    });

    it("Should encode a add members action with an invalid plugin address and fail", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new AddresslistVotingClient(ctxPlugin);

      const members: string[] = [
        "0x1357924680135792468013579246801357924680",
        "0x2468013579246801357924680135792468013579",
        "0x0987654321098765432109876543210987654321",
      ];

      const pluginAddress = "0xinvalid_address";
      expect(() => client.encoding.addMembersAction(pluginAddress, members))
        .toThrow(new InvalidAddressOrEnsError());
    });
    it("Should encode a add members action with an invalid member address and fail", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new AddresslistVotingClient(ctxPlugin);

      const members: string[] = [
        "0xinvalid_address",
        "0x2468013579246801357924680135792468013579",
        "0x0987654321098765432109876543210987654321",
      ];

      const pluginAddress = "0x1234567890123456789012345678901234567890";
      expect(() => client.encoding.addMembersAction(pluginAddress, members))
        .toThrow(new InvalidAddressOrEnsError());
    });
    it("Should encode a add members action", async () => {
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

      expect(typeof action).toBe("object");
      expect(action.data).toBeInstanceOf(Uint8Array);
      expect(bytesToHex(action.data, true)).toBe(
        "0x3628731c00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000003000000000000000000000000135792468013579246801357924680135792468000000000000000000000000024680135792468013579246801357924680135790000000000000000000000000987654321098765432109876543210987654321",
      );
      expect(action.to).toBe(pluginAddress);
    });
    it("Should encode a remove members action with an invalid plugin address and fail", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new AddresslistVotingClient(ctxPlugin);

      const members: string[] = [
        "0x1357924680135792468013579246801357924680",
        "0x2468013579246801357924680135792468013579",
        "0x0987654321098765432109876543210987654321",
      ];

      const pluginAddress = "0xinvalid_address";
      expect(() => client.encoding.removeMembersAction(pluginAddress, members))
        .toThrow(new InvalidAddressOrEnsError());
    });
    it("Should encode a remove members action with an invalid member address and fail", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const ctxPlugin = ContextPlugin.fromContext(ctx);
      const client = new AddresslistVotingClient(ctxPlugin);

      const members: string[] = [
        "0xinvalid_address",
        "0x2468013579246801357924680135792468013579",
        "0x0987654321098765432109876543210987654321",
      ];

      const pluginAddress = "0x1234567890123456789012345678901234567890";
      expect(() => client.encoding.removeMembersAction(pluginAddress, members))
        .toThrow(new InvalidAddressOrEnsError());
    });
    it("Should encode a remove members action", async () => {
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

      expect(typeof action).toBe("object");
      expect(action.data).toBeInstanceOf(Uint8Array);
      expect(bytesToHex(action.data, true)).toBe(
        "0xa84eb99900000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000003000000000000000000000000135792468013579246801357924680135792468000000000000000000000000024680135792468013579246801357924680135790000000000000000000000000987654321098765432109876543210987654321",
      );
      expect(action.to).toBe(pluginAddress);
    });
  });
});
