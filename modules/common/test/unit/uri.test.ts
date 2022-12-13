import { InvalidCidError, MultiUri, resolveIpfsCid } from "../../src";

describe("MultiUri Class", () => {
  it("Should resolve IPFS CiD's", () => {
    const uris = [
      "ipfs://QmSH4tFQd6zqPW9b8ryvtrnbhr9HATyetmWxtGgWUJ33ik",
      "https://example.com",
    ];
    const multiuri = new MultiUri(uris.join(","));
    expect(multiuri.http.length).toBe(1);
    expect(multiuri.http[0]).toBe(uris[1]);
    expect(uris[0].includes(multiuri.ipfs!.cid)).toBe(true);
    expect(uris[0].includes(multiuri.ipfsCid!)).toBe(true);
  });
});
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
      new InvalidCidError(),
    );
    expect(() => resolveIpfsCid("ipfs://hello")).toThrow(
      new InvalidCidError(),
    );
    expect(() => resolveIpfsCid("ipfs://hello/abc")).toThrow(
      new InvalidCidError(),
    );
  });
});
