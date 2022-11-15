import { BigNumber } from "@ethersproject/bignumber";
import { arrayify } from "@ethersproject/bytes";
import { ERC20VotingEncoding } from "../../../src/erc20Voting/internal/encoding";

describe("Erc20Voting", () => {
  describe("Encoding", () => {
    it("should encode createProposal", () => {
      const encoded = ERC20VotingEncoding.createProposal(
        "0x52045E6f5161E817E2C4c4b1dD1dADACc0cb3822",
        {
          _actions: [
            {
              to: "0x6b4584A05EB28016aDf0B0A692DD71073Fe4B593",
              value: BigNumber.from("0"),
              data: arrayify("0x123456"),
            },
          ],
          _choice: 3,
          _endDate: 56789,
          _executeIfDecided: false,
          _proposalMetadata: arrayify("0x11223344"),
          _startDate: 1234,
        }
      );

      expect(encoded.to).toBe("0x52045E6f5161E817E2C4c4b1dD1dADACc0cb3822");
      expect(encoded.value).toBe(0);
      expect(encoded.data).toMatchObject(
        arrayify(
          "0xe910689700000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000004d2000000000000000000000000000000000000000000000000000000000000ddd50000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000041122334400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000200000000000000000000000006b4584a05eb28016adf0b0a692dd71073fe4b5930000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000031234560000000000000000000000000000000000000000000000000000000000"
        )
      );
    });

    it("should encode execute", () => {
      const encoded = ERC20VotingEncoding.execute(
        "0x52045E6f5161E817E2C4c4b1dD1dADACc0cb3822",
        5
      );
      expect(encoded.to).toBe("0x52045E6f5161E817E2C4c4b1dD1dADACc0cb3822");
      expect(encoded.value).toBe(0);
      expect(encoded.data).toMatchObject(
        arrayify(
          "0xfe0d94c10000000000000000000000000000000000000000000000000000000000000005"
        )
      );
    });

    it("should encode setConfiguration", () => {
      const encoded = ERC20VotingEncoding.setConfiguration(
        "0x52045E6f5161E817E2C4c4b1dD1dADACc0cb3822",
        {
          _minDuration: 56,
          _supportRequiredPct: 34,
          _participationRequiredPct: 12,
        }
      );
      expect(encoded.to).toBe("0x52045E6f5161E817E2C4c4b1dD1dADACc0cb3822");
      expect(encoded.value).toBe(0);
      expect(encoded.data).toMatchObject(
        arrayify(
          "0x9b979e2f000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000220000000000000000000000000000000000000000000000000000000000000038"
        )
      );
    });

    it("should encode vote", () => {
      const encoded = ERC20VotingEncoding.vote(
        "0x52045E6f5161E817E2C4c4b1dD1dADACc0cb3822",
        {
          _proposalId: 1234,
          _executesIfDecided: true,
          _choice: 1,
        }
      );

      expect(encoded.to).toBe("0x52045E6f5161E817E2C4c4b1dD1dADACc0cb3822");
      expect(encoded.value).toBe(0);
      expect(encoded.data).toMatchObject(
        arrayify(
          "0xce6366c400000000000000000000000000000000000000000000000000000000000004d200000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001"
        )
      );
    });
  });
});
