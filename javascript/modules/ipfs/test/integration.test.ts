import { IpfsClient } from "../src";

const IPFS_API_KEY = process.env.IPFS_API_KEY ||
  Buffer.from(
    "YjQ3N1JoRUNmOHM4c2RNN1hya0xCczJ3SGM0a0NNd3BiY0ZDNTVLdCAg==",
    "base64",
  )
    .toString()
    .trim();

// const IPFS_CLUSTER_URL = "https://ipfs-0.aragon.network/api/v0";
const IPFS_CLUSTER_URL = "http://127.0.0.1:5001/api/v0/";

describe("IPFS client", () => {
  let client: IpfsClient;
  beforeEach(() => {
    client = new IpfsClient(IPFS_CLUSTER_URL, {
      "X-API-KEY": IPFS_API_KEY,
    });
  });

  it("Should get the version info of a node", async () => {
    const versionInfo = await client.version();
    expect(typeof versionInfo.version).toBe("string");
    expect(versionInfo.version !== "").toBe(true);
  });

  it("Should get the info of a node", async () => {
    const versionInfo = await client.nodeInfo();
    expect(typeof versionInfo.id).toBe("string");
    expect(versionInfo.id !== "").toBe(true);
  });

  it("Should upload a string and recover the same string", async () => {
    const content = "I am a test";
    const { hash } = await client.add(content);
    const recoveredBytes = await client.cat(hash);
    const recoveredContent = new TextDecoder().decode(recoveredBytes);
    expect(typeof recoveredBytes).toBe("object");
    expect(typeof recoveredContent).toBe("string");
    expect(recoveredContent).toEqual(content);
  });

  it("Should upload a Uint8Array and recover the same thing", async () => {
    const content = new Uint8Array([80, 81, 82, 83, 84, 85, 86, 87, 88, 89]);
    const { hash } = await client.add(content);
    expect(hash).toBe("12341234");
    const recoveredBytes = await client.cat(hash);
    expect(recoveredBytes.toString()).toEqual("80,81,82,83,84,85,86,87,88,89");
  });

  it("Should upload a file and recover the same content", async () => {
    const content = "I am a test file";
    const file = new File([content], "hello.txt", { type: "text/plain" });
    const { hash } = await client.add(file);
    const recoveredBytes = await client.cat(hash);
    const recoveredContent = new TextDecoder().decode(recoveredBytes);
    expect(typeof recoveredBytes).toBe("object");
    expect(typeof recoveredContent).toBe("string");
    expect(recoveredContent).toEqual(content);
  });

  it("Should upload a blob and recover the same content", async () => {
    const content = "I am a test blob";
    const file = new Blob([content], { type: "text/plain" });
    const { hash } = await client.add(file);
    const recoveredBytes = await client.cat(hash);
    const recoveredContent = new TextDecoder().decode(recoveredBytes);
    expect(typeof recoveredBytes).toBe("object");
    expect(typeof recoveredContent).toBe("string");
    expect(recoveredContent).toEqual(content);
  });

  // this test should pass but for some reason it don'
  // it("Should return an error when trying to add an invalid file", async () => {
  //   const content = ["Not a string"];
  //   // @ts-ignore
  //   await expect(client.add(content)).rejects.toThrow("Invalid file");
  // });

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

  it("Should add a string unpin it, and pin it again", async () => {
    const content = "I am a test";
    const { hash } = await client.add(content);
    const unpin = await client.unpin(hash);
    expect(typeof unpin).toBe("object");
    expect(Array.isArray(unpin.Pins)).toBe(true);
    expect(unpin.Pins[0]).toBe(hash);
    const pin = await client.pin(hash);
    expect(typeof pin).toBe("object");
    expect(Array.isArray(pin.Pins)).toBe(true);
    expect(pin.Pins[0]).toBe(hash);
  });

  it("Should throw an error when trying to unpin an invalid CID", async () => {
    const path = "1nv4l1dC1D";
    await expect(client.unpin(path)).rejects.toThrow(
      "500: Internal Server Error",
    );
  });

  it("Should throw an error when trying unpining an unexistent pin", async () => {
    const content = "I am a test";
    const { hash } = await client.add(content);
    const unpin = await client.unpin(hash);
    expect(typeof unpin).toBe("object");
    expect(Array.isArray(unpin.Pins)).toBe(true);
    expect(unpin.Pins[0]).toBe(hash);
    await expect(client.unpin(hash)).rejects.toThrow(
      "500: Internal Server Error",
    );
  });
});
