import {
  MintTokenParams,
  TokenVotingClient,
  VotingMode,
  VotingSettings,
} from "../../../src";

import { ADDRESS_ONE, contextParamsLocalChain } from "../constants";
import { Context, bytesToHex } from "@aragon/sdk-client-common";

describe("Token Voting Client", () => {
  beforeAll(() => {
    contextParamsLocalChain.ensRegistryAddress = ADDRESS_ONE;
  });
  describe("Action decoders", () => {
    it("Should decode the plugin settings from an update plugin settings action", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const client = new TokenVotingClient(ctx);
      const params: VotingSettings = {
        minDuration: 100000,
        minParticipation: 0.25,
        supportThreshold: 0.51,
        minProposerVotingPower: BigInt(0),
        votingMode: VotingMode.EARLY_EXECUTION,
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
      expect(decodedParams.minProposerVotingPower).toBe(
        params.minProposerVotingPower,
      );
      expect(decodedParams.supportThreshold).toBe(params.supportThreshold);
      expect(decodedParams.votingMode).toBe(params.votingMode);
    });
    it("Should decode a mint action", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const client = new TokenVotingClient(ctx);
      const params: MintTokenParams = {
        address: "0x1234567890123456789012345678901234567890",
        amount: BigInt(10),
      };

      const minterAddress = "0x0987654321098765432109876543210987654321";
      const action = client.encoding.mintTokenAction(minterAddress, params);
      const decodedParams = client.decoding.mintTokenAction(action.data);

      expect(decodedParams.address).toBe(params.address);
      expect(bytesToHex(action.data)).toBe(
        "0x40c10f190000000000000000000000001234567890123456789012345678901234567890000000000000000000000000000000000000000000000000000000000000000a",
      );
      expect(decodedParams.amount).toBe(params.amount);
    });

    it("Should try to decode a invalid action and with the update plugin settings decoder return an error", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const client = new TokenVotingClient(ctx);
      const data = new Uint8Array([11, 22, 22, 33, 33, 33]);

      expect(() => client.decoding.updatePluginSettingsAction(data)).toThrow();
    });

    it("Should get the function for a given action data", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const client = new TokenVotingClient(ctx);
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
      expect(iface?.id).toBe(
        "function updateVotingSettings(tuple(uint8,uint32,uint32,uint64,uint256))",
      );
      expect(iface?.functionName).toBe("updateVotingSettings");
      expect(iface?.hash).toBe("0x0dfb278e");
    });

    it("Should try to get the function of an invalid data and return null", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const client = new TokenVotingClient(ctx);
      const data = new Uint8Array([11, 22, 22, 33, 33, 33]);
      const iface = client.decoding.findInterface(data);
      expect(iface).toBe(null);
    });
  });
});
