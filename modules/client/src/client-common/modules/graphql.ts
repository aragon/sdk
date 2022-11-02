import { Random } from "@aragon/sdk-common";
import { GraphQLClient } from "graphql-request";
import { Context } from "../../client-common/context";
import { QueryStatus } from "../graphql-queries";
import { IClientGraphQLCore } from "../interfaces/core";

const clientsMap = new Map<GraphqlModule, GraphQLClient[]>();
const clientsIdxMap = new Map<GraphqlModule, number>();

export class GraphqlModule implements IClientGraphQLCore {
  constructor(context: Context) {
    // Storing client data in the private module's scope to prevent external mutation
    if (context.graphql?.length) {
      clientsMap.set(this, context.graphql);
      clientsIdxMap.set(
        this,
        Math.floor(Random.getFloat() * context.graphql.length),
      );
    }
    Object.freeze(GraphqlModule.prototype);
    Object.freeze(this);
  }

  private get clients(): GraphQLClient[] {
    return clientsMap.get(this) || [];
  }
  private get clientIdx(): number {
    const idx = clientsIdxMap.get(this);
    if (idx === undefined) {
      return -1;
    }
    return idx;
  }
  /**
   * Get the current graphql client
   * without any additional checks
   * @returns {GraphQLClient}
   */
  public getClient(): GraphQLClient {
    if (!this.clients.length) {
      throw new Error("No graphql endpoints available");
    }
    return this.clients[this.clientIdx];
  }

  /**
   * Starts using the next available Graphql endpoint
   * @returns {void}
   */
  public shiftClient(): void {
    if (!this.clients.length) {
      throw new Error("No graphql endpoints available");
    } else if (this.clients.length < 2) {
      throw new Error("No other endpoints");
    }
    clientsIdxMap.set(this, (this.clientIdx + 1) % this.clients.length);
  }

  /**
   * Checks if the current node is online
   * @returns {Promise<boolean>}
   */
  public isUp(): Promise<boolean> {
    return this.getClient().request(QueryStatus).then((res) => {
      return !!res._meta?.deployment;
    }).catch(() => {
      return false;
    });
  }

  /**
   * Ensures that the graphql is online.
   * If the current node is not online
   * it will shift to the next one and
   * repeat until it finds an online
   * node. In the case that there are no
   * nodes or none of them is available
   * it will throw an error
   * @returns {Promise<void>}
   */
  public async ensureOnline(): Promise<void> {
    if (!this.clients.length) {
      return Promise.reject(new Error("graphql client is not initialized"));
    }

    for (let i = 0; i < this.clients.length; i++) {
      if (await this.isUp()) return;

      this.shiftClient();
    }
    throw new Error("No graphql nodes available");
  }
}
