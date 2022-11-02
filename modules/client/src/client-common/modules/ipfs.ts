import { Random } from "@aragon/sdk-common";
import { Context } from "../../client-common/context";
import { IClientIpfsCore } from "../interfaces/core";
import { Client as IpfsClient } from "@aragon/sdk-ipfs";

const clientsMap = new Map<IPFSModule, IpfsClient[]>();
const clientsIdxMap = new Map<IPFSModule, number>();

export class IPFSModule implements IClientIpfsCore {
  constructor(context: Context) {
    if (context.ipfs?.length) {
      clientsIdxMap.set(
        this,
        Math.floor(Random.getFloat() * context.ipfs.length),
      );
      clientsMap.set(this, context.ipfs);
    }
    Object.freeze(IPFSModule.prototype);
    Object.freeze(this);
  }

  private get clients(): IpfsClient[] {
    return clientsMap.get(this) || [];
  }
  private get clientsIdx(): number {
    const idx = clientsIdxMap.get(this);
    if (idx === undefined) {
      return -1;
    }
    return idx;
  }

  public getClient(): IpfsClient {
    if (!this.clients[this.clientsIdx]) {
      throw new Error("No IPFS endpoints available");
    }
    return this.clients[this.clientsIdx];
  }

  /**
   * Starts using the next available IPFS endpoint
   */
  public shiftClient(): void {
    if (!this.clients.length) {
      throw new Error("No IPFS endpoints available");
    } else if (this.clients?.length < 2) {
      throw new Error("No other endpoints");
    }
    clientsIdxMap.set(this, (this.clientsIdx + 1) % this.clients.length);
  }

  /** Returns `true` if the current client is on line */
  public isUp(): Promise<boolean> {
    if (!this.clients?.length) return Promise.resolve(false);
    return this.getClient().nodeInfo().then(() => true).catch(() => false);
  }

  public async ensureOnline(): Promise<void> {
    if (!this.clients.length) {
      return Promise.reject(new Error("IPFS client is not initialized"));
    }

    for (let i = 0; i < this.clients?.length; i++) {
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
