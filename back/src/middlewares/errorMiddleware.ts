import { Request, Response, NextFunction, ErrorRequestHandler } from "express";

import { AppError } from "../eroors/AppError";
import { sendError } from "../libs/response";

/**
 * 最終的なエラーを返す
 */
export const errorMiddleware: ErrorRequestHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const appError = AppError.from(err);

  req.log.error(
    {
      err: appError,
    },
    "エラーログ"
  );

  sendError(res, appError.code);
};
