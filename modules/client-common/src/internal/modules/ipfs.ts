import {
  Client as IpfsClient,
  ClientError,
  PinResponse,
} from "@aragon/sdk-ipfs";
import {
  ClientNotInitializedError,
  IpfsError,
  NoNodesAvailableError,
  runAndRetry,
  DataDecodingError
} from "@aragon/sdk-common";
import { IClientIpfsCore } from "../interfaces";
import { Context } from "../../context";

export class IPFSModule implements IClientIpfsCore {
  private clientIdx: number = -1;
  private clients: IpfsClient[] = [];
  constructor(context: Context) {
    // Storing client data in the private module's scope to prevent external mutation
    if (context.ipfs?.length) {
      this.clients = context.ipfs;
      this.clientIdx = Math.floor(Math.random() * context.ipfs.length);
    }
  }

  public getClient(): IpfsClient {
    if (!this.clients.length || !this.clients[this.clientIdx]) {
      throw new ClientNotInitializedError("ipfs");
    }
    return this.clients[this.clientIdx];
  }

  /**
   * Starts using the next available IPFS endpoint
   */
  public shiftClient(): void {
    if (!this.clients.length) {
      throw new ClientNotInitializedError("ipfs");
    } else if (this.clients?.length < 2) {
      throw new NoNodesAvailableError("ipfs");
    }
    this.clientIdx = (this.clientIdx + 1) % this.clients.length;
  }

  /** Returns `true` if the current client is on line */
  public isUp(): Promise<boolean> {
    if (!this.clients?.length) return Promise.resolve(false);
    return this.getClient().nodeInfo().then(() => true).catch(() => false);
  }

  public async ensureOnline(): Promise<void> {
    if (!this.clients.length) {
      throw new ClientNotInitializedError("ipfs");
    }
    for (let i = 0; i < this.clients?.length; i++) {
      if (await this.isUp()) return;
      this.shiftClient();
    }
    throw new NoNodesAvailableError("ipfs");
  }

  public getOnlineClient(): Promise<IpfsClient> {
    return this.ensureOnline().then(() => this.getClient());
  }

  // IPFS METHODS

  public async add(input: string | Uint8Array): Promise<string> {
    return this.runAndRetryHelper(() => this.getClient().add(input)).then((
      res,
    ) => res.hash);
  }

  public pin(input: string): Promise<PinResponse> {
    return this.runAndRetryHelper(() => this.getClient().pin(input));
  }

  public fetchBytes(cid: string): Promise<Uint8Array | undefined> {
    return this.runAndRetryHelper(() => this.getClient().cat(cid));
  }

  private runAndRetryHelper<T>(f: () => Promise<T>): Promise<T> {
    if (!this.clients.length) {
      throw new ClientNotInitializedError("ipfs");
    }
    let retries = this.clients.length;
    return runAndRetry({
      func: f,
      onFail: (e: Error) => {
        if (e instanceof ClientError) {
          if (e.response.status < 500) {
            // If the error code is not a 5XX means the
            // error is not generated by the server
            throw new IpfsError(e);
          }
        }
        retries--;
        this.shiftClient();
      },
      shouldRetry: () => retries > 0,
    });
  }

  public fetchString(cid: string): Promise<string> {
    return this.fetchBytes(cid)
      .then((bytes) => new TextDecoder().decode(bytes))
      .catch((e) => {
        throw new DataDecodingError(e.message);
      });
  }
}
