import { Config } from "../interfaces";
import { GenericRecord } from "../typings";
import fetch from "isomorphic-unfetch";

export namespace Network {
  export async function request(
    config: Config,
    path: string,
    { method, params, body, signal }: {
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
      throw Object.assign(
        new Error(`${response.status}: ${response.statusText}`),
        { response },
      );
    }
    return response.json();
  }

  export async function* stream(
    { url, headers }: Config,
    path: string,
    { method, params, body, signal }: {
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
      const msg = `${res.status}: ${res.statusText}`;
      throw Object.assign(new Error(msg), { response: res });
    }

    if (!res.body) {
      throw Object.assign(new Error("Missing response body"), {
        response: res,
      });
    }

    yield* streamedJsonParse(res.body);
  }

  async function* streamedJsonParse(stream: ReadableStream<Uint8Array>) {
    const reader = stream.getReader();
    const matcher = /\r?\n/;
    const decoder = new TextDecoder("utf8");
    let buffer = "";
    try {
      while (true) {
        const result = await reader.read();

        if (result.done) {
          break;
        }

        buffer += decoder.decode(result.value, { stream: true });
        const parts = buffer.split(matcher);
        buffer = parts.pop() || "";
        for (const part of parts) yield JSON.parse(part);
      }
    } finally {
      reader.cancel();
      reader.releaseLock();
    }
    buffer += decoder.decode(undefined, { stream: false });

    if (buffer) yield JSON.parse(buffer);
  }
}
