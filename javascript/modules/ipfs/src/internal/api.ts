import { IpfsClient } from "./client";
import {
  ClusterInfo,
  Config,
  RequestOptions,
  StatusAllOptions,
  StatusOptions,
} from "../interfaces";
import { Network } from "./network";
import {
  AddManyResponse,
  AddParams,
  AddResponse,
  GenericRecord,
  PinOptions,
  PinResponse,
  RecoverOptions,
  StatusResponse,
} from "../typings";

export namespace API {
  /** Gets cluster version */
  export function version(
    cluster: IpfsClient,
    { signal }: RequestOptions = {},
  ): Promise<string> {
    return Network.request(cluster, "version", {
      method: "POST",
      signal,
    }).then((result) => {
      if (typeof result.Version !== "string") {
        throw new Error(`Invalid response: ${JSON.stringify(result)}`);
      }

      return result.Version;
    });
  }

  /** Gets the cluster information */
  export function nodeInfo(
    cluster: IpfsClient,
    { signal } = {} as RequestOptions,
  ): Promise<ClusterInfo> {
    return Network.request(cluster, "id", {
      method: "POST",
      signal,
    }).then((result) => {
      const errorMsg = result.error || result.ipfs?.error || "";
      if (errorMsg.length > 0) {
        throw new Error("The request failed: " + errorMsg);
      }

      return Adapters.toClusterInfo(result);
    });
  }

  /** Import a file to the cluster */
  export function add(
    cluster: Config,
    file: File | Blob,
    options: AddParams = {},
  ): Promise<AddResponse> {
    if (!(file instanceof File) && !(file instanceof Blob)) {
      throw new Error("Invalid file");
    }

    const body = new FormData();
    body.append("file", file, getName(file) || "file");

    const params = Encoding.fromAddParams(options);

    return Network
      .request(cluster, "add", {
        params,
        method: "POST",
        body,
        signal: options.signal,
      })
      .then((response) => {
        const data = params["stream-channels"] ? response : response[0];
        return { ...data, cid: data.cid };
      })
      .catch((err) => {
        const error = err as Error & { response?: Response };
        if (error.response?.ok) {
          throw new Error("Could not parse the response body");
        } else {
          throw error;
        }
      });
  }

  export async function addMany(
    cluster: Config,
    files: Iterable<File | Blob>,
    options: PinOptions = {},
  ): Promise<AddManyResponse> {
    const body = new FormData();

    for (const f of files) {
      if (!(f instanceof File) && !(f instanceof Blob)) {
        throw new Error("invalid file");
      }
      body.append("file", f, getName(f));
    }

    const results = await Network.request(cluster, "add", {
      params: {
        ...Encoding.fromAddParams(options),
        "stream-channels": false,
        "wrap-with-directory": true,
      },
      method: "POST",
      body,
      signal: options.signal,
    });

    return results;
  }

  export function addCAR(
    cluster: Config,
    car: Blob,
    options: AddParams = {},
  ): Promise<AddResponse> {
    return API.add(cluster, car, { ...options, format: "car" });
  }

  export async function cat(
    cluster: Config,
    cid: string,
    options: RequestOptions = {},
  ): Promise<Uint8Array> {
    if (!cid) {
      throw new Error("Invalid CID");
    }

    const stream = Network.stream(cluster, "cat", {
      method: "POST",
      params: {
        arg: cid,
      },
      signal: options.signal,
    });

    const chunks: Uint8Array[] = [];
    let byteCount = 0;
    for await (const chunk of stream) {
      chunks.push(chunk);
      byteCount += chunk.length;
    }

    const mergedArray = new Uint8Array(byteCount);
    let lastIndex = 0;
    for (const chunk of chunks) {
      mergedArray.set(chunk, lastIndex);
      lastIndex += chunk.length;
    }
    return mergedArray;
  }

  /** Pins the given CID or IPFS/IPNS path to the cluster */
  export function pin(
    cluster: IpfsClient,
    cid: string,
    options: PinOptions = {},
  ): Promise<PinResponse> {
    const path = cid.startsWith("/") ? `pins${cid}` : `pins/${cid}`;

    return Network.request(cluster, path, {
      params: Encoding.fromPinOptions(options),
      method: "POST",
      signal: options.signal,
    }).then((data) => Adapters.toPinResponse(data));
  }

  /** Unpins the given CID or IPFS/IPNS path from the cluster */
  export function unpin(
    cluster: IpfsClient,
    cid: string,
    { signal }: RequestOptions = {},
  ) {
    const path = cid.startsWith("/") ? `pins${cid}` : `pins/${cid}`;
    return Network.request(cluster, path, {
      method: "DELETE",
      signal,
    }).then((data) => Adapters.toPinResponse(data));
  }
  export function status(
    cluster: Config,
    cid: string,
    { local, signal }: StatusOptions = {},
  ): Promise<StatusResponse> {
    const path = `pins/${encodeURIComponent(cid)}`;

    return Network.request(cluster, path, {
      params: local != null ? { local } : undefined,
      signal,
    }).then((data) => Adapters.toStatusResponse(data));
  }

