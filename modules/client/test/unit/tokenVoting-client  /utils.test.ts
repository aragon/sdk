import { ProposalStatus, TokenType } from "@aragon/sdk-client-common";
import {
  SubgraphContractType,
  SubgraphTokenVotingProposal,
} from "../../../src/tokenVoting/internal/types";
import {
  computeProposalStatus,
  parseToken,
} from "../../../src/tokenVoting/internal/utils";

describe("tokenVoting-client utils", () => {
  describe("parseToken", () => {
    it("should return ERC721", () => {
      const token = parseToken({
        __typename: SubgraphContractType.ERC721,
        id: "0x1234567890123456789012345678901234567890",
        name: "TestToken",
        symbol: "TT",
      });
      expect(token).toEqual({
        address: "0x1234567890123456789012345678901234567890",
        name: "TestToken",
        symbol: "TT",
        type: TokenType.ERC721,
      });
    });
    it("should return ERC20", () => {
      const token = parseToken({
        __typename: SubgraphContractType.ERC20,
        id: "0x1234567890123456789012345678901234567890",
        name: "TestToken",
        symbol: "TT",
        decimals: 18,
      });
      expect(token).toEqual({
        address: "0x1234567890123456789012345678901234567890",
        name: "TestToken",
        symbol: "TT",
        decimals: 18,
        type: TokenType.ERC20,
      });
    });
    it("should return ERC20Wrapper", () => {
      const token = parseToken({
        __typename: SubgraphContractType.ERC20_WRAPPER,
        id: "0x1234567890123456789012345678901234567890",
        name: "TestToken",
        symbol: "TT",
        decimals: 18,
        underlyingToken: {
          __typename: SubgraphContractType.ERC20,
          id: "0x1234567890123456789012345678901234567890",
          name: "TestToken",
          symbol: "TT",
          decimals: 18,
        },
      });
      expect(token).toEqual({
        address: "0x1234567890123456789012345678901234567890",
        name: "TestToken",
        symbol: "TT",
        decimals: 18,
        type: TokenType.ERC20,
        underlyingToken: {
          address: "0x1234567890123456789012345678901234567890",
          name: "TestToken",
          symbol: "TT",
          decimals: 18,
          type: TokenType.ERC20,
        },
      });
    });
    it("should return null", () => {
      const token = parseToken({
        // @ts-ignore
        __typename: "Other",
        id: "0x1234567890123456789012345678901234567890",
        name: "TestToken",
        symbol: "TT",
      });
      expect(token).toEqual(null);
    });
  });
  describe("computeProposalStatus", () => {
    it("should return PENDING", () => {
      const endDate = Date.now() / 1000;
      const startDate = (Date.now() / 1000) + 500;

      expect(computeProposalStatus({
        endDate: endDate.toString(),
        startDate: startDate.toString(),
        approvalReached: false,
        executed: false,
        earlyExecutable: false,
      } as SubgraphTokenVotingProposal)).toBe(ProposalStatus.PENDING);
    });
    it("should return EXECUTED", () => {
      const endDate = Date.now() / 1000;
      const startDate = (Date.now() / 1000) - 500;

      expect(computeProposalStatus({
        endDate: endDate.toString(),
        startDate: startDate.toString(),
        approvalReached: false,
        executed: true,
        earlyExecutable: false,
      } as SubgraphTokenVotingProposal)).toBe(ProposalStatus.EXECUTED);
    });
    it("should return ACTIVE", () => {
      const endDate = (Date.now() / 1000) + 500;
      const startDate = (Date.now() / 1000) - 500;

      expect(computeProposalStatus({
        endDate: endDate.toString(),
        startDate: startDate.toString(),
        approvalReached: false,
        executed: false,
        earlyExecutable: false,
      } as SubgraphTokenVotingProposal)).toBe(ProposalStatus.ACTIVE);
    });
    it("should return SUCCEEDED if executable = true", () => {
      const endDate = Date.now() / 1000;
      const startDate = (Date.now() / 1000) - 500;

      expect(computeProposalStatus({
        endDate: endDate.toString(),
        startDate: startDate.toString(),
        approvalReached: true,
        executed: false,
        earlyExecutable: false,
      } as SubgraphTokenVotingProposal)).toBe(ProposalStatus.SUCCEEDED);
    });
    it("should return SUCCEEDED if earlyExecutable = true", () => {
      const endDate = (Date.now() / 1000) + 500;
      const startDate = (Date.now() / 1000) - 500;

      expect(computeProposalStatus({
        endDate: endDate.toString(),
        startDate: startDate.toString(),
        approvalReached: true,
        executed: false,
        earlyExecutable: true,
      } as SubgraphTokenVotingProposal)).toBe(ProposalStatus.SUCCEEDED);
    });
    it("should return SUCCEEDED if earlyExecutable = true and isSignaling = true", () => {
      const endDate = (Date.now() / 1000) + 500;
      const startDate = (Date.now() / 1000) - 500;

      expect(computeProposalStatus({
        endDate: endDate.toString(),
        startDate: startDate.toString(),
        approvalReached: true,
        executed: false,
        isSignaling: false,
        earlyExecutable: true,
      } as SubgraphTokenVotingProposal)).toBe(ProposalStatus.SUCCEEDED);
    });
    it("should return SUCCEEDED if approvalReached = true and endDate has passed", () => {
      const endDate = (Date.now() / 1000) - 200;
      const startDate = (Date.now() / 1000) - 500;

      expect(computeProposalStatus({
        endDate: endDate.toString(),
        startDate: startDate.toString(),
        approvalReached: true,
        executed: false,
        isSignaling: false,
        earlyExecutable: false,
      } as SubgraphTokenVotingProposal)).toBe(ProposalStatus.SUCCEEDED);
    });
    it("should return SUCCEEDED if approvalReached = true and endDate has passed and isSignaling = true", () => {
      const endDate = (Date.now() / 1000) - 200;
      const startDate = (Date.now() / 1000) - 500;

      expect(computeProposalStatus({
        endDate: endDate.toString(),
        startDate: startDate.toString(),
        approvalReached: true,
        executed: false,
        isSignaling: true,
        earlyExecutable: false,
      } as SubgraphTokenVotingProposal)).toBe(ProposalStatus.SUCCEEDED);
    });
    it("should return DEFEATED", () => {
      const endDate = (Date.now() / 1000) - 200;
      const startDate = (Date.now() / 1000) - 500;

      expect(computeProposalStatus({
        endDate: endDate.toString(),
        startDate: startDate.toString(),
        approvalReached: false,
        executed: false,
        earlyExecutable: false,
      } as SubgraphTokenVotingProposal)).toBe(ProposalStatus.DEFEATED);
    });
  });
});
