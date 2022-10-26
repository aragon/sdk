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
} from "./internal/interfaces";
import { ClientCore } from "./client-common/core";

/**
 * Provider a generic client with high level methods to manage and interact with DAO's
 */
export class Client extends ClientCore implements IClient {
  private privateMethods: IClientMethods;
  private privateEncoding: IClientEncoding;
  private privateDecoding: IClientDecoding;
  private privateEstimation: IClientEstimation;

  constructor(context: Context) {
    super(context);
    this.privateMethods = new ClientMethods(context);
    this.privateEncoding = new ClientEncoding(context);
    this.privateDecoding = new ClientDecoding(context);
    this.privateEstimation = new ClientEstimation(context);
  }
  get methods(): IClientMethods {
    return this.privateMethods;
  }
  get encoding(): IClientEncoding {
    return this.privateEncoding;
  }
  get decoding(): IClientDecoding {
    return this.privateDecoding;
  }
  get estimation(): IClientEstimation {
    return this.privateEstimation;
  }
}
