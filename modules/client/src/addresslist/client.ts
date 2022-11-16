import { Context } from "../client-common";
import { AddresslistDecoding } from "./internal/decoding";
import { AddresslistEncoding } from "./internal/encoding";
import { AddresslistEstimation } from "./internal/estimation";
import { AddresslistMethods } from "./internal/methods";

export class Addresslist {
  public methods: AddresslistMethods;
  public estimation: AddresslistEstimation;
  public encoding: AddresslistEncoding;
  public decoding: AddresslistDecoding;

  constructor(context: Context) {
    this.methods = new AddresslistMethods(context);
    this.estimation = new AddresslistEstimation(context);
    this.encoding = AddresslistEncoding;
    this.decoding = AddresslistDecoding;
  }
}
