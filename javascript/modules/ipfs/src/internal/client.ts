import { API } from "./api";
import {
  AddManyResponse,
  AddParams,
  AddResponse,
  PinOptions,
  PinResponse,
  StatusResponse,
} from "../typings";
import {
  ClusterInfo,
  RequestOptions,
  StatusAllOptions,
  StatusOptions,
} from "../interfaces";

export class IpfsClient {
  readonly url: URL;
  readonly headers: Record<string, string>;

  /** Create a new instance of the IPFS cluster client */
  constructor(
    url: string,
    headers?: Record<string, string>,
  ) {
    this.url = new URL(url);
    this.headers = headers || {};
  }

  /**
   * Get Cluster version.
   * @param {API.RequestOptions} [options]
   */
  version(options?: RequestOptions) {
    return API.version(this, options);
  }

  /**
   * Get Cluster peer information.
   */
  nodeInfo(options?: RequestOptions): Promise<ClusterInfo> {
    return API.nodeInfo(this, options);
  }

  /**
   * Get a list of Cluster peer info.
   */
  peersInfo(options?: RequestOptions): Promise<ClusterInfo[]> {
    return API.peersInfo(this, options);
  }

  /**
   * Imports a file to the cluster. First argument must be a `File` or `Blob`.
   * Note: by default this module uses v1 CIDs and raw leaves enabled.
   */
  add(file: File | Blob, options?: AddParams) {
    return API.add(this, file, options);
  }

  addMany(
    files: Iterable<File | Blob>,
    options?: PinOptions,
  ): Promise<AddManyResponse> {
    return API.addMany(this, files, options);
  }

  /**
   * Imports blocks encoded in the given CAR file and pins them (similarly to
   * ipfs dag import). At the moment only CAR files MUST have only one root (the
   * one that will be pinned). . CAR files allow adding arbitrary IPLD-DAGs
   * through the Cluster API.
   */
  addCAR(car: Blob, options?: AddParams): Promise<AddResponse> {
    return API.addCAR(this, car, { ...options, format: "car" });
  }

  /** Fetches the contents behind the cid and returns them as an Uint8Array */
  cat(cid: string, options?: RequestOptions): Promise<Uint8Array> {
    return API.cat(this, cid, options);
  }

  /**
   * Tracks a CID with the given replication factor and a name for
   * human-friendliness.
   */
  pin(cid: string, options?: PinOptions): Promise<PinResponse> {
    return API.pin(this, cid, options);
  }

  /**
   * Untracks a CID from cluster.
   */
  unpin(cid: string, options?: RequestOptions): Promise<PinResponse> {
    return API.unpin(this, cid, options);
  }

  /**
   * Returns the current IPFS state for a given CID.
   */
  status(cid: string, options?: StatusOptions): Promise<StatusResponse> {
    return API.status(this, cid, options);
  }

  /**
   * Status of all tracked CIDs. Note: this is an expensive operation. Use the optional filters when possible.
   */
  statusAll(options?: StatusAllOptions): Promise<StatusResponse[]> {
    return API.statusAll(this, options);
  }

  /**
   * Returns the current allocation for a given CID.
   */
  allocation(cid: string, options?: RequestOptions): Promise<PinResponse> {
    return API.allocation(this, cid, options);
  }

  /**
   * Re-triggers pin or unpin IPFS operations for a CID in error state.
   */
  recover(cid: string, options?: RequestOptions): Promise<StatusResponse> {
    return API.recover(this, cid, options);
  }

  /**
   * Get a list of metric types known to the peer.
   */
  metricNames(options?: RequestOptions): Promise<string[]> {
    return API.metricNames(this, options);
  }
}
