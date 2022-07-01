import { FilterTrackerStatus } from "./enums";

export interface Config {
  /** IPFS Cluster URL */
  url: URL;
  /** Additional headers to be included with requests */
  headers?: Record<string, string>;
}

export interface RequestOptions {
  /**
   * If provided, corresponding request will be aborted when signalled.
   */
  signal?: AbortSignal;
}

export interface StatusOptions extends RequestOptions {
  local?: boolean;
}

export interface StatusAllOptions extends StatusOptions {
  filter?: FilterTrackerStatus[];
  cids?: string[];
}

export interface PeerInfo {
  id: string;
  addresses: string[];
  error?: string;
}

export interface ClusterInfo {
  id: string;
  addresses: string[];
  agentVersion: string;
  protocolVersion: string;
  protocols: string[];
  publicKey: string;
}
