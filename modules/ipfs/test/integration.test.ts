import { Client, InvalidResponseError } from "../src";
import {
  ADD_CONTENT,
  ADD_RESPONSE,
  CAT_RESPONSE,
  NODE_INFO_RESPONSE,
} from "./constants";
import { Network } from "../src/internal/network";

const IPFS_API_KEY = process.env.IPFS_API_KEY ||
  Buffer.from(
    "YjQ3N1JoRUNmOHM4c2RNN1hya0xCczJ3SGM0a0NNd3BiY0ZDNTVLdCAg==",
    "base64",
  )
    .toString()
    .trim();

const IPFS_CLUSTER_URL = "https://test.ipfs.aragon.network/api/v0";
// const IPFS_CLUSTER_URL = "http://127.0.0.1:5001/api/v0/";

describe("IPFS client", () => {
  let client: Client;
  let networkSpy: jest.SpyInstance;
  beforeAll(() => {
    client = new Client(IPFS_CLUSTER_URL, {
      "X-API-KEY": IPFS_API_KEY,
    });
    networkSpy = jest.spyOn(Network, "request");
  });
  afterEach(() => {
    networkSpy.mockReset();
  });

  // NOTE: Not currently allowed by the IPFS cluster Proxy

  // it("Should get the version info of a node", async () => {
  //   const versionInfo = await client.version();
  //   expect(typeof versionInfo.version).toBe("string");
  //   expect(versionInfo.version !== "").toBe(true);
  // });

  it("Should get the info of a node", async () => {
    networkSpy.mockResolvedValueOnce(NODE_INFO_RESPONSE);
    const versionInfo = await client.nodeInfo();
    expect(typeof versionInfo.id).toBe("string");
    expect(versionInfo.id).toBe(NODE_INFO_RESPONSE.ID);
  });

  it("Should upload a string and recover the same string", async () => {
    networkSpy.mockResolvedValueOnce(ADD_RESPONSE)
      .mockResolvedValueOnce(
        CAT_RESPONSE,
      );
    const { hash } = await client.add(CAT_RESPONSE);
    expect(hash).toBe(ADD_RESPONSE.Hash);
    const recoveredBytes = await client.cat(hash);
    const recoveredContent = new TextDecoder().decode(recoveredBytes);
    expect(typeof recoveredBytes).toBe("object");
    expect(typeof recoveredContent).toBe("string");
    expect(recoveredContent).toEqual(ADD_CONTENT);
  });

  it("Should upload a Uint8Array and recover the same thing", async () => {
    networkSpy.mockResolvedValueOnce(ADD_RESPONSE)
      .mockResolvedValueOnce(
        CAT_RESPONSE,
      );
    const { hash } = await client.add(CAT_RESPONSE);
    expect(hash).toBe(ADD_RESPONSE.Hash);
    const recoveredBytes = await client.cat(hash);
    expect(recoveredBytes.toString()).toEqual(CAT_RESPONSE.toString());
  });

  it("Should upload a file and recover the same content", async () => {
    const file = new File([ADD_CONTENT], "hello.txt", { type: "text/plain" });
    networkSpy.mockResolvedValueOnce(ADD_RESPONSE)
      .mockResolvedValueOnce(
        CAT_RESPONSE,
      );
    const { hash } = await client.add(file);
    expect(hash).toBe(ADD_RESPONSE.Hash);
    const recoveredBytes = await client.cat(hash);
    const recoveredContent = new TextDecoder().decode(recoveredBytes);
    expect(typeof recoveredBytes).toBe("object");
    expect(typeof recoveredContent).toBe("string");
    expect(recoveredContent).toEqual(ADD_CONTENT);
  });

  it("Should upload a blob and recover the same content", async () => {
    const blob = new Blob([ADD_CONTENT], { type: "text/plain" });
    networkSpy.mockResolvedValueOnce(ADD_RESPONSE)
      .mockResolvedValueOnce(
        CAT_RESPONSE,
      );
    const { hash } = await client.add(blob);
    expect(hash).toBe(ADD_RESPONSE.Hash);
    const recoveredBytes = await client.cat(hash);
    const recoveredContent = new TextDecoder().decode(recoveredBytes);
    expect(typeof recoveredBytes).toBe("object");
    expect(typeof recoveredContent).toBe("string");
    expect(recoveredContent).toEqual(ADD_CONTENT);
  });

  it("The same content should produce the same CiD no matter the format", async () => {
    const buffer = new Uint8Array(Buffer.from(ADD_CONTENT));
    const file = new File([ADD_CONTENT], "hello.txt", { type: "text/plain" });
    const blob = new Blob([ADD_CONTENT], { type: "text/plain" });

    networkSpy.mockResolvedValue(ADD_RESPONSE);
    const { hash: hash1 } = await client.add(ADD_CONTENT);
    const { hash: hash2 } = await client.add(buffer);
    const { hash: hash3 } = await client.add(file);
    const { hash: hash4 } = await client.add(blob);

    expect(hash1).toBe(ADD_RESPONSE.Hash);
    expect(hash2).toBe(ADD_RESPONSE.Hash);
    expect(hash3).toBe(ADD_RESPONSE.Hash);
    expect(hash4).toBe(ADD_RESPONSE.Hash);

    networkSpy.mockReset();
    networkSpy.mockResolvedValue(CAT_RESPONSE);
    const recoveredBytes = await client.cat(hash1);
    const recoveredContent = new TextDecoder().decode(recoveredBytes);
    expect(typeof recoveredBytes).toBe("object");
    expect(typeof recoveredContent).toBe("string");
    expect(recoveredContent).toEqual(ADD_CONTENT);
  });

  it("Should return an error when trying to cat an empty string", async () => {
    const path = "";
    await expect(client.cat(path)).rejects.toThrow("Invalid CID");
  });

  it("Should return an error when trying to cat an invalid cid", async () => {
    const path = "1nv4l1dC1D";
    await expect(client.cat(path)).rejects.toThrow(
      InvalidResponseError,
    );
  });

  // NOTE: Not currently allowed by the IPFS cluster Proxy

  // it("Should add a string unpin it, and pin it again", async () => {
  //   const content = "I am a test";
  //   const { hash } = await client.add(content);

  //   const unpin = await client.unpin(hash);
  //   expect(typeof unpin).toBe("object");
  //   expect(Array.isArray(unpin.pins)).toBe(true);
  //   expect(unpin.pins[0]).toBe(hash);

  //   const pin = await client.pin(hash);
  //   expect(typeof pin).toBe("object");
  //   expect(Array.isArray(pin.pins)).toBe(true);
  //   expect(pin.pins[0]).toBe(hash);
  // });

  // it("Should throw an error when trying to unpin an invalid CID", async () => {
  //   const path = "1nv4l1dC1D";
  //   await expect(client.unpin(path)).rejects.toThrow(
  //     "500: Internal Server Error",
  //   );
  // });

  // it("Should throw an error when trying unpining an unexistent pin", async () => {
  //   const content = "I am a test";
  //   const { hash } = await client.add(content);
  //   const unpin = await client.unpin(hash);
  //   expect(typeof unpin).toBe("object");
  //   expect(Array.isArray(unpin.pins)).toBe(true);
  //   expect(unpin.pins[0]).toBe(hash);
  //   await expect(client.unpin(hash)).rejects.toThrow(
  //     "500: Internal Server Error",
  //   );
  // });
});
