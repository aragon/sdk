import { PinType, TrackerStatus } from "./enums";
import { RequestOptions, StatusOptions } from "./interfaces";

export type AddResponse = {
  cid: string;
  name?: string;
  size?: number | string;
  bytes?: number | string;
};

export type AddManyResponse = AddResponse[];

export interface PinOptions extends RequestOptions {
  replicationFactorMin?: number;
  replicationFactorMax?: number;
  name?: string;
  mode?: "recursive" | "direct";
  shardSize?: number;
  /**
   * The peers to which this pin should be allocated.
   */
  userAllocations?: string[];
  expireAt?: Date;
  metadata?: Record<string, string>;
  pinUpdate?: string;
  /**
   * List of multiaddrs known to provide the data.
   */
  origins?: string[];
}

/**
 * Groups options specific to the ipfs-adder, which builds UnixFS DAGs with the
 * input files.
 */
export type IPFSAddParams = {
  layout?: string;
  chunker?: string;
  rawLeaves?: boolean;
  progress?: boolean;
  cidVersion?: 0 | 1;
  hashFun?: string;
  noCopy?: boolean;
};

/**
 * Contains all of the configurable parameters needed to specify the importing
 * process of a file being added to an IPFS Cluster.
 */
export type AddParams =
  & PinOptions
  & IPFSAddParams
  & {
    local?: boolean;
    recursive?: boolean;
    hidden?: boolean;
    wrap?: boolean;
    shard?: boolean;
    streamChannels?: boolean;
    format?: string;
  };

export type AddCarParams = PinOptions & {
  streamChannels?: boolean;
  local?: boolean;
};

// RESPONSES

export type PinResponse = {
  replicationFactorMin: number;
  replicationFactorMax: number;
  name: string;
  mode: "recursive" | "direct";
  shardSize: number;
  /**
   * The peers to which this pin is allocated.
   */
  userAllocations?: string[];
  expireAt: Date;
  metadata?: Record<string, string>;
  pinUpdate?: string;
  cid: string;
  /**
   * Specifies which sort of Pin object we are dealing with. In practice, the
   * type decides how a Pin object is treated by the PinTracker.
   */
  type: PinType;
  /**
   * The peers to which this pin is allocated.
   */
  allocations: string[];
  /**
   * Indicates how deep a pin should be pinned, with -1 meaning "to the bottom",
   * or "recursive".
   */
  maxDepth: number;
  /**
   * We carry a reference CID to this pin. For ClusterDAGs, it is the MetaPin
   * CID. For the MetaPin it is the ClusterDAG CID. For Shards, it is the
   * previous shard CID. When not needed it is undefined.
   */
  reference?: string;
};

export type RecoverOptions = StatusOptions;

export type StatusResponse = {
  cid: string;
  name: string;
  peerMap: Record<string, PinInfo>;
};

export type PinInfo = {
  peerName: string;
  ipfsPeerId: string;
  status: TrackerStatus;
  timestamp: Date;
  error?: string;
};

export type GenericRecord = Record<
  string,
  string | number | boolean | null | undefined
>;
