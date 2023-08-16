// @ts-ignore
declare const describe, it, expect;

import {
  MintTokenParams,
  TokenVotingClient,
  TokenVotingPluginInstall,
  VotingSettings,
} from "../../../src";

import { InvalidAddressError } from "@aragon/sdk-common";
import { ADDRESS_ONE, contextParamsLocalChain } from "../constants";
import { Context } from "@aragon/sdk-client-common";

describe("Token Voting Client", () => {
  beforeAll(() => {
    contextParamsLocalChain.ensRegistryAddress = ADDRESS_ONE;
  });
  describe("Encoding module", () => {
    it("Should create a TokenVoting client and generate a install entry", async () => {
      const initParams: TokenVotingPluginInstall = {
        votingSettings: {
          minDuration: 7200,
          minParticipation: 0.5,
          supportThreshold: 0.5,
        },
        newToken: {
          name: "Test Token",
          symbol: "TTK",
          balances: [],
          decimals: 18,
        },
      };
      const tokenVotingInstallPluginItem = TokenVotingClient.encoding
        .getPluginInstallItem(
          initParams,
          "local",
        );

      expect(typeof tokenVotingInstallPluginItem).toBe("object");
      expect(tokenVotingInstallPluginItem.data).toBeInstanceOf(Uint8Array);
    });
    it("Should encode an update plugin settings action and fail with an invalid address", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const client = new TokenVotingClient(ctx);
      const params: VotingSettings = {
        minDuration: 7200,
        supportThreshold: 0.5,
        minParticipation: 0.5,
      };

      const pluginAddress = "0xinvalid_address";
      expect(() =>
        client.encoding.updatePluginSettingsAction(pluginAddress, params)
      ).toThrow(new InvalidAddressError());
    });
    it("Should encode an update plugin settings action", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const client = new TokenVotingClient(ctx);
      const params: VotingSettings = {
        minDuration: 7200,
        supportThreshold: 0.5,
        minParticipation: 0.5,
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
      const client = new TokenVotingClient(ctx);
      const params: MintTokenParams = {
        address: "0xinvalid_address",
        amount: BigInt(10),
      };

      const minterAddress = "0x1234567890123456789012345678901234567890";
      expect(() => client.encoding.mintTokenAction(minterAddress, params))
        .toThrow(new InvalidAddressError());
    });
    it("Should encode a mint action with an invalid token address and fail", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const client = new TokenVotingClient(ctx);
      const params: MintTokenParams = {
        address: "0x1234567890123456789012345678901234567890",
        amount: BigInt(10),
      };

      const minterAddress = "0xinvalid_address";
      expect(() => client.encoding.mintTokenAction(minterAddress, params))
        .toThrow(new InvalidAddressError());
    });
    it("Should encode a TokenVoting token mint action", async () => {
      const ctx = new Context(contextParamsLocalChain);
      const client = new TokenVotingClient(ctx);
      const params: MintTokenParams = {
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
