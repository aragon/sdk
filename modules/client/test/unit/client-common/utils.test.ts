import { computeProposalStatus, ProposalStatus } from "../../../src";

describe("client-common utils", () => {
  describe("computeProposalStatus", () => {
    it("should return PENDING", () => {
      const endDate = Date.now() / 1000;
      const startDate = (Date.now() / 1000) + 500;

      expect(computeProposalStatus({
        endDate: endDate.toString(),
        startDate: startDate.toString(),
        executable: false,
        executed: false,
        earlyExecutable: false,
      })).toBe(ProposalStatus.PENDING);
    });
    it("should return EXECUTED", () => {
      const endDate = Date.now() / 1000;
      const startDate = (Date.now() / 1000) - 500;

      expect(computeProposalStatus({
        endDate: endDate.toString(),
        startDate: startDate.toString(),
        executable: false,
        executed: true,
        earlyExecutable: false,
      })).toBe(ProposalStatus.EXECUTED);
    });
    it("should return ACTIVE", () => {
      const endDate = (Date.now() / 1000) + 500;
      const startDate = (Date.now() / 1000) - 500;

      expect(computeProposalStatus({
        endDate: endDate.toString(),
        startDate: startDate.toString(),
        executable: false,
        executed: false,
        earlyExecutable: false,
      })).toBe(ProposalStatus.ACTIVE);
    });
    it("should return SUCCEDED if executable = true", () => {
      const endDate = Date.now() / 1000;
      const startDate = (Date.now() / 1000) - 500;

      expect(computeProposalStatus({
        endDate: endDate.toString(),
        startDate: startDate.toString(),
        executable: true,
        executed: false,
        earlyExecutable: false,
      })).toBe(ProposalStatus.SUCCEEDED);
    });
    it("should return SUCCEDED if earlyExecutable = true", () => {
      const endDate = (Date.now() / 1000) + 500;
      const startDate = (Date.now() / 1000) - 500;

      expect(computeProposalStatus({
        endDate: endDate.toString(),
        startDate: startDate.toString(),
        executable: false,
        executed: false,
        earlyExecutable: true,
      })).toBe(ProposalStatus.SUCCEEDED);
    });
    it("should return DEFEATED", () => {
      const endDate = (Date.now() / 1000) - 200;
      const startDate = (Date.now() / 1000) - 500;

      expect(computeProposalStatus({
        endDate: endDate.toString(),
        startDate: startDate.toString(),
        executable: false,
        executed: false,
        earlyExecutable: false,
      })).toBe(ProposalStatus.DEFEATED);
    });
  });
});
