import { Random } from "@aragon/sdk-common";
import { GraphQLClient } from "graphql-request";
import { Context } from "../../client-common/context";
import { QueryStatus } from "../graphql-queries";
import { IClientGraphQLCore } from "../interfaces/core";

const GraphqlMap = new Map<GraphqlModule, GraphQLClient[]>();
const GraphqlIdxMap = new Map<GraphqlModule, number>();

export class GraphqlModule implements IClientGraphQLCore {
  constructor(context: Context) {
    if (context.graphql?.length) {
      GraphqlMap.set(this, context.graphql);
      GraphqlIdxMap.set(
        this,
        Math.floor(Random.getFloat() * context.graphql.length),
      );
    }
    Object.freeze(GraphqlModule.prototype);
    Object.freeze(this);
  }

  get graphql(): GraphQLClient[] {
    return GraphqlMap.get(this) || [];
  }
  get graphqlIdx(): number {
    const idx = GraphqlIdxMap.get(this);
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
    if (!this.graphql.length) {
      throw new Error("No graphql endpoints available");
    }
    return this.graphql[this.graphqlIdx];
  }

  /**
   * Starts using the next available Graphql endpoint
   * @returns {void}
   */
  public shiftClient(): void {
    if (!this.graphql.length) {
      throw new Error("No graphql endpoints available");
    } else if (this.graphql.length < 2) {
      throw new Error("No other endpoints");
    }
    GraphqlIdxMap.set(this, (this.graphqlIdx + 1) % this.graphql.length);
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
    if (!this.graphql.length) {
      return Promise.reject(new Error("graphql client is not initialized"));
    }

    for (let i = 0; i < this.graphql.length; i++) {
      if (await this.isUp()) return;

      this.shiftClient();
    }
    throw new Error("No graphql nodes available");
  }
}
