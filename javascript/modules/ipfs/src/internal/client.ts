import { API } from "./api";
import {
  AddResponse,
  NodeInfoResponse,
  PinResponse,
  VersionResponse,
} from "../typings";
import {
  AddOptions,
  CatOptions,
  RequestOptions,
  VersionOptions,
  PinOptions,
  UnpinOptions,
} from "../interfaces";

export class IpfsClient {
  readonly url: URL;
  readonly headers: Record<string, string>;

  /** Create a new instance of the IPFS cluster client */
  constructor(url: string, headers?: Record<string, string>) {
    this.url = new URL(url);
    this.headers = headers || {};
  }

  /**
   * Get Cluster version.
   * @param {API.RequestOptions} [options]
   */
  version(options?: VersionOptions): Promise<VersionResponse> {
    return API.version(this, options);
  }

  /**
   * Get Cluster peer information.
   */
  nodeInfo(options?: RequestOptions): Promise<NodeInfoResponse> {
    return API.nodeInfo(this, options);
  }

  /**
   * Imports a file to the cluster. First argument must be a `File` or `Blob`.
   * Note: by default this module uses v1 CIDs and raw leaves enabled.
   */
  add(file: File | Blob | string, options?: AddOptions): Promise<AddResponse> {
    return API.add(this, file, options);
  }

  /** Fetches the contents behind the cid and returns them as an Uint8Array */
  cat(path: string, options?: CatOptions): Promise<Uint8Array> {
    return API.cat(this, path, options);
  }
  /**
   * Tracks a path with the given replication factor and a name for
   * human-friendliness.
   */
  pin(path: string, options?: PinOptions): Promise<PinResponse> {
    return API.pin(this, path, options);
  }

  /**
   * Untracks a path from cluster.
   */
  unpin(path: string, options?: UnpinOptions): Promise<PinResponse> {
    return API.unpin(this, path, options);
  }
}
