import { Request } from "express";
import { Logger } from "pino";

import { CurrentUser } from "./currentUser";

export type RequestContext = {
  log: Logger;
  reqId: string;
  user?: CurrentUser;
};

/**
 * RequestからRequestContextを作成
 */
export const createRequestContext = (req: Request): RequestContext => {
  return {
    log: req.log,
    reqId: req.reqId,
    user: req.user,
  };
};
