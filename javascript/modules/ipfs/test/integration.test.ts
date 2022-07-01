import { IpfsClient } from "../src";

const IPFS_API_KEY = process.env.IPFS_API_KEY ||
  Buffer.from(
    "YjQ3N1JoRUNmOHM4c2RNN1hya0xCczJ3SGM0a0NNd3BiY0ZDNTVLdCAg==",
    "base64",
  ).toString().trim();

// const IPFS_CLUSTER_URL = "https://testing-ipfs-0.aragon.network:5001";
const IPFS_CLUSTER_URL = "http://127.0.0.1:5001/api/v0/";

describe("IPFS client", () => {
  let client: IpfsClient;
  beforeEach(() => {
    client = new IpfsClient(IPFS_CLUSTER_URL, {
      "X-API-KEY": IPFS_API_KEY,
    });
  });

  it("Should have an API token to test the proxy", () => {
    expect(IPFS_API_KEY.length).toBeGreaterThan(0);
  });

  it("Should connect to a IPFS cluster node", async () => {
    const version = await client.version();

    expect(typeof version).toEqual("string");
    expect(version.length).toBeGreaterThan(0);

    const info = await client.nodeInfo();
    expect(info).toBeTruthy();
    expect(info.id.length).toBeGreaterThan(0);
    expect(info.addresses.length).toBeGreaterThan(0);
    expect(info.agentVersion.length).toBeGreaterThan(0);
    expect(info.protocolVersion).toBeTruthy();
    expect(info.protocols.length).toBeGreaterThan(0);
  });

  it("Should upload a string and recover the same string", async () => {
    let content = new Blob(["I am a test"]);
    const { cid } = await client.add(content);
    expect(cid).toBe("1234");

    // const recoveredString = await client.fetchString(cid);
    // const recoveredBytes = await client.fetchBytes(cid);
    // const decodedString = new TextDecoder().decode(recoveredBytes);

    // expect(typeof recoveredBytes).toBe("object");
    // expect(typeof recoveredString).toBe("string");
    // expect(typeof decodedString).toBe("string");
    // expect(recoveredString).toEqual(originalStr);
    // expect(decodedString).toEqual(originalStr);
  });

  it("Should connect to a IPFS node and upload bytes and recover the same string", async () => {
    //   const context = new Context(contextParams);
    //   const client = new ClientDaoERC20Voting(context);
    //   const originalBytes = new Uint8Array([
    //     72,
    //     101,
    //     108,
    //     108,
    //     111,
    //     32,
    //     84,
    //     104,
    //     101,
    //     114,
    //     101,
    //     32,
    //     58,
    //     41,
    //   ]);
    //   const cid = await client.pin(originalBytes);
    //   const recoveredString = await client.fetchString(cid);
    //   const recoveredBytes = await client.fetchBytes(cid);
    //   const decodedString = new TextDecoder().decode(recoveredBytes);

    //   expect(typeof recoveredBytes).toBe("object");
    //   expect(typeof recoveredString).toBe("string");
    //   expect(typeof decodedString).toBe("string");
    //   expect(recoveredString).toEqual("Hello There :)");
    //   expect(decodedString).toEqual("Hello There :)");
    // });
    // it("Should work when an IPFS node is functional", async () => {
    //   const context = new Context(contextParams);
    //   const client = new ClientDaoERC20Voting(context);
    //   const isOnline = await client.isIpfsNodeUp();

    //   expect(isOnline).toEqual(true);
    // });
    // it("Should fail when an IPFS node is not working", async () => {
    //   const context = new Context(
    //     Object.assign({}, contextParams, {
    //       ipfsNodes: [{ url: "https://does-not-exist-here.random.hb/1234" }],
    //     }),
    //   );
    //   const client = new ClientDaoERC20Voting(context);
    //   const isOnline = await client.isIpfsNodeUp();

    //   expect(isOnline).toEqual(false);
  });
});
