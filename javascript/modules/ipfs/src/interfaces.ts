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

export interface VersionOptions extends RequestOptions {
  number?: boolean;
  commit?: boolean;
  repo?: boolean;
  all?: boolean;
}

export interface NodeInfoOptions extends RequestOptions {
  arg?: string;
  format?: string;
  peeridBase?: string;
}

export interface AddOptions extends RequestOptions {
  // Write minimal output.
  quiet?: boolean;
  // Write only final hash
  quieter?: boolean;
  // Write no output
  silent?: boolean;
  // Stream progress data
  progress?: boolean;
  // Use trickle-dag format for dag generation
  trickle?: boolean;
  // Only chunk and hash - do not write to disk
  onlyHash?: boolean;
  // Wrap files with a directory object
  wrapWithDirectory?: boolean;
  // Chunking algorithm, size-[bytes], rabin-[min]-[avg]-[max] or buzhash. Default: size-262144
  chunker?: string;
  // Pin this object when adding. Default: true
  pin?: boolean;
  // Use raw blocks for leaf nodes.
  rawLeaves?: boolean;
  // Add the file using filestore. Implies raw-leaves. (experimental).
  noCopy?: boolean;
  // Check the filestore for pre-existing blocks.
  fsCache?: boolean;
  // CID version. Defaults to 0 unless an option that depends on CIDv1 is passed. Passing version 1 will cause the raw-leaves option to default to true
  cidVersion?: 0 | 1;
  // Hash function to use. Implies CIDv1 if not sha2-256. (experimental). Default: sha2-256
  hash?: string;
  // Inline small blocks into CIDs. (experimental).
  inline?: boolean;
  // Maximum block size to inline. (experimental). Default: 32
  inlineLimit?: number;
}
export interface CatOptions extends RequestOptions {
  offset?: number;
  length?: number;
  progress?: boolean;
}
export interface PinOptions extends RequestOptions {
  recursive?: boolean;
  progress?: boolean;
}
export interface UnpinOptions extends RequestOptions {
  recursive?: boolean;
}
