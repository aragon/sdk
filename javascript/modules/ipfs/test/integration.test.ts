import { IpfsClient } from "../src";

const IPFS_API_KEY = process.env.IPFS_API_KEY ||
  Buffer.from(
    "YjQ3N1JoRUNmOHM4c2RNN1hya0xCczJ3SGM0a0NNd3BiY0ZDNTVLdCAg==",
    "base64",
  )
    .toString()
    .trim();

const IPFS_CLUSTER_URL = "https://testing-ipfs-0.aragon.network/api/v0";
// const IPFS_CLUSTER_URL = "http://127.0.0.1:5001/api/v0/";

describe("IPFS client", () => {
  let client: IpfsClient;
  beforeEach(() => {
    client = new IpfsClient(IPFS_CLUSTER_URL, {
      "X-API-KEY": IPFS_API_KEY,
    });
  });

  it("Should get the info of a node", async () => {
    const versionInfo = await client.nodeInfo();
    expect(typeof versionInfo.id).toBe("string");
    expect(versionInfo.id !== "").toBe(true);
  });

  it("Should upload a string and recover the same string", async () => {
    const content = "I am a test";
    const { hash } = await client.add(content);
    expect(hash).toBe("QmeJ4kRW21RRgjywi9ydvY44kfx71x2WbRq7ik5xh5zBZK");
    const recoveredBytes = await client.cat(hash);
    const recoveredContent = new TextDecoder().decode(recoveredBytes);
    expect(typeof recoveredBytes).toBe("object");
    expect(typeof recoveredContent).toBe("string");
    expect(recoveredContent).toEqual(content);
  });

  it("Should upload a Uint8Array and recover the same thing", async () => {
    const content = new Uint8Array([80, 81, 82, 83, 84, 85, 86, 87, 88, 89]);
    const { hash } = await client.add(content);
    expect(hash).toBe("QmZF4kLy8CXzoDt7PQCpLLN97E8D5xx3inxm5bjBXdoNGP");
    const recoveredBytes = await client.cat(hash);
    expect(recoveredBytes.toString()).toEqual("80,81,82,83,84,85,86,87,88,89");
  });

  it("Should upload a file and recover the same content", async () => {
    const content = "I am a test file";
    const file = new File([content], "hello.txt", { type: "text/plain" });
    const { hash } = await client.add(file);
    expect(hash).toBe("Qmf8RhZg6dVgThtYfmiSYKK63ZjSirv2RAZs3jwhNBcMsc");
    const recoveredBytes = await client.cat(hash);
    const recoveredContent = new TextDecoder().decode(recoveredBytes);
    expect(typeof recoveredBytes).toBe("object");
    expect(typeof recoveredContent).toBe("string");
    expect(recoveredContent).toEqual(content);
  });

  it("Should upload a blob and recover the same content", async () => {
    const content = "I am a test blob";
    const blob = new Blob([content], { type: "text/plain" });
    const { hash } = await client.add(blob);
    expect(hash).toBe("QmZ3Hyrq1wgfq5aadwRfesNbcEBAczecxrtFMiMVjsfyN8");
    const recoveredBytes = await client.cat(hash);
    const recoveredContent = new TextDecoder().decode(recoveredBytes);
    expect(typeof recoveredBytes).toBe("object");
    expect(typeof recoveredContent).toBe("string");
    expect(recoveredContent).toEqual(content);
  });

  it("The same content should produce the same CiD no matter the format", async () => {
    const string = "I am a test message";
    const buffer = new Uint8Array(Buffer.from(string));
    const file = new File([string], "hello.txt", { type: "text/plain" });
    const blob = new Blob([string], { type: "text/plain" });

    const { hash: hash1 } = await client.add(string);
    const { hash: hash2 } = await client.add(buffer);
    const { hash: hash3 } = await client.add(file);
    const { hash: hash4 } = await client.add(blob);

    expect(hash1).toBe("QmYiXFNmFH5ffBofzna52px2CSBXVdNg1eP2A2tyuJ8a5z");
    expect(hash2).toBe("QmYiXFNmFH5ffBofzna52px2CSBXVdNg1eP2A2tyuJ8a5z");
    expect(hash3).toBe("QmYiXFNmFH5ffBofzna52px2CSBXVdNg1eP2A2tyuJ8a5z");
    expect(hash4).toBe("QmYiXFNmFH5ffBofzna52px2CSBXVdNg1eP2A2tyuJ8a5z");

    const recoveredBytes = await client.cat(hash1);
    const recoveredContent = new TextDecoder().decode(recoveredBytes);
    expect(typeof recoveredBytes).toBe("object");
    expect(typeof recoveredContent).toBe("string");
    expect(recoveredContent).toEqual(string);
  });

  it("Should return an error when trying to cat an empty string", async () => {
    const path = "";
    await expect(client.cat(path)).rejects.toThrow("Invalid CID");
  });

  it("Should return an error when trying to cat an invalid cid", async () => {
    const path = "1nv4l1dC1D";
    await expect(client.cat(path)).rejects.toThrow(
      "500: Internal Server Error",
    );
  });

  // Not currently allowed by the IPFS cluster proxy

  // it("Should add a string and pin it", async () => {
  //   const content = "I am a test";
  //   const { hash } = await client.add(content);

  //   const pin = await client.pin(hash);
  //   expect(typeof pin).toBe("object");
  //   expect(Array.isArray(pin.pins)).toBe(true);
  //   expect(pin.pins[0]).toBe(hash);
  // });

  // it("Should throw an error when trying to pin an invalid CID", async () => {
  //   const path = "1nv4l1dC1D";
  //   await expect(client.pin(path)).rejects.toThrow(
  //     "500: Internal Server Error",
  //   );
  // });
});
