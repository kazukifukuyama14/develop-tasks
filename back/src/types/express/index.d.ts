import { Logger } from "pino";

import { CurrentUser } from "../currentUser";

declare module "express-serve-static-core" {
  interface Request {
    log: Logger;
    reqId: string;
    user?: CurrentUser;
  }
}
