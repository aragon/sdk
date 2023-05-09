import { Context } from "./client-common/context";
import { ClientMethods } from "./internal/client/methods";
import { ClientEncoding } from "./internal/client/encoding";
import { ClientEstimation } from "./internal/client/estimation";
import { ClientDecoding } from "./internal/client/decoding";
import {
  IClient,
  IClientDecoding,
  IClientEncoding,
  IClientEstimation,
  IClientMethods,
} from "./interfaces";
import { ClientCore } from "./client-common/core";

/**
 * Provider a generic client with high level methods to manage and interact with DAO's
 */
export class Client extends ClientCore implements IClient {
  public methods: IClientMethods;
  public encoding: IClientEncoding;
  public decoding: IClientDecoding;
  public estimation: IClientEstimation;

  constructor(context: Context) {
    super(context);
    this.methods = new ClientMethods(context);
    this.encoding = new ClientEncoding(context);
    this.decoding = new ClientDecoding(context);
    this.estimation = new ClientEstimation(context);
  }
}
