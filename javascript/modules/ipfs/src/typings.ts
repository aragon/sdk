export type VersionResponse = {
  version: string;
  commit: string;
  repo: string;
  golang: string;
  system: string;
};

export type NodeInfoResponse = {
  id: string;
  addresses: string[];
  agentVersion: string;
  protocolVersion: string;
  protocols: string[];
  publicKey: string;
};

export type AddResponse = {
  hash: string;
  name: string;
  size: string;
  bytes: number;
};

export type PinResponse = {
  Pins: string[];
  Progress?: number;
};

export type GenericRecord = Record<
  string,
  string | number | boolean | null | undefined
>;
