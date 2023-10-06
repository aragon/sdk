import { InvalidCidError, resolveIpfsCid } from "../../src";
import {
  INVALID_IPFS_CID,
  INVALID_IPFS_URI,
  IPFS_CID,
  IPFS_URI,
} from "../constants";

describe("resolveIpfsCid", () => {
  it("Should resolve IPFS CiD's", () => {
    let cid = IPFS_CID;
    let result = resolveIpfsCid(cid);
    expect(result).toEqual(cid);

    cid = IPFS_CID;
    result = resolveIpfsCid(cid);
    expect(result).toEqual(cid);
  });
  it("Should resolve IPFS URI's", () => {
    let cid = IPFS_CID;
    let result = resolveIpfsCid(cid);
    expect(result).toEqual(IPFS_CID);

    cid = IPFS_URI;
    result = resolveIpfsCid(cid);
    expect(result).toEqual(IPFS_CID);

    cid = `${IPFS_URI}/path`;
    result = resolveIpfsCid(cid);
    expect(result).toEqual(
      IPFS_CID,
    );
  });
  it("Should fail to recognize a non-IPFS origin", () => {
    expect(() => resolveIpfsCid(INVALID_IPFS_CID)).toThrow(
      new InvalidCidError(),
    );
    expect(() => resolveIpfsCid(INVALID_IPFS_URI)).toThrow(
      new InvalidCidError(),
    );
    expect(() => resolveIpfsCid(`${INVALID_IPFS_URI}/path`)).toThrow(
      new InvalidCidError(),
    );
  });
});
