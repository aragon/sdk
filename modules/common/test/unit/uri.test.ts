import { resolveIpfsCid } from "../../src";

describe("IPFS metadata origin", () => {
  it("Should resolve IPFS CiD's", () => {
    let cid = "QmSH4tFQd6zqPW9b8ryvtrnbhr9HATyetmWxtGgWUJ3dik";
    let result = resolveIpfsCid(cid);
    expect(result).toEqual(cid);

    cid = "QmSH4tFQd6zqPW9b8ryvtrnbhr9HATyetmWxtGgWUJ3dij";
    result = resolveIpfsCid(cid);
    expect(result).toEqual(cid);
  });
  it("Should resolve IPFS URI's", () => {
    let cid = "ipfs://QmSH4tFQd6zqPW9b8ryvtrnbhr9HATyetmWxtGgWUJ3dik";
    let result = resolveIpfsCid(cid);
    expect(result).toEqual("QmSH4tFQd6zqPW9b8ryvtrnbhr9HATyetmWxtGgWUJ3dik");

    cid = "ipfs://QmSH4tFQd6zqPW9b8ryvtrnbhr9HATyetmWxtGgWUJ3dij";
    result = resolveIpfsCid(cid);
    expect(result).toEqual("QmSH4tFQd6zqPW9b8ryvtrnbhr9HATyetmWxtGgWUJ3dij");

    cid = "ipfs://QmSH4tFQd6zqPW9b8ryvtrnbhr9HATyetmWxtGgWUJ3dij/abd";
    result = resolveIpfsCid(cid);
    expect(result).toEqual(
      "QmSH4tFQd6zqPW9b8ryvtrnbhr9HATyetmWxtGgWUJ3dij",
    );
  });
  it("Should fail to recognize a non-IPFS origin", () => {
    expect(() => resolveIpfsCid("hello")).toThrow(
      "The value does not contain a valid CiD",
    );
    expect(() => resolveIpfsCid("ipfs://hello")).toThrow(
      "The value does not contain a valid CiD",
    );
    expect(() => resolveIpfsCid("ipfs://hello/abc")).toThrow(
      "The value does not contain a valid CiD",
    );
  });
});