  export async function statusAll(
    cluster: Config,
    { local, filter, cids, signal }: StatusAllOptions = {},
  ): Promise<StatusResponse[]> {
    const stream = Network.stream(cluster, "pins", {
      params: {
        local,
        filter: filter ? String(filter) : null,
        cids: cids ? String(cids) : null,
      },
      signal,
    });
    const statuses = [];
    for await (const d of stream) {
      statuses.push(Adapters.toStatusResponse(d));
    }
    return statuses;
  }

  export function allocation(
    cluster: Config,
    cid: string,
    { signal }: RequestOptions = {},
  ): Promise<PinResponse> {
    const path = `allocations/${encodeURIComponent(cid)}`;
    return Network.request(cluster, path, { signal }).then((data) =>
      Adapters.toPinResponse(data)
    );
  }

  export function recover(
    cluster: IpfsClient,
    cid: string,
    { local, signal }: RecoverOptions = {},
  ) {
    const path = `pins/${encodeURIComponent(cid)}/recover`;

    return Network.request(cluster, path, {
      method: "POST",
      params: local != null ? { local } : undefined,
      signal,
    }).then((data) => Adapters.toStatusResponse(data));
  }

  export function metricNames(
    cluster: Config,
    { signal }: RequestOptions = {},
  ): Promise<string[]> {
    return Network.request(cluster, "monitor/metrics", { signal });
  }

  export async function peersInfo(
    cluster: IpfsClient,
    options: RequestOptions = {},
  ): Promise<ClusterInfo[]> {
    const stream = Network.stream(cluster, "peers", { signal: options.signal });
    const infos = [];
    for await (const d of stream) {
      infos.push(Adapters.toClusterInfo(d));
    }
    return infos;
  }
}

namespace Encoding {
  export const fromAddParams = (options: AddParams = {}): GenericRecord =>
    encodeParams({
      ...fromPinOptions(options),
      local: options.local,
      recursive: options.recursive,
      hidden: options.hidden,
      wrap: options.wrap,
      shard: options.shard,
      // stream-channels=false means buffer entire response in cluster before returning.
      // MAY avoid weird edge-cases with prematurely closed streams
      // see: https://github.com/web3-storage/web3.storage/issues/323
      "stream-channels": options.streamChannels != null
        ? options.streamChannels
        : false,
      format: options.format,
      // IPFSAddParams
      layout: options.layout,

      chunker: options.chunker,
      "raw-leaves": options.rawLeaves != null ? options.rawLeaves : true,
      progress: options.progress,
      "cid-version": options.cidVersion != null ? options.cidVersion : 1,
      hash: options.hashFun,
      "no-copy": options.noCopy,
    });

  export const fromPinOptions = (options: PinOptions = {}): GenericRecord =>
    encodeParams({
      name: options.name,
      mode: options.mode,
      "replication-min": options.replicationFactorMin,
      "replication-max": options.replicationFactorMax,
      "shard-size": options.shardSize,
      "user-allocations": options.userAllocations?.join(","),
      "expire-at": options.expireAt?.toISOString(),
      "pin-update": options.pinUpdate,
      origins: options.origins?.join(","),
      ...fromMetadata(options.metadata || {}),
    });

  export const fromMetadata = (metadata: Record<string, string> = {}) =>
    Object.fromEntries(
      Object.entries(metadata).map(([k, v]) => [`meta-${k}`, v]),
    );

  function encodeParams<T>(
    options: T,
  ): { [K in keyof T]: Exclude<T[K], undefined> } {
    // @ts-ignore
    return Object.fromEntries(
      Object.entries(options).filter(([, v]) => v != null),
    );
  }
}

namespace Adapters {
  export function toPinResponse(data: { [k: string]: any }): PinResponse {
    return {
      replicationFactorMin: data.replication_factor_min,
      replicationFactorMax: data.replication_factor_max,
      name: data.name,
      mode: data.mode,
      shardSize: data.shard_size,
      userAllocations: data.user_allocations,
      expireAt: new Date(data.expire_at),
      metadata: data.metadata,
      pinUpdate: data.pin_update,
      cid: data.cid,
      type: data.type,
      allocations: data.allocations,
      maxDepth: data.max_depth,
      reference: data.reference,
    };
  }

  export function toStatusResponse(data: { [k: string]: any }): StatusResponse {
    let peerMap = data.peer_map;
    if (peerMap) {
      peerMap = Object.fromEntries(
        Object.entries(peerMap).map(([k, v]: [string, any]) => [
          k,
          {
            peerName: v.peername,
            ipfsPeerId: v.ipfs_peer_id,
            status: v.status,
            timestamp: new Date(v.timestamp),
            error: v.error,
          },
        ]),
      );
    }
    return { cid: data.cid, name: data.name, peerMap };
  }

  export function toClusterInfo(data: { [k: string]: any }): ClusterInfo {
    const {
      ID: id,
      Addresses: addresses,
      AgentVersion: agentVersion,
      ProtocolVersion: protocolVersion,
      Protocols: protocols,
      PublicKey: publicKey,
    } = data;

    return {
      id,
      addresses,
      agentVersion,
      protocolVersion,
      protocols,
      publicKey,
    };
  }
}

const getName = (file: File | (Blob & { name?: string })) => file.name;
