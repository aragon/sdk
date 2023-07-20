import { ProposalStatus } from "@aragon/sdk-client-common";
import { computeProposalStatus } from "../../../src/multisig/internal/utils";
import { SubgraphMultisigProposal } from "../../../src/multisig/internal/types";

describe("multisig-client utils", () => {
  describe("computeProposalStatus", () => {
    it("should return PENDING", () => {
      const endDate = Date.now() / 1000;
      const startDate = (Date.now() / 1000) + 500;

      expect(computeProposalStatus({
        endDate: endDate.toString(),
        startDate: startDate.toString(),
        potentiallyExecutable: false,
        executed: false,
      } as SubgraphMultisigProposal)).toBe(ProposalStatus.PENDING);
    });
    it("should return EXECUTED", () => {
      const endDate = Date.now() / 1000;
      const startDate = (Date.now() / 1000) - 500;

      expect(computeProposalStatus({
        endDate: endDate.toString(),
        startDate: startDate.toString(),
        potentiallyExecutable: false,
        executed: true,
      } as SubgraphMultisigProposal)).toBe(ProposalStatus.EXECUTED);
    });
    it("should return ACTIVE", () => {
      const endDate = (Date.now() / 1000) + 500;
      const startDate = (Date.now() / 1000) - 500;

      expect(computeProposalStatus({
        endDate: endDate.toString(),
        startDate: startDate.toString(),
        potentiallyExecutable: false,
        executed: false,
      } as SubgraphMultisigProposal)).toBe(ProposalStatus.ACTIVE);
    });
    it("should return SUCCEDED if executable = true", () => {
      const endDate = (Date.now() / 1000) + 500;
      const startDate = (Date.now() / 1000) - 500;

      expect(computeProposalStatus({
        endDate: endDate.toString(),
        startDate: startDate.toString(),
        potentiallyExecutable: true,
        executed: false,
      } as SubgraphMultisigProposal)).toBe(ProposalStatus.SUCCEEDED);
    });
    it("should return DEFEATED", () => {
      const endDate = (Date.now() / 1000) - 200;
      const startDate = (Date.now() / 1000) - 500;

      expect(computeProposalStatus({
        endDate: endDate.toString(),
        startDate: startDate.toString(),
        potentiallyExecutable: true,
        executed: false,
      } as SubgraphMultisigProposal)).toBe(ProposalStatus.DEFEATED);
    });
  });
});
