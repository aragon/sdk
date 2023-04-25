import { Context } from "./context";
import {
  ContextPluginParams,
} from "./interfaces/context";

export class ContextPlugin extends Context {
  // INTERNAL CONTEXT STATE

  /**
   * @param {ContextPluginParams} params The parameters for the client context
   *
   * @constructor
   */
  constructor(params?: Partial<ContextPluginParams>) {
    super(params)
  }

  /**
   * Generate a plugin context from a client clontext and a plugin address
   *
   * @param {Context} ctx
   * @param {string} pluginAddress
   * @return {*}  {ContextPlugin}
   * @memberof ContextPlugin
   */
  static fromContext(ctx: Context): ContextPlugin {
    const ctxPlugin = new ContextPlugin({});
    Object.assign(ctxPlugin, ctx);
    return ctxPlugin;
  }

  set(contextParams: Partial<ContextPluginParams>) {
    super.set(contextParams);
  }

}
