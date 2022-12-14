import { IClientAdminEstimation } from "../../interfaces";
import { ClientCore, ContextPlugin } from "../../../client-common";

export class ClientAdminEstimation extends ClientCore
  implements IClientAdminEstimation {
  constructor(context: ContextPlugin) {
    super(context);
  }
}
