import { Random } from "@aragon/sdk-common";
import { GraphQLClient } from "graphql-request";
import { Context } from "../../context";
import { IClientGraphQLCore } from "../interfaces/core";
import { QueryStatus } from "../graphql-queries";

export class GraphqlModule implements IClientGraphQLCore {

    private _graphql: GraphQLClient[] = [];
    private _graphqlIdx: number = -1;

    constructor(context: Context) {
        if (context.graphql?.length) {
            this._graphql = context.graphql
            this._graphqlIdx = Math.floor(Random.getFloat() * context.graphql.length);
        }
    }

    /**
    * Get the current graphql client
    * without any additional checks
    * @returns {GraphQLClient}
    */
    public getClient(): GraphQLClient {
        if (!this._graphql[this._graphqlIdx]) {
            throw new Error("No graphql endpoints available");
        }
        return this._graphql[this._graphqlIdx];
    }

    /**
     * Starts using the next available IPFS endpoint
     * @returns {void}
     */
    public shiftClient(): void {
        if (!this._graphql?.length) {
            throw new Error("No graphql endpoints available");
        } else if (this._graphql?.length < 2) {
            throw new Error("No other endpoints");
        }
        this._graphqlIdx = (this._graphqlIdx + 1) % this._graphql?.length;
    }

    /**
     * Checks if the current node is online
     * @returns {Promise<boolean>}
     */
    public isUp(): Promise<boolean> {
        return this.getClient().request(QueryStatus).then(res => {
            return !!res._meta?.deployment
        }).catch(() => {
            return false
        })
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
        if (!this._graphql?.length) {
            return Promise.reject(new Error("graphql client is not initialized"));
        }

        for (let i = 0; i < this._graphql?.length; i++) {
            if (await this.isUp()) return;

            this.shiftClient();
        }
        throw new Error("No graphql nodes available");
    }
}