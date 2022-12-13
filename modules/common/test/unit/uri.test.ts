import { InvalidCidError, MultiUri, resolveIpfsCid } from "../../src";

describe("MultiUri Class", () => {
  it("Should get http and ipfs urls", () => {
    const uris = [
      "ipfs://QmSH4tFQd6zqPW9b8ryvtrnbhr9HATyetmWxtGgWUJ33ik",
      "https://example.com",
    ];
    const cid = uris[0].substring(7);
    const multiuri = new MultiUri(uris.join(","));
    expect(multiuri.http.length).toBe(1);
    expect(multiuri.http[0]).toBe(uris[1]);
    expect(multiuri.ipfs!.cid).toBe(cid);
    expect(multiuri.ipfsCid!).toBe(cid);
  });
  it("Should get an ipfs cid", () => {
    const cid = "QmSH4tFQd6zqPW9b8ryvtrnbhr9HATyetmWxtGgWUJ33ik";
    const multiuri = new MultiUri(cid);
    expect(multiuri.http.length).toBe(0);
    expect(multiuri.ipfs!.cid).toBe(cid);
    expect(multiuri.ipfsCid!).toBe(cid);
  });
  it("Should get an invalid ipfs cid and return an empty string", () => {
    const cid = "1nv4l1d_c1d";
    const multiuri = new MultiUri(cid);
    expect(multiuri.http.length).toBe(0);
    expect(multiuri.ipfs).toBe(null);
    expect(multiuri.ipfsCid).toBe(null);
  });
  it("Should get a valid ipfs uri", () => {
    const uri = "ipfs://QmSH4tFQd6zqPW9b8ryvtrnbhr9HATyetmWxtGgWUJ33ik";
    const cid = uri.substring(7);
    const multiuri = new MultiUri(uri);
    expect(multiuri.http.length).toBe(0);
    expect(multiuri.ipfs!.cid).toBe(cid);
    expect(multiuri.ipfsCid).toBe(cid);
  });
  it("Should get multiple http urls", () => {
    const uris = [
      "http://notsecure.com",
      "https://other.io",
      "https://example.com",
    ];
    const multiuri = new MultiUri(uris.join(","));
    expect(multiuri.http.length).toBe(uris.length);
    for (const idx in uris) {
      expect(multiuri.http[idx]).toBe(uris[idx]);
    }
    expect(multiuri.ipfs).toBe(null);
    expect(multiuri.ipfsCid!).toBe(null);
  });
  it("Should get an ipfs uri with path", () => {
    const uri =
      "ipfs://QmSH4tFQd6zqPW9b8ryvtrnbhr9HATyetmWxtGgWUJ33ik/some/path";
    const pathCid = uri.substring(7);
    let pathIdx = pathCid.indexOf("/");
    const cid = pathCid.substring(0,pathIdx)
    const path = pathCid.substring(pathIdx)
    const multiuri = new MultiUri(uri)
    expect(multiuri.http.length).toBe(0);
    expect(multiuri.ipfs!.cid).toBe(cid);
    expect(multiuri.ipfs!.path).toBe(path);
    expect(multiuri.ipfsCid!).toBe(cid);
  });
  it("Should get an ipfs cid with path", () => {
    const pathCid =
      "QmSH4tFQd6zqPW9b8ryvtrnbhr9HATyetmWxtGgWUJ33ik/some/path";
    let pathIdx = pathCid.indexOf("/");
    const cid = pathCid.substring(0,pathIdx)
    const path = pathCid.substring(pathIdx)
    const multiuri = new MultiUri(pathCid)
    expect(multiuri.http.length).toBe(0);
    expect(multiuri.ipfs!.cid).toBe(cid);
    expect(multiuri.ipfs!.path).toBe(path);
    expect(multiuri.ipfsCid!).toBe(cid);
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
