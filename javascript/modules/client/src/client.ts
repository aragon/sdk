import { Context } from "./context";
import { IClientMethodsModule } from "./modules/methods";
import { IClientEncodingModule } from "./modules/encoding";
import { IClientEstimationModule } from "./modules/estimation";
import { IClientDecodingModule } from "./modules/decoding";
import {
  IClient,
  IClientDecoding,
  IClientEncoding,
  IClientEstimation,
  IClientMethods,
} from "./internal/interfaces/client";
import { ClientCore } from "./internal/core";

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
    this.methods = new IClientMethodsModule(context);
    this.encoding = new IClientEncodingModule(context);
    this.decoding = new IClientDecodingModule(context);
    this.estimation = new IClientEstimationModule(context);
  }
}
