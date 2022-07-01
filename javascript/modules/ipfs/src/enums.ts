export const PIN_TYPE_BAD = 1;
export const PIN_TYPE_DATA = 2;
export const PIN_TYPE_META = 3;
export const PIN_TYPE_CLUSTER_DAG = 4;
export const PIN_TYPE_SHARD = 5;

export const TRACKER_STATUS_UNDEFINED = "undefined";
export const TRACKER_STATUS_CLUSTER_ERROR = "cluster_error";
export const TRACKER_STATUS_PIN_ERROR = "pin_error";
export const TRACKER_STATUS_UNPIN_ERROR = "unpin_error";
export const TRACKER_STATUS_PINNED = "pinned";
export const TRACKER_STATUS_PINNING = "pinning";
export const TRACKER_STATUS_UNPINNING = "unpinning";
export const TRACKER_STATUS_UNPINNED = "unpinned";
export const TRACKER_STATUS_REMOTE = "remote";
export const TRACKER_STATUS_PIN_QUEUED = "pin_queued";
export const TRACKER_STATUS_UNPIN_QUEUED = "unpin_queued";
export const TRACKER_STATUS_SHARDED = "sharded";
export const TRACKER_STATUS_UNEXPECTEDLY_UNPINNED = "unexpectedly_unpinned";

/** Bad type showing up anywhere indicates a bug */
export type PinTypeBad = 1;
/**
 * Data is a regular, non-sharded pin. It is pinned recursively.
 * It has no associated reference.
 */
export type PinTypeData = 2;
/**
 * Meta tracks the original CID of a sharded DAG. Its Reference points to the
 * Cluster DAG CID.
 */
export type PinTypeMeta = 3;
/**
 * ClusterDAG pins carry the CID of the root node that points to all the
 * shard-root-nodes of the shards in which a DAG has been divided. Its
 * Reference carries the MetaType CID.
 * ClusterDAGType pins are pinned directly everywhere.
 */
export type PinTypeClusterDag = 4;
/**
 * Shard pins carry the root CID of a shard, which points to individual blocks
 * on the original DAG that the user is adding, which has been sharded. They
 * carry a Reference to the previous shard. ShardTypes are pinned with
 * MaxDepth=1 (root and direct children only).
 */
export type PinTypeShard = 5;

export type PinType =
  | PinTypeBad
  | PinTypeData
  | PinTypeMeta
  | PinTypeClusterDag
  | PinTypeShard;

/** IPFSStatus should never be this value. When used as a filter it means "all". */
export type TrackerStatusUndefined = "undefined";
/** The cluster node is offline or not responding. */
export type TrackerStatusClusterError = "cluster_error";
/** An error occurred pinning. */
export type TrackerStatusPinError = "pin_error";
/** An error occurred unpinning. */
export type TrackerStatusUnpinError = "unpin_error";
/** The IPFS daemon has pinned the item. */
export type TrackerStatusPinned = "pinned";
/** The IPFS daemon is currently pinning the item. */
export type TrackerStatusPinning = "pinning";
/** The IPFS daemon is currently unpinning the item. */
export type TrackerStatusUnpinning = "unpinning";
/** The IPFS daemon is not pinning the item. */
export type TrackerStatusUnpinned = "unpinned";
/** The IPFS daemon is not pinning the item but it is being tracked. */
export type TrackerStatusRemote = "remote";
/** The item has been queued for pinning on the IPFS daemon. */
export type TrackerStatusPinQueued = "pin_queued";
/** The item has been queued for unpinning on the IPFS daemon. */
export type TrackerStatusUnpinQueued = "unpin_queued";
/**
 * The IPFS daemon is not pinning the item through this CID but it is tracked
 * in a cluster dag
 */
export type TrackerStatusSharded = "sharded";
/**
 * The item is in the state and should be pinned, but it is however not pinned
 * and not queued/pinning.
 */
export type TrackerStatusUnexpectedlyUnpinned = "unexpectedly_unpinned";

export type TrackerStatus =
  | TrackerStatusClusterError
  | TrackerStatusPinError
  | TrackerStatusUnpinError
  | TrackerStatusPinned
  | TrackerStatusPinning
  | TrackerStatusUnpinning
  | TrackerStatusUnpinned
  | TrackerStatusRemote
  | TrackerStatusPinQueued
  | TrackerStatusUnpinQueued
  | TrackerStatusSharded
  | TrackerStatusUnexpectedlyUnpinned;

export type FilterTrackerStatus = TrackerStatus | TrackerStatusUndefined;
