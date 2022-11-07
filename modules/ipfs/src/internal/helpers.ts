import {
  AddOptions,
  CatOptions,
  NodeInfoOptions,
  PinOptions,
  VersionOptions,
} from "../interfaces";
import {
  AddResponse,
  GenericRecord,
  NodeInfoResponse,
  PinResponse,
  VersionResponse,
} from "../typings";

export namespace Helpers {
  export function getName(file: File | (Blob & { name?: string })) {
    return file.name;
  }

  export function handleError(error: Error & { response?: Response }) {
    if (error.response?.ok) {
      return new Error("Error parsing body");
    } else {
      return error;
    }
  }

  export async function streamToUInt8Array(
    stream: AsyncGenerator<Uint8Array>
  ): Promise<Uint8Array> {
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

  export function toVersionResponse(data: {
    [k: string]: any;
  }): VersionResponse {
    const {
      Version: version,
      Commit: commit,
      Repo: repo,
      System: system,
      Golang: golang,
    } = data;
    return {
      version,
      commit,
      repo,
      system,
      golang,
    };
  }

  export function toNodeInfoResponse(data: {
    [k: string]: any;
  }): NodeInfoResponse {
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

  export function toAddResponse(data: { [k: string]: any }): AddResponse {
    const { Bytes: bytes, Hash: hash, Name: name, Size: size } = data;
    return {
      bytes,
      hash,
      name,
      size,
    };
  }

  export function toPinResponse(data: { [k: string]: any }): PinResponse {
    const { Pins: pins, Progress: progress } = data;
    return { pins, progress };
  }

  export function getVersionParams(
    options: VersionOptions = {}
  ): GenericRecord {
    return encodeParams({
      number: options.number,
      commit: options.commit,
      all: options.all,
    });
  }

  export function getNodeInfoParams(
    options: NodeInfoOptions = {}
  ): GenericRecord {
    return encodeParams({
      arg: options.arg,
      format: options.format,
      "peerid-base": options.peeridBase,
    });
  }

  export function getAddParams(options: AddOptions = {}): GenericRecord {
    return encodeParams({
      quiet: options.quiet,
      quieter: options.quieter,
      silent: options.silent,
      progress: options.progress,
      trickle: options.trickle,
      "only-hash": options.onlyHash,
      "wrap-with-directory": options.wrapWithDirectory,
      chunker: options.chunker,
      pin: options.pin,
      "raw-leaves": options.rawLeaves,
      nocopy: options.noCopy,
      fscache: options.fsCache,
      "cid-version": options.cidVersion,
      hash: options.hash,
      inline: options.inline,
      "inline-limit": options.inlineLimit,
    });
  }

  export function getCatParams(options: CatOptions = {}): GenericRecord {
    return encodeParams({
      offset: options.offset,
      length: options.length,
      progress: options.progress,
    });
  }

  export function getPinOptions(options: PinOptions = {}): GenericRecord {
    return encodeParams({
      recursive: options.recursive,
      progress: options.progress,
    });
  }

  export function getUnpinOptions(options: PinOptions = {}): GenericRecord {
    return encodeParams({
      recursive: options.recursive,
    });
  }

  function encodeParams<T>(
    options: ArrayLike<T> | {}
  ): { [K in keyof T]: Exclude<T[K], undefined> } {
    // @ts-ignore
    return Object.fromEntries(
      Object.entries(options).filter(([, v]) => v != null)
    );
  }
}
