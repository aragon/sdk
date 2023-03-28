import { IClientConfig } from "../interfaces";
import { GenericRecord } from "../typings";
import fetch from "isomorphic-unfetch";
import { InvalidResponseError, MissingBodyeError } from "../errors";

export namespace Network {
  /**
   * Performs a request and returns a JSON object with the response
   */
  export async function request(
    config: IClientConfig,
    path: string,
    {
      method,
      params,
      body,
      signal,
    }: {
      method?: string;
      params?: GenericRecord;
      body?: BodyInit;
      signal?: AbortSignal;
    },
  ) {
    const { url, headers } = config;
    const endpoint = new URL(path, url);
    for (const [key, value] of Object.entries(params || {})) {
      if (value != null) {
        endpoint.searchParams.set(key, String(value));
      }
    }

    const response = await fetch(endpoint.href, {
      method: method || "GET",
      headers,
      body,
      signal,
    });

    if (!response.ok) {
      throw new InvalidResponseError(response);
    }
    return response.json();
  }

  export async function* stream(
    { url, headers }: IClientConfig,
    path: string,
    {
      method,
      params,
      body,
      signal,
    }: {
      method?: string;
      params?: GenericRecord;
      body?: BodyInit;
      signal?: AbortSignal;
    },
  ) {
    const endpoint = new URL(path, url);
    for (const [key, value] of Object.entries(params || {})) {
      if (value != null) {
        endpoint.searchParams.set(key, String(value));
      }
    }

    method = method || "GET";
    const res = await fetch(endpoint.href, { method, headers, body, signal });

    if (!res.ok) {
      throw new InvalidResponseError(res);
    }

    if (!res.body) {
      throw new MissingBodyeError(res);
    }
    yield* streamedBytes(res.body);
  }

  async function* streamedBytes(
    stream: ReadableStream<Uint8Array>,
  ): AsyncGenerator<Uint8Array> {
    let error = null;
    const reader = stream.getReader();
    try {
      while (true) {
        const result = await reader.read();
        if (result.done) {
          break;
        }
        yield result.value;
      }
    } catch (err) {
      error = err;
    } finally {
      reader.cancel();
      reader.releaseLock();
    }
    if (error) throw error;
  }
}
