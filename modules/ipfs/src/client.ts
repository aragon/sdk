import { API } from "./internal/api";
import {
  AddResponse,
  NodeInfoResponse,
  PinResponse,
  VersionResponse,
} from "./typings";
import {
  AddOptions,
  CatOptions,
  PinOptions,
  RequestOptions,
  UnpinOptions,
  VersionOptions,
} from "./interfaces";

export class Client {
  readonly url: URL;
  readonly headers: Record<string, string>;

  /** Create a new instance of the IPFS cluster client */
  constructor(url: string | URL, headers?: Record<string, string>) {
    const newUrl = typeof url === "string" ? new URL(url) : url;
    if (!newUrl.pathname.endsWith("/")) {
      newUrl.pathname += "/";
    }
    this.url = newUrl;

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
  add(
    file: File | Blob | Uint8Array | string,
    options?: AddOptions,
  ): Promise<AddResponse> {
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
   * Untracks a path on the cluster.
   */
  unpin(path: string, options?: UnpinOptions): Promise<PinResponse> {
    return API.unpin(this, path, options);
  }
}
