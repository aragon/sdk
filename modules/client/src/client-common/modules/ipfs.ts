import { Random } from "@aragon/sdk-common";
import { Context } from "../../client-common/context";
import { IClientIpfsCore } from "../interfaces/core";
import { Client as IpfsClient } from "@aragon/sdk-ipfs";

enum Keys {
  IPFS,
  IPFSIdx,
}
const IPFSModuleMap = new Map<Keys, any>([
  [Keys.IPFS, [] as IpfsClient[]],
  [Keys.IPFSIdx, -1],
]);
export class IPFSModule implements IClientIpfsCore {
  constructor(context: Context) {
    if (context.ipfs?.length) {
      IPFSModuleMap.set(Keys.IPFS, context.ipfs);
      IPFSModuleMap.set(
        Keys.IPFSIdx,
        Math.floor(Random.getFloat() * context.ipfs.length),
      );
    }
    Object.freeze(IPFSModule.prototype);
  }

  public getClient(): IpfsClient {
    const ipfs = IPFSModuleMap.get(Keys.IPFS);
    const ipfsIdx = IPFSModuleMap.get(Keys.IPFSIdx);
    if (!ipfs[ipfsIdx]) {
      throw new Error("No IPFS endpoints available");
    }
    return ipfs[ipfsIdx];
  }

  /**
   * Starts using the next available IPFS endpoint
   */
  public shiftClient(): void {
    const ipfs = IPFSModuleMap.get(Keys.IPFS);
    const ipfsIdx = IPFSModuleMap.get(Keys.IPFSIdx);
    if (!ipfs?.length) {
      throw new Error("No IPFS endpoints available");
    } else if (ipfs?.length < 2) {
      throw new Error("No other endpoints");
    }
    IPFSModuleMap.set(Keys.IPFSIdx, (ipfsIdx + 1) % ipfs?.length);
  }

  /** Returns `true` if the current client is on line */
  public isUp(): Promise<boolean> {
    if (!IPFSModuleMap.get(Keys.IPFS)?.length) return Promise.resolve(false);
    return this.getClient().nodeInfo().then(() => true).catch(() => false);
  }

  public async ensureOnline(): Promise<void> {
    const ipfs = IPFSModuleMap.get(Keys.IPFS);
    if (!ipfs?.length) {
      return Promise.reject(new Error("IPFS client is not initialized"));
    }

    for (let i = 0; i < ipfs?.length; i++) {
      if (await this.isUp()) return;

      this.shiftClient();
    }
    throw new Error("No IPFS nodes available");
  }

  public getOnlineClient(): Promise<IpfsClient> {
    return this.ensureOnline().then(() => this.getClient());
  }

  // IPFS METHODS

  public async add(input: string | Uint8Array): Promise<string> {
    return this.getOnlineClient().then(
      (client) => client.add(input).then((res) => res.hash),
    ).catch((e) => {
      throw new Error(`Could not upload data: ${e?.message || ""}`);
    });
  }

  public fetchBytes(cid: string): Promise<Uint8Array | undefined> {
    return this.getOnlineClient().then((client) => client.cat(cid));
  }

  public fetchString(cid: string): Promise<string> {
    return this.fetchBytes(cid)
      .then((bytes) => new TextDecoder().decode(bytes))
      .catch((e) => {
        throw new Error(`Could not upload data: ${e?.message || ""}`);
      });
  }
}
