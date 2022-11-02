import { Random } from "@aragon/sdk-common";
import { GraphQLClient } from "graphql-request";
import { Context } from "../../client-common/context";
import { QueryStatus } from "../graphql-queries";
import { IClientGraphQLCore } from "../interfaces/core";

enum Keys {
  Graphql,
  GraphqlIdx,
}
const GraphqlModuleMap = new Map<Keys, any>([
  [Keys.Graphql, [] as GraphQLClient[]],
  [Keys.GraphqlIdx, -1],
]);

export class GraphqlModule implements IClientGraphQLCore {
  constructor(context: Context) {
    if (context.graphql?.length) {
      GraphqlModuleMap.set(Keys.Graphql, context.graphql);
      GraphqlModuleMap.set(
        Keys.Graphql,
        Math.floor(Random.getFloat() * context.graphql.length),
      );
    }
    Object.freeze(GraphqlModule.prototype);
  }

  /**
   * Get the current graphql client
   * without any additional checks
   * @returns {GraphQLClient}
   */
  public getClient(): GraphQLClient {
    const graphql = GraphqlModuleMap.get(Keys.Graphql);
    const graphqlIdx = GraphqlModuleMap.get(Keys.GraphqlIdx);
    if (!graphql[graphqlIdx]) {
      throw new Error("No graphql endpoints available");
    }
    return graphql[graphqlIdx];
  }

  /**
   * Starts using the next available Graphql endpoint
   * @returns {void}
   */
  public shiftClient(): void {
    const graphql = GraphqlModuleMap.get(Keys.Graphql);
    const graphqlIdx = GraphqlModuleMap.get(Keys.GraphqlIdx);
    if (!graphql?.length) {
      throw new Error("No graphql endpoints available");
    } else if (graphql?.length < 2) {
      throw new Error("No other endpoints");
    }
    GraphqlModuleMap.set(Keys.GraphqlIdx, (graphqlIdx + 1) % graphql?.length);
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
    const graphql = GraphqlModuleMap.get(Keys.Graphql);
    if (!graphql?.length) {
      return Promise.reject(new Error("graphql client is not initialized"));
    }

    for (let i = 0; i < graphql?.length; i++) {
      if (await this.isUp()) return;

      this.shiftClient();
    }
    throw new Error("No graphql nodes available");
  }
}
